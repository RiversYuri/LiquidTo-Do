# 流光待办 · 后续开发基准文档 v3.2.3

> 目的：防止后续迭代遗忘既有功能、数据结构和已修复问题。  
> 基线日期：2026-10-30  
> 项目目录：`D:\Work\liquid-todo`  
> 目标 APK：`D:\Work\成品\流光待办-v3.2.3.apk`

---

## 1. 不可回退的既有功能

以下功能在 v3.2.3 中必须继续可用；新功能只能叠加，不得替换或破坏：

- 待办新建、编辑、完成、删除、撤销删除。
- 重要程度（低/中/高）× 紧急程度（从容/较急/紧急）。
- 截止日期：今天 / 明天 / 后天 / 自定义 / 不设期限。
- 原有固定分类工作 / 生活 / 学习 / 健康：已整合为默认标签，语义仍保留。
- 全部 / 今天 / 重要 / 完成筛选。
- “已完成”清空按钮 + 撤销。
- 艾森豪威尔四象限、今日建议。
- 统计：7 天趋势、连续完成、最高效一天、优先级分布、今日进度。
- 浅色 / 深色 / 跟随系统主题。
- 兼容模式：保留玻璃与动效，记住选择。
- WebView 渲染崩溃保护、原生恢复页、启动看门狗。
- 无 INTERNET 权限、无登录、无云同步。
- Android 8.0+；Android 14/15 edge-to-edge / IME 适配；HyperOS 3.0 跟随系统修复。

---

## 2. v3.0.0 / 3.1.0 / 3.2.1 / 3.2.2 / 3.2.3 新增功能

### 2.0a v3.2.3 合并修复
- 合并恢复在任务 ID 冲突时不再静默丢弃备份条目。
- ID 相同且标题不同：生成新 ID 插入备份任务。
- ID 相同且标题相同：保留当前任务，避免重复。
- 覆盖恢复不变；版本 3.2.3（versionCode 11）。

### 2.0 v3.2.2 修复与新增
- **备份/恢复修复**：
  - 备份调用携带当前 JS 状态，不再只依赖 Room 查询；
  - 解密 JSON 通过 `onRestoreReady(summary, json)` 传入网页；
  - “合并/覆盖”由网页立即解析并写入 state，`persistNow()` 持久化；无需等待原生重建；
  - 合并只加入备份中不存在的任务 ID。
- 首次启动隐私同意页增加语言选择（中文 / English）。
- 关于页增加 GitHub：`https://github.com/RiversYuri/LiquidTo-Do`。
- README 增加 Apple 广告风格宣传图（`docs/images/`）。
- 版本 3.2.2（versionCode 10）。

### 2.1 v3.2.1 改进
- 低功耗模式默认开启；关闭时二级确认，提示功耗、发热与稳定性风险。
- 英文界面（简体中文 / English），覆盖导航、清单、矩阵、统计、设置、表单、标签、备份、隐私与协议。
- 矩阵象限超过 2 条任务时可展开/收起。
- 编辑已有待办不自动调起输入法；新建待办仍聚焦。
- 清单支持重要程度、紧急程度、自定义三种排序；自定义排序用上移/下移并持久化 `tasks.sortOrder`。
- 恢复备份支持“合并”与“覆盖”两种方式。
- 首次启动隐私政策与用户协议同意页；设置页可再次查看。
- 开发者名称改为 Rivers Yuri。
- 更新日志从 1.0.0 起完整列出，不提及彩蛋。

### 2.1 统一标签（v3.1.0）
- 分类与标签合并为**同一套标签**；不再有独立“分类”选择器。
- 默认标签：工作、生活、学习、健康（继承原分类颜色）。
- 最多 **5 个标签**；每个标签一个颜色，8 色柔和色板。
- 任务最多关联一个标签，也可以不关联。
- 标签管理：设置 → 标签 → 管理；可新增、改名、改色、删除。
- 首页横向标签筛选条；与原有筛选叠加，列表按原有“重要度 + 紧急度 + 截止日期”排序。
- 删除标签只清空 `tasks.tagId`，不删除任务。
- Room 独立 `tags` 表；`tasks.tag_id` 外键 `ON DELETE SET NULL`。
- 旧数据第一次加载时迁移：
  - 原 `category` 转为同名默认标签；
  - 旧自定义标签若只关联一个分类，则合并到该分类标签；
  - 任务本身和标签关联尽量保留；
  - `tagSchema` 标记写入 SharedPreferences/Room，避免重复迁移。

### 2.2 本地加密备份/恢复
- 设置 → 数据与备份；备份 / 恢复。
- 备份使用 SAF `ACTION_CREATE_DOCUMENT`；恢复使用 `ACTION_OPEN_DOCUMENT`。
- 文件后缀 `.liquidbackup`。
- AES-256-GCM；PBKDF2-HMAC-SHA256，210,000 次迭代，16 字节 salt，12 字节 IV，128-bit tag。
- 密码不保存；恢复前展示条目摘要并二次确认覆盖。
- 备份内容是对 Room 当前逻辑数据的 JSON 导出（tasks + tags + theme），再整体加密；不直接复制 WAL 数据库，以避免数据库连接/WAL 不一致。
- 恢复通过 Room 事务全量替换数据并重建页面；主题也随备份恢复。
- 不申请存储权限；不联网。

