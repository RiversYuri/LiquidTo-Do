# 安全政策 / Security Policy

**项目 / Project：** 流光待办 / Liquid Todo  
**当前版本 / Current version：** 3.2.6（versionCode 14）  
**开发者 / Developer：** Rivers Yuri  
**联系 / Contact：** flicks.meek.3y@icloud.com

---

## 1. 支持的版本 / Supported Versions

**中文：** 仅为当前发布版本提供安全修复。旧版本可能不再接收更新，建议升级到最新版本。

**English:** Security fixes are provided for the current release only. Older versions may no longer receive updates; upgrading to the latest version is recommended.

| 版本 / Version | 支持 / Supported |
|---|---|
| 3.2.6 (versionCode 14) | ✅ |
| 3.2.4 及更早 / and earlier | ❌ |

---

## 2. 报告漏洞 / Reporting a Vulnerability

**中文：** 如果你发现安全问题，请发送邮件至 **flicks.meek.3y@icloud.com**，邮件标题建议以 `[SECURITY] Liquid Todo` 开头。请尽量包含：

- 受影响的版本与设备/Android 版本；
- 复现步骤或概念验证；
- 影响范围与可能利用方式；
- 是否涉及本地数据、备份文件、WebView 桥接或外部 Intent。

请勿在公开渠道披露未修复漏洞，也不要附带真实用户数据。涉及敏感细节时，请先邮件说明，再协商安全传输方式。

**English:** If you discover a security issue, email **flicks.meek.3y@icloud.com** with a subject beginning with `[SECURITY] Liquid Todo`. Please include, where possible:

- Affected version and device/Android version;
- Reproduction steps or a proof of concept;
- Impact and potential exploit path;
- Whether local data, backup files, the WebView bridge, or external intents are involved.

Please do not disclose an unfixed issue publicly or include real user data. For sensitive details, contact us first and agree on a secure transfer method.

---

## 3. 响应预期 / What to Expect

**中文：** 这是个人开发项目，安全响应按尽力而为处理。通常会在 3 个工作日内确认收到，在 7 个工作日内完成初步分级；修复时间取决于严重性、复现难度和发布安排。当前不提供漏洞赏金。

**English:** This is an independent project, and security responses are best-effort. We aim to acknowledge reports within 3 business days and complete initial triage within 7 business days; fix timelines depend on severity, reproducibility, and release scheduling. No bug bounty is currently offered.

---

## 4. 安全设计 / Security Design

**中文：**

- **离线优先**：不申请 INTERNET 权限，不连接开发者服务器；
- **最小权限**：仅申请 VIBRATE；
- **本地存储**：待办与标签保存在本机 Room 数据库，设置保存在 SharedPreferences；
- **加密备份**：AES-256-GCM，PBKDF2-HMAC-SHA256 派生密钥，备份密码不保存；
- **文件访问**：通过系统文件选择器（SAF）读写备份，不申请存储权限；
- **无账号、无广告、无分析 SDK**。

**English:**

- **Offline-first**: no INTERNET permission and no developer-operated server;
- **Least privilege**: only the VIBRATE permission;
- **Local storage**: tasks and tags in the local Room database; settings in SharedPreferences;
- **Encrypted backups**: AES-256-GCM with PBKDF2-HMAC-SHA256 key derivation; the backup password is never stored;
- **File access**: backups are read and written through the system file picker (SAF), with no storage permission;
- **No accounts, ads, or analytics SDKs**.

---

## 5. 范围内 / In Scope

**中文：** 应用代码、本地数据隔离、加密备份格式与密码处理、WebView 与原生桥接、备份/恢复文件选择流程、外部 Intent 处理，以及可能导致数据泄露、越权访问或应用崩溃的安全问题。

**English:** Application code, local-data isolation, encrypted backup format and password handling, the WebView/native bridge, backup/restore file-picker flow, external intent handling, and issues that could cause data exposure, unauthorized access, or app compromise.

---

## 6. 范围外 / Out of Scope

**中文：** 以下情况通常不在安全修复范围内：已 Root 或被攻陷的设备、物理访问、设备解锁凭证泄露、操作系统或系统 WebView 自身漏洞、第三方应用或应用商店问题、社会工程、拒绝服务/资源耗尽测试，以及无法证明对本应用有实际影响的依赖项通用问题。

**English:** The following are generally out of scope: rooted or compromised devices, physical access, compromised device-unlock credentials, vulnerabilities in the OS or system WebView, third-party apps or app stores, social engineering, denial-of-service/resource-exhaustion testing, and generic dependency reports without a demonstrated impact on this app.

---

## 7. 善意的安全研究 / Good-Faith Research

**中文：** 欢迎善意的安全研究。请仅测试你拥有或获授权使用的设备与数据，不要破坏数据、影响他人、进行社会工程或公开未修复细节。对于遵守本政策、且未造成实际损害的善意报告，开发者不会主动采取法律行动。

**English:** Good-faith security research is welcome. Test only devices and data you own or are authorized to use; do not destroy data, affect others, conduct social engineering, or publish unfixed details. For good-faith reports that follow this policy and cause no actual harm, the developer will not initiate legal action.

---

## 8. 备份密码与数据恢复 / Backup Password and Data Recovery

**中文：** 备份密码不会保存在应用中。若忘记密码或丢失备份文件，开发者无法解密或恢复数据。请使用可信的密码管理器，并将备份文件保存在安全位置。

**English:** The backup password is not stored in the app. If you forget the password or lose the backup file, the developer cannot decrypt or recover the data. Use a trusted password manager and store backup files in a safe location.

---

## 9. 安全更新 / Security Updates

**中文：** 安全修复会随新版本发布，并在更新日志中说明（在不暴露未修复细节的前提下）。请从可信来源获取 APK，并核对版本号与签名。

**English:** Security fixes are shipped in new releases and described in the changelog without exposing unfixed details. Obtain APKs from trusted sources and verify the version and signature.
