package com.liquidtodo.app.data;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Room-backed state repository.
 *
 * The WebView UI keeps its existing JSON contract, but tasks and tags are
 * stored in two real Room tables. Tags are the "one" side of the one-to-many
 * relationship; deleting a tag uses ON DELETE SET_NULL and never removes tasks.
 */
public class TodoRepository {

    private static final String PREFS = "liquid_todo_prefs";
    private static final String LEGACY_STATE = "todo_state_v1";
    private static final String THEME_KEY = "todo_theme";
    private static final String TAG_SCHEMA_KEY = "tag_schema_v1";
    private static final String SORT_KEY = "list_sort";
    private static final String LANG_KEY = "app_lang";
    private static final String INITIALIZED_KEY = "room_initialized";
    private static final int MAX_TAGS = 5;
    private static final Pattern COLOR = Pattern.compile("^#[0-9A-Fa-f]{6}$");
    private static final String[] PALETTE = {
            "#6A8DFF", "#EC87B6", "#9A7CF2", "#4CC4AE",
            "#F0A35E", "#F26D7D", "#7FB3CD", "#A6A6B8"
    };

    private final SharedPreferences prefs;
    private final AppDatabase database;

    public TodoRepository(Context context, SharedPreferences prefs) {
        this.prefs = prefs;
        this.database = AppDatabase.get(context);
    }

    public synchronized String loadState() {
        ensureMigrated();
        int taskCount = database.taskDao().count();
        int tagCount = database.tagDao().count();
        if (!prefs.getBoolean(INITIALIZED_KEY, false) && taskCount == 0 && tagCount == 0) {
            return null;
        }
        return serialize(database.taskDao().getAll(), database.tagDao().getAll());
    }

    public synchronized boolean saveState(String json) {
        try {
            ParsedState parsed = parse(json);
            replace(parsed);
            prefs.edit().putBoolean(INITIALIZED_KEY, true).apply();
            saveTagSchema(json);
            saveTheme(json);
            saveViewPreferences(json);
            return true;
        } catch (Throwable ignored) {
            return false;
        }
    }

    public synchronized String exportState() {
        return serialize(database.taskDao().getAll(), database.tagDao().getAll());
    }

    public synchronized boolean importState(String json) {
        try {
            ParsedState parsed = parse(json);
            replace(parsed);
            saveTheme(json);
            saveTagSchema(json);
            saveViewPreferences(json);
            prefs.edit().putBoolean(INITIALIZED_KEY, true).apply();
            return true;
        } catch (Throwable ignored) {
            return false;
        }
    }

    /**
     * Merge a decrypted backup into the current database. Existing tasks win on
     * duplicate ids; tags are matched by name and capped at MAX_TAGS.
     */
    public synchronized boolean mergeState(String json) {
        try {
            ParsedState incoming = parse(json);
            List<TagEntity> currentTags = database.tagDao().getAll();
            List<TaskEntity> currentTasks = database.taskDao().getAll();
            List<TagEntity> mergedTags = new ArrayList<>(currentTags);
            Map<String, TagEntity> byName = new HashMap<>();
            Set<String> usedIds = new HashSet<>();
            for (TagEntity tag : currentTags) {
                byName.put(tag.name, tag);
                usedIds.add(tag.id);
            }

            Map<String, TagEntity> incomingTagMap = new HashMap<>();
            for (TagEntity tag : incoming.tags) {
                TagEntity existing = byName.get(tag.name);
                if (existing != null) {
                    incomingTagMap.put(tag.id, existing);
                    continue;
                }
                if (mergedTags.size() >= MAX_TAGS) continue;
                String id = tag.id;
                if (id == null || id.isEmpty() || usedIds.contains(id)) {
                    id = "tag-" + UUID.randomUUID();
                }
                TagEntity copy = new TagEntity(
                        id, tag.name, tag.color, mergedTags.size(), tag.createdAt);
                mergedTags.add(copy);
                byName.put(copy.name, copy);
                usedIds.add(copy.id);
                incomingTagMap.put(tag.id, copy);
            }

            Set<String> taskIds = new HashSet<>();
            for (TaskEntity task : currentTasks) taskIds.add(task.id);
            int maxOrder = 0;
            for (TaskEntity task : currentTasks) maxOrder = Math.max(maxOrder, task.sortOrder);

            List<TaskEntity> mergedTasks = new ArrayList<>(currentTasks);
            for (TaskEntity source : incoming.tasks) {
                if (taskIds.contains(source.id)) continue;
                TagEntity mapped = source.tagId == null ? null : incomingTagMap.get(source.tagId);
                if (mapped == null && source.category != null && !source.category.isEmpty()) {
                    mapped = byName.get(source.category);
                }
                source.tagId = mapped == null ? null : mapped.id;
                source.category = mapped == null ? "" : mapped.name;
                source.sortOrder = ++maxOrder;
                mergedTasks.add(source);
                taskIds.add(source.id);
            }

            replace(new ParsedState(mergedTasks, mergedTags));
            prefs.edit().putBoolean(INITIALIZED_KEY, true).apply();
            return true;
        } catch (Throwable ignored) {
            return false;
        }
    }