### 2.3 低功耗
- 设置 → 稳定性 → 低功耗运行，持久化。
- 停用环境光斑、极光、FAB 光晕动画；降低背景模糊；隐藏颗粒/彩纸；保留核心布局和主要交互。
- 应用进入后台时 WebView `onPause`；不注册后台服务/定时任务。

### 2.4 启动过渡
- 原生启动覆盖层：渐变背景 + Logo + “流光待办” + “LIQUID TODO” + Slogan。
- WebView 首帧前 alpha=0；JS `pageReady` 后 360ms 淡入 WebView，480ms 淡出原生层。
- 原生窗口背景/系统 Splash 使用深浅两套颜色，消除白屏闪烁。
- Android 端移除 HTML splash，避免双 splash。

### 2.5 时段文案
- 05:00–08:59：早上好，慢慢来。
- 09:00–11:59：上午好，保持专注。
- 12:00–13:59：中午好，记得休息。
- 14:00–17:59：下午好，慢慢来。
- 18:00–21:59：晚上好，慢慢来。
- 22:00–04:59：夜深了，早些休息；副文案与 Hero hint 改为“明天再继续/早点休息”。

### 2.6 彩蛋与更新日志
- 关于页版本号连续点击 10 次 → “辛苦了，抱抱你” + “把重要的事，放在光里。”
- 关于页“查看更新日志”打开版本记录。
- 开发者：Rivers Yuri；邮箱：`flicks.meek.3y@icloud.com`。

---

## 3. 架构

```text
MainActivity (Java)
 ├─ WebView + local assets
 ├─ Native launch overlay / fallback page
 ├─ Bridge: loadState/saveState/theme/lowPower/backup...
 ├─ SAF backup & restore
 ├─ BackupCrypto (AES-GCM + PBKDF2)
 └─ TodoRepository
      ├─ Room DB liquid_todo.db
      │   ├─ tasks (tagId FK -> tags.id ON DELETE SET NULL)
      │   └─ tags
      └─ SharedPreferences liquid_todo_prefs
          ├─ todo_theme
          ├─ safe_mode
          ├─ low_power_mode
          ├─ last_crash
          └─ legacy todo_state_v1 (migration source)
```

### 数据流
- JS `loadState()` → `TodoRepository.loadState()`：
  - 首次启动优先迁移旧 `todo_state_v1` 到 Room；
  - 返回 tasks/tags/theme 的 JSON；
  - DB 为空且无旧数据返回 null，JS 生成种子数据。
- JS `saveState(json)` → 解析 tasks/tags → Room 事务全量替换 → 写 theme。
- 旧版 JSON 保留，不主动删除，作为回退源。

### Room 表

```sql
tags(
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  sortOrder INTEGER NOT NULL,
  createdAt INTEGER NOT NULL
)

tasks(
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  priority INTEGER NOT NULL,
  urgency INTEGER NOT NULL,
  due TEXT,
  category TEXT,
  tagId TEXT,
  completed INTEGER NOT NULL,
  completedAt TEXT,
  createdAt TEXT,
  sortOrder INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(tagId) REFERENCES tags(id) ON DELETE SET NULL
)
```

### SharedPreferences
- `todo_theme`: `"light"` / `"dark"` / 缺失（跟随系统）
- `safe_mode`: 兼容模式
- `low_power_mode`: 低功耗（缺省 true；用户显式关闭后为 false）
- `list_sort`: `priority` / `urgency` / `custom`
- `app_lang`: `zh` / `en`
- `privacy_accepted`: 首次隐私协议同意
- `tag_schema_v1`: 分类→标签迁移标记
- `last_crash`: 最近未捕获异常
- `todo_state_v1`: 旧版 JSON（迁移源）
- Room v1 → v2：`ALTER TABLE tasks ADD COLUMN sortOrder INTEGER NOT NULL DEFAULT 0`，并写入 rowid。

---

## 4. 关键文件

| 文件 | 责任 |
|---|---|
| `MainActivity.java` | WebView 宿主、系统栏/Insets、启动层、恢复页、SAF、备份、桥接 |
| `BackupCrypto.java` | AES-256-GCM / PBKDF2 文件格式 |
| `data/TodoRepository.java` | Room ↔ JSON、旧数据迁移、主题 |
| `data/AppDatabase.java` | Room 数据库 |
| `data/TaskEntity.java` | tasks 表 + 标签外键 |
| `data/TagEntity.java` | tags 表 |
| `data/*Dao.java` | 查询/全量写入 |
| `assets/www/app.js` | 业务 UI、标签、筛选、备份弹窗、主题、低功耗、彩蛋 |
| `assets/www/styles.css` | Liquid Glass、标签、设置、对话框、低功耗 |
| `assets/www/index.html` | 视图骨架与设置/标签/关于/对话框 |
| `res/drawable/launch_background*.xml` | 开屏渐变 |
| `res/values-night/colors.xml` | 深色开屏颜色 |

