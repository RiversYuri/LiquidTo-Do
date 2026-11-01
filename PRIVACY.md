# 隐私政策 / Privacy Policy

**生效日期 / Effective date：** 2026-10-30  
**最后更新 / Last updated：** 2026-11-01  
**适用应用 / App：** 流光待办 / Liquid Todo（`com.liquidtodo.app`）  
**开发者 / Developer：** Rivers Yuri

---

## 1. 概述 / Overview

**中文：** 流光待办是一款离线优先的本地待办应用。应用不要求注册账号，不连接开发者服务器，也不将待办、标签、设置或备份上传到云端。你的数据默认只保存在当前设备上，由你自行掌控。

**English:** Liquid Todo is an offline-first local task app. It requires no account, does not connect to a developer-operated server, and does not upload tasks, tags, settings, or backups to the cloud. Your data stays on your device under your control by default.

---

## 2. 我们不收集什么 / What We Do Not Collect

**中文：** 应用不申请 INTERNET 权限，不收集或传输账号、手机号、通讯录、精确位置、设备标识符、使用统计或广告数据，也不集成第三方分析或广告 SDK。

**English:** The app does not request the INTERNET permission. It does not collect or transmit accounts, phone numbers, contacts, precise location, device identifiers, usage analytics, or advertising data, and it does not include third-party analytics or advertising SDKs.

---

## 3. 本地保存的数据 / Data Stored Locally

**中文：** 应用在本机保存以下内容，用于提供待办功能：

- 待办标题、备注、优先级、紧急程度、截止日期和完成状态；
- 标签名称、颜色及待办关联；
- 外观、语言、触感、低功耗等设置；
- 加密备份所需的文件信息由你选择的位置管理。

待办与标签保存在本机 Room 数据库，轻量设置保存在 SharedPreferences。

**English:** The app stores the following on your device to provide its task features:

- Task titles, notes, priority, urgency, due dates, and completion state;
- Tag names, colors, and task associations;
- Appearance, language, haptic, low-power, and related settings;
- The location of encrypted backup files, which you choose and manage.

Tasks and tags are stored in the local Room database; lightweight settings are stored in SharedPreferences.

---

## 4. 加密备份 / Encrypted Backups

**中文：** 备份文件由你设置密码后，使用 **AES-256-GCM** 加密，并通过 **PBKDF2-HMAC-SHA256** 从密码派生密钥。密码不会保存在应用中，也不会上传。备份文件保存在你通过系统文件选择器指定的位置。若密码或文件丢失，开发者无法恢复。

**English:** Backup files are encrypted with **AES-256-GCM** using a password you choose, with a key derived via **PBKDF2-HMAC-SHA256**. The password is never stored in the app or uploaded. Backup files are saved to the location you select through the system file picker. If the password or file is lost, the developer cannot recover it.

---

## 5. 权限 / Permissions

**中文：** 应用仅申请 **VIBRATE（震动）** 权限，用于触感反馈。备份与恢复通过 Android 系统文件选择器（SAF）完成，不申请存储权限。应用不申请相机、麦克风、通讯录、位置或网络权限。

**English:** The app requests only the **VIBRATE** permission for haptic feedback. Backup and restore use the Android Storage Access Framework (SAF) and require no storage permission. The app does not request camera, microphone, contacts, location, or network permissions.

---

## 6. 第三方 / Third Parties

**中文：** 应用不向任何服务器发送数据，不包含广告或分析 SDK。若你通过系统邮件应用联系开发者，邮件内容由你的邮件服务商处理；若你通过应用商店安装应用，商店可能按其自身隐私政策处理安装与分发数据。

**English:** The app sends no data to any server and includes no advertising or analytics SDKs. If you contact the developer through the system mail app, your email provider handles that message; if you install the app through an app store, the store may process installation and distribution data under its own privacy policy.

---

## 7. 保留与删除 / Retention and Deletion

**中文：** 本地数据会一直保留，直到你在应用内删除、清除应用数据或卸载应用。开发者不保留服务器端副本，因此无法代为恢复已删除的数据。你导出的加密备份由你自行保管和删除。

**English:** Local data remains until you delete it in the app, clear app data, or uninstall the app. The developer keeps no server-side copy and therefore cannot restore deleted data on your behalf. Encrypted backups you export are controlled and deleted by you.

---

## 8. 未成年人 / Children

**中文：** 本应用不面向未成年人收集个人信息，也不会主动收集儿童的姓名、联系方式、位置或其他个人数据。

**English:** The app does not collect personal information from children and does not knowingly collect names, contact details, location, or other personal data from children.

---

## 9. 安全 / Security

**中文：** 应用采用离线架构、最小权限和本地加密备份来降低风险。但任何设备都可能受到系统漏洞、恶意软件、Root、物理访问或备份密码泄露的影响。请保护设备锁屏与备份密码，并参阅 [SECURITY.md](SECURITY.md) 了解安全设计与漏洞报告方式。

**English:** The app uses an offline architecture, minimal permissions, and encrypted local backups to reduce risk. However, any device can be affected by OS vulnerabilities, malware, rooting, physical access, or backup-password disclosure. Protect your device lock and backup password, and see [SECURITY.md](SECURITY.md) for the security design and vulnerability reporting process.

---

## 10. 政策变更 / Changes

**中文：** 如本政策发生重大变化，会更新本文件及应用内说明。继续使用应用即表示你接受更新后的政策；如不同意，请停止使用并删除本地数据。

**English:** Material changes will be reflected in this document and the in-app notice. Continued use of the app means you accept the updated policy; if you do not agree, stop using the app and delete local data.

---

## 11. 联系 / Contact

**中文：** 如对本政策有疑问，请联系：**flicks.meek.3y@icloud.com**

**English:** For questions about this policy, contact: **flicks.meek.3y@icloud.com**