    public synchronized boolean isValidState(String json) {
        try {
            JSONObject root = new JSONObject(json);
            return root.optJSONArray("tasks") != null;
        } catch (Throwable ignored) {
            return false;
        }
    }

    public synchronized String describe(String json) {
        try {
            JSONObject root = new JSONObject(json);
            JSONArray tasks = root.optJSONArray("tasks");
            JSONArray tags = root.optJSONArray("tags");
            int taskCount = tasks == null ? 0 : tasks.length();
            int tagCount = tags == null ? 0 : tags.length();
            return taskCount + " 条待办 · " + tagCount + " 个标签";
        } catch (Throwable ignored) {
            return "未知内容";
        }
    }

    private void ensureMigrated() {
        if (prefs.getBoolean(INITIALIZED_KEY, false)) return;
        if (database.taskDao().count() > 0 || database.tagDao().count() > 0) {
            prefs.edit().putBoolean(INITIALIZED_KEY, true).apply();
            return;
        }
        String legacy = prefs.getString(LEGACY_STATE, null);
        if (legacy == null) return;
        try {
            ParsedState parsed = parse(legacy);
            replace(parsed);
            saveTheme(legacy);
            prefs.edit().putBoolean(INITIALIZED_KEY, true).apply();
        } catch (Throwable ignored) {
            // The UI will seed a fresh state and save it on first boot.
        }
    }

    private void saveViewPreferences(String json) {
        try {
            JSONObject root = new JSONObject(json);
            String sort = root.optString("sort", "priority");
            if (!"priority".equals(sort) && !"urgency".equals(sort) && !"custom".equals(sort)) {
                sort = "priority";
            }
            String lang = root.optString("lang", "zh");
            if (!"zh".equals(lang) && !"en".equals(lang)) lang = "zh";
            prefs.edit().putString(SORT_KEY, sort).putString(LANG_KEY, lang).apply();
        } catch (Throwable ignored) {
        }
    }

    private void saveTagSchema(String json) {
        try {
            JSONObject root = new JSONObject(json);
            prefs.edit().putBoolean(TAG_SCHEMA_KEY, root.optBoolean("tagSchema", false)).apply();
        } catch (Throwable ignored) {
        }
    }

    private void saveTheme(String json) {
        try {
            JSONObject root = new JSONObject(json);
            SharedPreferences.Editor editor = prefs.edit();
            if (root.isNull("theme")) {
                editor.remove(THEME_KEY);
            } else {
                String theme = root.optString("theme", null);
                if ("dark".equals(theme) || "light".equals(theme)) {
                    editor.putString(THEME_KEY, theme);
                } else {
                    editor.remove(THEME_KEY);
                }
            }
            editor.apply();
        } catch (Throwable ignored) {
        }
    }

    private void replace(ParsedState state) {
        database.runInTransaction(() -> {
            // Tasks first: the FK points from tasks to tags.
            database.taskDao().deleteAll();
            database.tagDao().deleteAll();
            if (!state.tags.isEmpty()) database.tagDao().insertAll(state.tags);
            if (!state.tasks.isEmpty()) database.taskDao().insertAll(state.tasks);
        });
    }

    private String serialize(List<TaskEntity> tasks, List<TagEntity> tags) {
        try {
            JSONObject root = new JSONObject();
            root.put("version", 1);
            JSONArray tagArray = new JSONArray();
            for (TagEntity tag : tags) {
                JSONObject item = new JSONObject();
                item.put("id", tag.id);
                item.put("name", tag.name);
                item.put("color", tag.color);
                item.put("sortOrder", tag.sortOrder);
                item.put("createdAt", tag.createdAt);
                tagArray.put(item);
            }
            JSONArray taskArray = new JSONArray();
            for (TaskEntity task : tasks) {
                JSONObject item = new JSONObject();
                item.put("id", task.id);
                item.put("title", task.title);
                item.put("notes", task.notes == null ? "" : task.notes);
                item.put("priority", task.priority);
                item.put("urgency", task.urgency);
                item.put("due", task.due == null ? JSONObject.NULL : task.due);
                item.put("category", task.category == null ? "" : task.category);
                item.put("tagId", task.tagId == null ? JSONObject.NULL : task.tagId);
                item.put("completed", task.completed);
                item.put("completedAt", task.completedAt == null ? JSONObject.NULL : task.completedAt);
                item.put("createdAt", task.createdAt == null ? "" : task.createdAt);
                item.put("sortOrder", task.sortOrder);
                taskArray.put(item);
            }
            root.put("tags", tagArray);
            root.put("tasks", taskArray);
            String theme = prefs.getString(THEME_KEY, null);
            if (theme == null) root.put("theme", JSONObject.NULL);
            else root.put("theme", theme);
            root.put("tagSchema", prefs.getBoolean(TAG_SCHEMA_KEY, false));
            root.put("sort", prefs.getString(SORT_KEY, "priority"));
            root.put("lang", prefs.getString(LANG_KEY, "zh"));
            root.put("view", "list");
            root.put("filter", "all");
            return root.toString();
        } catch (Throwable ignored) {
            return "{\"version\":1,\"tasks\":[],\"tags\":[],\"theme\":null}";
        }
    }

