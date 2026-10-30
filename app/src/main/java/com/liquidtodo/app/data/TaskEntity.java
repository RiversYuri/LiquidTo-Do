package com.liquidtodo.app.data;

import androidx.annotation.NonNull;
import androidx.room.Entity;
import androidx.room.ForeignKey;
import androidx.room.Index;
import androidx.room.PrimaryKey;

import static androidx.room.ForeignKey.SET_NULL;

/**
 * One tag can own many tasks. Deleting a tag only clears the association,
 * never deletes the task itself.
 */
@Entity(
        tableName = "tasks",
        foreignKeys = @ForeignKey(
                entity = TagEntity.class,
                parentColumns = "id",
                childColumns = "tagId",
                onDelete = SET_NULL),
        indices = {@Index("tagId")}
)
public class TaskEntity {

    @PrimaryKey
    @NonNull
    public String id = "";

    @NonNull
    public String title = "";

    public String notes = "";

    public int priority = 1;

    public int urgency = 1;

    public String due;

    /** Legacy display name, retained so old data remains readable. */
    public String category = "";

    public String tagId;

    public boolean completed;

    public String completedAt;

    public String createdAt = "";

    /** User-defined order for the list; 0 means "not assigned yet". */
    public int sortOrder;

    public TaskEntity() {
    }
}