---

## 5. WebView 桥接口

- `loadState()`
- `saveState(json)`
- `setBackGuard(boolean)`
- `setDarkMode(boolean)`
- `haptic(type)`
- `hideKeyboard()`
- `pageReady()`
- `pageError(message)`
- `isSafeMode()` / `setSafeModeEnabled(boolean)`
- `isLowPower()` / `setLowPowerEnabled(boolean)`
- `isSystemDark()`
- `getAppVersion()`
- `openEmail()`
- `openUrl(url)`
- `startBackup(password, stateJson)`（JS 传入当前状态）
- `startRestore(password)`
- `applyPendingRestore(merge)`（保留兼容；v3.2.2 网页不再调用）
- `isPrivacyAccepted()` / `acceptPrivacy()`

网页回调：
- `window.onBackupResult(ok, message)`
- `window.onRestoreReady(summary, json)`（v3.2.2 起包含解密 JSON）
- `window.onRestoreResult(ok, message)`
- `window.setSystemTheme(dark)`
- `window.setSafeArea(top,bottom)`
- `window.setKeyboardInset(px)`

---

## 6. 备份文件格式

```text
"LQTBK1"        6 bytes magic
version         int32 = 1
iterations      int32 = 210000
saltLength      int32
salt            bytes
ivLength        int32
iv              bytes
cipherLength    int32
ciphertext+tag  bytes (AES/GCM/NoPadding)
```

恢复限制：最大读取 2 MB；正常数据远小于 500 KB。

---

## 7. 构建与验证

```powershell
$env:JAVA_HOME='D:\Work\.toolchain\jdk\jdk-21.0.2'
$env:ANDROID_HOME='D:\Work\.android-sdk'
$env:ANDROID_USER_HOME='D:\Work\.android-home'
$env:GRADLE_USER_HOME='D:\Work\.gradle-home'

gradlew.bat :app:assembleRelease :app:lintRelease
```

当前结果：
- Release 构建成功。
- Lint **0 error**。
- APK v2 签名通过；versionCode 11 / versionName 3.2.3。
- `BackupCrypto` 加密/解密/错误密码测试通过。
- 基于 linkedom 的 JS 逻辑测试通过：标签持久化/筛选/上限/删除关联、备份密码弹窗、恢复合并/覆盖、低功耗默认值与关闭确认、隐私同意页、英文切换、排序、矩阵展开。
- **没有 Android 真机/模拟器**：Room v1→v2 迁移、SAF、原生启动过渡、低功耗最终效果需在真机确认。

### 构建注意
- 本机 `C:\Users\18527\.android` 不可写，需 `ANDROID_USER_HOME=D:\Work\.android-home`。
- Gradle wrapper 使用华为镜像 distribution URL。
- PowerShell 可能把 javac 的 deprecation 提示当 stderr 显示 `exit code 1`；看到 `BUILD SUCCESSFUL` 即成功。
- 演示签名：`keystore/liquid-todo.jks` + `keystore.properties`；上架前替换。

---

## 8. 回归检查清单

- [ ] 旧 2.1.1 数据升级后任务数量、完成状态、截止日期、分类不变。
- [ ] 新增/编辑/完成/删除/撤销仍正常。
- [ ] 四象限、统计、筛选、清空已完成仍正常。
- [ ] 跟随系统在 HyperOS 3.0 控制中心切换后同步。
- [ ] 兼容模式/低功耗开关重启后保持。
- [ ] 标签筛选与“今天/重要/完成”叠加正确。
- [ ] 删除标签后待办保留且不再显示该标签。
- [ ] 备份文件可在系统文件选择器中生成；恢复需密码；错误密码被拒绝。
- [ ] 恢复前确认；恢复后任务/标签/主题一致。
- [ ] 启动无白屏闪烁；深色/浅色开屏都自然。
- [ ] 深夜文案为“早些休息”，不出现“慢慢来”。
- [ ] 10 击版本号出现彩蛋；更新日志可查看。

---

## 9. 后续优先级建议

1. 真机验证 v3.2.3：合并恢复 ID 冲突、备份携带 JS 状态、恢复覆盖、Room v1→v2 排序迁移、SAF、启动过渡、低功耗与英文界面。
2. 增加备份文件大小显示 / 最近备份时间。
3. 增加数据导入导出（非加密 JSON）可选。
4. 增加通知提醒（需要 POST_NOTIFICATIONS / AlarmManager）。
5. 增加标签拖拽排序、标签统计。
6. 替换正式签名，生成商店素材。