    private ParsedState parse(String json) throws Exception {
        JSONObject root = new JSONObject(json);
        JSONArray rawTasks = root.optJSONArray("tasks");
        if (rawTasks == null) rawTasks = new JSONArray();
        List<TagEntity> tags = parseTags(root.optJSONArray("tags"), rawTasks);
        Map<String, TagEntity> byId = new HashMap<>();
        Map<String, TagEntity> byName = new HashMap<>();
        for (TagEntity tag : tags) {
            byId.put(tag.id, tag);
            byName.put(tag.name, tag);
        }

        List<TaskEntity> tasks = new ArrayList<>();
        for (int i = 0; i < rawTasks.length(); i++) {
            JSONObject source = rawTasks.optJSONObject(i);
            if (source == null) continue;
            String title = source.optString("title", "").trim();
            if (title.isEmpty()) continue;
            TaskEntity task = new TaskEntity();
            task.id = valueOr(source.optString("id", ""), UUID.randomUUID().toString());
            task.title = title;
            task.notes = source.optString("notes", "");
            task.priority = clamp(source.optInt("priority", 1), 1, 3);
            task.urgency = clamp(source.optInt("urgency", 1), 1, 3);
            task.due = source.isNull("due") ? null : emptyToNull(source.optString("due", ""));
            task.category = source.optString("category", "");
            task.completed = source.optBoolean("completed", false);
            task.completedAt = source.isNull("completedAt") ? null
                    : emptyToNull(source.optString("completedAt", ""));
            task.createdAt = valueOr(source.optString("createdAt", ""), nowIso());
            task.sortOrder = source.optInt("sortOrder", i + 1);

            String tagId = source.isNull("tagId") ? null : emptyToNull(source.optString("tagId", ""));
            TagEntity tag = tagId == null ? null : byId.get(tagId);
            if (tag == null && !task.category.isEmpty()) tag = byName.get(task.category);
            if (tag != null) {
                task.tagId = tag.id;
                task.category = tag.name;
            } else {
                task.tagId = null;
            }
            tasks.add(task);
        }
        return new ParsedState(tasks, tags);
    }

    private List<TagEntity> parseTags(JSONArray source, JSONArray tasks) {
        List<TagEntity> result = new ArrayList<>();
        Set<String> names = new HashSet<>();
        if (source != null) {
            for (int i = 0; i < source.length() && result.size() < MAX_TAGS; i++) {
                JSONObject item = source.optJSONObject(i);
                if (item == null) continue;
                String name = item.optString("name", "").trim();
                if (name.isEmpty() || name.length() > 16 || names.contains(name)) continue;
                String color = normalizeColor(item.optString("color", ""));
                TagEntity tag = new TagEntity(
                        valueOr(item.optString("id", ""), "tag-" + UUID.randomUUID()),
                        name,
                        color,
                        item.optInt("sortOrder", result.size()),
                        item.optLong("createdAt", System.currentTimeMillis()));
                result.add(tag);
                names.add(name);
            }
        }
        // No tags array means this is a legacy state. Keep its fixed categories
        // untouched; custom tags remain an additive, optional classification.
        return result;
    }

    private static String normalizeColor(String value) {
        if (value != null && COLOR.matcher(value).matches()) {
            return value.toUpperCase(Locale.US);
        }
        return PALETTE[0];
    }

    private static String emptyToNull(String value) {
        return value == null || value.isEmpty() ? null : value;
    }

    private static String valueOr(String value, String fallback) {
        return value == null || value.isEmpty() ? fallback : value;
    }

    private static int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }

    private static String nowIso() {
        return new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX", Locale.US)
                .format(new Date());
    }

    private static class ParsedState {
        final List<TaskEntity> tasks;
        final List<TagEntity> tags;

        ParsedState(List<TaskEntity> tasks, List<TagEntity> tags) {
            this.tasks = tasks;
            this.tags = tags;
        }
    }
}
