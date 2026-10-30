/* ============================================================
   流光待办 · Liquid Todo
   Local-first task manager with Eisenhower prioritisation.
   ============================================================ */

(function () {
  'use strict';

  var STORAGE_KEY = 'liquid_todo_state_v1';
  var SAFE_MODE_KEY = 'liquid_todo_safe_mode';
  var LOW_POWER_KEY = 'liquid_todo_low_power';
  var VERSION = 1;
  var APP_VERSION = '3.2.3';
  var DAY = 86400000;
  var MAX_TAGS = 5;
  var TAG_COLORS = ['#6A8DFF', '#EC87B6', '#9A7CF2', '#4CC4AE',
    '#F0A35E', '#F26D7D', '#7FB3CD', '#A6A6B8'];

  var PRIORITY = {
    1: { label: '低优先', short: '低' },
    2: { label: '中优先', short: '中' },
    3: { label: '高优先', short: '高' }
  };

  var URGENCY = {
    1: { label: '从容', icon: 'i-leaf' },
    2: { label: '较急', icon: 'i-clock' },
    3: { label: '紧急', icon: 'i-flame' }
  };

  var FILTERS = ['all', 'today', 'important', 'done'];

  var EN = {
    '待办清单': 'Task list',
    '今日进度': "Today's progress",
    '今日节奏': "Today's rhythm",
    '件': 'items',
    '已完成': 'Done',
    '全部': 'All',
    '今天': 'Today',
    '重要': 'Important',
    '完成': 'Done',
    '排序': 'Sort',
    '重要程度': 'Priority',
    '紧急程度': 'Urgency',
    '自定义': 'Custom',
    '标签筛选': 'Filter by tag',
    '标签': 'Tags',
    '添加标签': 'Add tag',
    '清空': 'Clear',
    '这一刻，清单是空的': 'Your list is clear',
    '给自己留一点呼吸，或添加一件想做的事。': 'Take a breath, or add something you want to do.',
    '添加待办': 'Add task',
    '任务矩阵': 'Task matrix',
    '先做重要的，再做紧急的。': 'Do what matters first, then what is urgent.',
    '重要且紧急': 'Important & urgent',
    '立即去做': 'Do it now',
    '重要不紧急': 'Important, not urgent',
    '计划去做': 'Schedule it',
    '紧急不重要': 'Urgent, not important',
    '尽快处理': 'Handle it soon',
    '不紧急不重要': 'Neither urgent nor important',
    '稍后再看': 'Later',
    '暂无任务': 'No tasks',
    '收起': 'Collapse',
    '展开': 'Show',
    '今日建议': "Today's suggestion",
    '统计': 'Stats',
    '近 7 天': 'Last 7 days',
    '完成趋势': 'Completion trend',
    '连续完成': 'Streak',
    '最高效的一天': 'Most productive day',
    '优先级分布': 'Priority mix',
    '天': 'days',
    '设置与关于': 'Settings & About',
    '设置': 'Settings',
    '让流光待办更懂你的节奏。': 'Make Liquid Todo fit your rhythm.',
    '偏好': 'PREFERENCES',
    '外观': 'Appearance',
    '选择你喜欢的明暗节奏': 'Choose your light and dark rhythm',
    '跟随系统': 'Follow system',
    '根据系统的深色 / 浅色设置自动切换，无需手动调整': 'Automatically follow the system light/dark setting',
    '深色模式': 'Dark mode',
    '深色背景与柔和光晕，夜间更护眼': 'Dark background and soft glow, easier at night',
    '稳定性': 'Stability',
    '在质感与流畅之间找到平衡': 'Balance texture and smoothness',
    '兼容模式': 'Compatibility mode',
    '降低背景模糊与光斑动画，保留玻璃质感和界面动效。开启后会记住此选择。':
      'Reduce background blur and ambient animation while keeping glass and transitions. Your choice is remembered.',
    '低功耗运行': 'Low power mode',
    '减少环境动画与后台资源占用，长时间使用更省电；开启后会记住此选择。':
      'Reduce ambient animation and background work for longer battery life. Your choice is remembered.',
    '开启后会记住此选择。': 'Your choice is remembered.',
    '不联网 · 无登录 · 数据仅保存在此设备': 'Offline · No account · Data stays on this device',
    '分类与标签': 'Categories & tags',
    '统一的标签分类，最多 5 个': 'One tag system, up to 5 tags',
    '标签管理': 'Manage tags',
    '还没有标签': 'No tags yet',
    '管理': 'Manage',
    '数据与备份': 'Data & backup',
    'AES-256 加密，完全离线': 'AES-256 encrypted, fully offline',
    '本地加密备份': 'Encrypted local backup',
    '导出 .liquidbackup 文件；恢复时可选合并或覆盖当前数据，需要密码解密。':
      'Export a .liquidbackup file; restore can merge or replace current data and needs the password.',
    '备份数据': 'Back up',
    '恢复数据': 'Restore',
    '文件只写入你选择的本地位置，不上传任何数据': 'Files are written only where you choose; nothing is uploaded',
    '隐私与协议': 'Privacy & terms',
    '了解数据如何被保存，以及使用约定': 'How your data is stored and the terms of use',
    '隐私政策': 'Privacy Policy',
    '不联网、不收集账号、数据只在本机': 'Offline, no account, data stays on this device',
    '查看': 'View',
    '用户协议': 'Terms of Use',
    '使用流光待办前请阅读并同意': 'Please read and agree before using Liquid Todo',
    '关于': 'About',
    '把重要的事，放在光里。一款离线优先、尊重隐私的待办应用。':
      'Keep what matters in the light. An offline-first, privacy-respecting todo app.',
    '开发者': 'Developer',
    '联系我': 'Contact',
    '隐私': 'Privacy',
    '不联网 · 不收集数据': 'Offline · No data collection',
    '版本': 'Version',
    '查看更新日志': 'View changelog',
    '保留所有权利': 'All rights reserved',
    '语言 / Language': 'Language',
    '界面语言会记住你的选择': 'Your language choice is remembered',
    '显示语言': 'Display language',
    '简体中文 / English': 'Chinese / English',
    '中文': '中文',
    '新建待办': 'New task',
    '编辑待办': 'Edit task',
    '想完成什么': 'What do you want to finish?',
    '写下一件重要的小事…': 'Write down one important little thing…',
    '先写下一件想做的事吧': 'Write down something you want to do first',
    '备注': 'Notes',
    '可选': 'Optional',
    '补充一点背景，或下一步 action…': 'Add context, or the next action…',
    '重要程度': 'Priority',
    '紧急程度': 'Urgency',
    '分类': 'Category',
    '标签': 'Tag',
    '无标签': 'No tag',
    '截止日期': 'Due date',
    '今天': 'Today',
    '明天': 'Tomorrow',
    '后天': 'Day after tomorrow',
    '不设期限': 'No deadline',
    '自定义日期': 'Custom date',
    '选择具体日期': 'Choose a date',
    '标记完成': 'Mark done',
    '移回待办': 'Move back',
    '删除': 'Delete',
    '保存修改': 'Save changes',
    '添加待办': 'Add task',
    '关闭': 'Close',
    '取消': 'Cancel',
    '确定': 'OK',
    '知道了': 'Got it',
    '我知道了': 'Got it',
    '保存修改': 'Save changes',
    '编辑标签': 'Edit tag',
    '新建标签': 'New tag',
    '标签名称': 'Tag name',
    '颜色': 'Color',
    '取消编辑': 'Cancel editing',
    '已达 5 个上限，可编辑或删除现有标签': 'Limit reached (5). Edit or delete an existing tag.',
    '标签已删除，待办已保留': 'Tag deleted; tasks kept.',
    '标签已更新': 'Tag updated',
    '标签已创建': 'Tag created',
    '还没有待办': 'No tasks yet',
    '还没有完成记录': 'No completed tasks yet',
    '完成一件小事，也算向前走了一步。': 'Finishing one small thing is still a step forward.',
    '今天没有待办': 'Nothing due today',
    '给自己留一点空白，或者添加一件想做的事。': 'Leave some space, or add something you want to do.',
    '没有高优先任务': 'No high-priority tasks',
    '把重要的事留出来，是很好的节奏。': 'Making room for what matters is a good rhythm.',
    '这个标签下还没有待办': 'No tasks with this tag',
    '换一个标签看看，或添加一件新的事。': 'Try another tag, or add something new.',
    '按重要度排序': 'By priority',
    '按紧急度排序': 'By urgency',
    '自定义排序': 'Custom order',
    '上移': 'Move up',
    '下移': 'Move down',
    '已经在最前面了': 'Already at the top',
    '已经在最后面了': 'Already at the bottom',
    '关闭低功耗模式？': 'Turn off low power mode?',
    '关闭后会恢复完整模糊与循环光影，可能增加功耗、发热，并在部分设备上出现运行不稳定。':
      'This restores full blur and ambient animation. It may increase power use, heat, and instability on some devices.',
    '仍然关闭': 'Turn off anyway',
    '已开启低功耗运行，将记住此选择': 'Low power mode on. Your choice is remembered.',
    '已关闭低功耗运行': 'Low power mode off.',
    '恢复备份': 'Restore backup',
    '备份包含': 'This backup contains',
    '选择恢复方式：': 'Choose how to restore:',
    '合并': 'Merge',
    '覆盖': 'Replace',
    '合并会保留当前待办，只把备份中不存在的条目加入；覆盖会替换当前全部数据。':
      'Merge keeps current tasks and adds missing backup items; Replace overwrites all current data.',
    '覆盖并恢复': 'Replace and restore',
    '恢复失败，请重试': 'Restore failed. Please try again.',
    '恢复完成': 'Restore complete',
    '已合并备份': 'Backup merged',
    '创建加密备份': 'Create encrypted backup',
    '恢复加密备份': 'Restore encrypted backup',
    '设置一个备份密码。文件使用 AES-256 加密，密码不会保存在任何地方。':
      'Set a backup password. The file is AES-256 encrypted and the password is never stored.',
    '输入创建备份时设置的密码。恢复会覆盖当前数据。':
      'Enter the password used for this backup. Restore can merge or replace current data.',
    '备份密码': 'Backup password',
    '确认密码': 'Confirm password',
    '至少 6 个字符': 'At least 6 characters',
    '再输入一次': 'Enter it again',
    '密码至少需要 6 个字符': 'Password must be at least 6 characters',
    '两次输入的密码不一致': 'Passwords do not match',
    '备份功能仅在 Android 应用中可用': 'Backup is available only in the Android app',
    '选择保存位置': 'Choose location',
    '选择备份文件': 'Choose backup file',
    '备份完成': 'Backup complete',
    '备份失败': 'Backup failed',
    '已取消': 'Cancelled',
    '保存失败，请重试': 'Save failed. Please try again.',
    '修改已保存': 'Changes saved',
    '已添加到清单': 'Added to your list',
    '已删除待办': 'Task deleted',
    '已恢复待办': 'Task restored',
    '已恢复完成记录': 'Completed tasks restored',
    '已恢复示例数据': 'Sample data restored',
    '已恢复之前的数据': 'Previous data restored',
    '已清空': 'Cleared',
    '撤销': 'Undo',
    '完成一件，很棒。': 'One done. Nice.',
    '已移回待办': 'Moved back to tasks',
    '没有已完成的待办': 'No completed tasks',
    '欢迎使用流光待办': 'Welcome to Liquid Todo',
    '在开始之前，请阅读并同意《用户协议》和《隐私政策》。流光待办不联网、不收集账号，你的待办和标签只保存在本机；加密备份由你自己保管。':
      'Before you begin, please read and agree to the Terms of Use and Privacy Policy. Liquid Todo is offline, has no account, and keeps your tasks and tags on this device. You control encrypted backups.',
    '暂不同意': 'Not now',
    '同意并继续': 'Agree and continue',
    '在开始之前，请阅读并同意《用户协议》和《隐私政策》。流光待办不联网、不收集账号，你的待办和标签只保存在本机；加密备份由你自己保管。':
      'Before you begin, please read and agree to the Terms of Use and Privacy Policy. Liquid Todo is offline, has no account, and keeps your tasks and tags on this device. You control encrypted backups.',
    '欢迎使用流光待办': 'Welcome to Liquid Todo',
    '开始使用': 'Get started',
    '隐私政策与用户协议': 'Privacy Policy and Terms of Use',
    '需要同意隐私政策与用户协议后才能继续使用':
      'You need to agree to the Privacy Policy and Terms of Use to continue.',
    '已同意隐私政策与用户协议': 'Privacy Policy and Terms of Use accepted.',
    '更新日志': 'Changelog',
    '查看更新日志': 'View changelog',
    '任务矩阵': 'Task matrix',
    '矩阵': 'Matrix',
    '看见每一次完成，累积成的改变。': 'See how every small finish adds up.',
    '进行中': 'In progress',
    '数据仅保存在此设备 · 无需联网': 'Data stays on this device · No internet needed',
    '清空已完成': 'Clear completed',
    '恢复示例数据': 'Restore sample data',
    '最多 5 个。删除标签只会移除关联，不会删除待办。': 'Up to 5 tags. Deleting a tag only removes its link, never the task.',
    '清单': 'List',
    '任务': 'Task',
    '统计': 'Stats',
    '设置': 'Settings',
    '矩阵': 'Matrix',
    '今日': 'Today',
    '本周': 'This week',
    '已完成任务': 'Completed tasks',
    '清除': 'Clear',
    '恢复': 'Restore',
    '示例数据': 'Sample data',
    '关于与隐私': 'About & privacy',
    '工作': 'Work',
    '生活': 'Life',
    '学习': 'Study',
    '健康': 'Health',
    '与关于': '& About',
    '节奏': 'Rhythm',
    '当前由系统自动控制；关闭“跟随系统”后可手动选择':
      'Currently controlled by the system; turn off Follow system to choose manually',
    '简体中文 / English': 'Chinese / English',
    '标签颜色': 'Tag color',
    '标签名称': 'Tag name',
    '例如：深度工作、家庭、灵感': 'e.g. Deep work, Family, Ideas',
    '取消编辑': 'Cancel editing',
    '保存': 'Save',
    '保存修改': 'Save changes',
    '新建标签': 'New tag',
    '编辑标签': 'Edit tag',
    '删除标签': 'Delete tag',
    '今天完成': 'Completed today',
    '今日完成率': "Today's completion",
    '最高效的一天': 'Most productive day',
    '优先级分布': 'Priority mix',
    '完成趋势': 'Completion trend',
    '连续完成': 'Streak',
    '还没有足够的数据': 'Not enough data yet',
    '等待第一件完成': 'Waiting for the first one',
    '数据仅保存在此设备': 'Data stays on this device',
    '无需联网': 'No internet needed',
    '开启': 'On',
    '关闭': 'Off',
    '默认开启。减少环境动画与后台资源占用，长时间使用更省电；关闭后会提示可能的影响。':
      'On by default. Reduces ambient animation and background work for longer battery life; turning it off shows a warning.',
    '关闭后会恢复完整模糊与循环光影，可能增加功耗、发热，并在部分设备上出现运行不稳定。':
      'This restores full blur and ambient animation. It may increase power use, heat, and instability on some devices.',
    '仍要关闭': 'Turn off anyway',
    '关闭低功耗模式？': 'Turn off low power mode?',
    '标签已添加': 'Tag added',
    '最多只能有 5 个标签': 'You can have at most 5 tags',
    '流光待办': 'Liquid Todo',
    '5 / 5 个标签': '5 / 5 tags',
    '10月30日 · 星期五': 'Oct 30 · Friday',
    'YOUR RHYTHM': 'YOUR RHYTHM',
    '今日节奏': "Today's rhythm",
    '今日完成': "Today's progress",
    '已完成': 'done',
    '还剩下': 'left',
    '件': 'items',
    '低优先': 'Low',
    '中优先': 'Medium',
    '高优先': 'High',
    '低': 'Low',
    '中': 'Medium',
    '高': 'High',
    '从容': 'Relaxed',
    '较急': 'Soon',
    '紧急': 'Urgent',
    '每日一记': 'Daily note',
    '今天': 'Today',
    '明天': 'Tomorrow',
    '后天': 'In 2 days',
    '已逾期': 'Overdue',
    '无期限': 'No deadline',
    '今天的待办都完成了，给自己一点掌声。': 'Everything due today is done. Give yourself some credit.',
    '把重要的事放在前面，其他的慢慢来。': 'Put what matters first; the rest can wait.',
    '清单很轻，今天可以按自己的节奏来。': 'A light list. Move at your own pace today.',
    '夜深了，早点休息。': "It's late. Rest early.",
    '今天的待办都完成了，早点休息。': 'Everything due today is done. Rest early.',
    '夜深了，剩下的事明天再继续。': "It's late. Leave the rest for tomorrow.",
    '今天还没有安排，给自己留一点空白。': 'Nothing scheduled today. Leave yourself some space.',
    '全部完成，今晚可以安心休息了。': 'All done. Rest easy tonight.',
    '只剩 1 件，完成后就为今天收尾。': 'One left. Finish it and close the day.',
    '还剩 ': '',
    ' 件，先完成最重要的一件。': ' left. Start with the most important one.',
    '还没有完成记录': 'No completed tasks yet',
    '完成一件小事，也算向前走了一步。': 'Finishing one small thing is still a step forward.',
    '今天没有待办': 'Nothing due today',
    '给自己留一点空白，或者添加一件想做的事。': 'Leave some space, or add something you want to do.',
    '没有高优先任务': 'No high-priority tasks',
    '把重要的事留出来，是很好的节奏。': 'Making room for what matters is a good rhythm.',
    '这一刻，清单是空的': 'Your list is clear',
    '给自己留一点呼吸，或添加一件想做的事。': 'Take a breath, or add something you want to do.',
    '这个标签下还没有待办': 'No tasks with this tag',
    '换一个标签看看，或添加一件新的事。': 'Try another tag, or add something new.',
    '今天': 'Today',
    '最近 7 天': 'Last 7 days',
    '近 7 天': 'Last 7 days',
    '完成': 'Done',
    '件完成': 'done',
    '最高效': 'Most productive',
    '无记录': 'No record',
    '还没有足够的数据': 'Not enough data yet',
    '连续': 'Streak',
    '天': 'days',
    '今日完成率': "Today's completion",
    '优先级': 'Priority',
    '高': 'High',
    '中': 'Medium',
    '低': 'Low',
    '今日建议': "Today's suggestion",
    '重要且紧急': 'Important & urgent',
    '重要不紧急': 'Important, not urgent',
    '紧急不重要': 'Urgent, not important',
    '不紧急不重要': 'Neither urgent nor important',
    '立即去做': 'Do it now',
    '计划去做': 'Schedule it',
    '尽快处理': 'Handle it soon',
    '稍后再看': 'Later',
    '暂无任务': 'No tasks',
    '还没有标签': 'No tags yet',
    '标签已删除': 'Tag deleted',
    '标签已创建': 'Tag created',
    '标签已更新': 'Tag updated',
    '标签名称不能为空': 'Tag name cannot be empty',
    '标签名称已存在': 'That tag name already exists',
    '已保存': 'Saved',
    '密码错误，或备份文件已损坏': 'Wrong password, or the backup file is damaged.',
    '备份内容无法识别': 'Unrecognised backup content.',
    '没有找到可用的文件选择器': 'No file picker available.',
    '操作已失效，请重试': 'This action expired. Please try again.',
    '操作已中断，请重试': 'The action was interrupted. Please try again.',
    '没有待恢复的备份': 'There is no backup waiting to be restored.',
    '文件过大': 'File is too large.',
    '无法读取文件': 'Unable to read the file.',
    '无法写入文件': 'Unable to write the file.',
    '备份失败，请检查存储位置后重试': 'Backup failed. Check the storage location and try again.',
    '已完成': 'Done',
    '今天': 'Today',
    '件待办': 'tasks',
    '件已完成': 'completed',
    '件今天': 'due today',
    '件重要': 'important'
  };

  var DEFAULT_TAG_EN = {
    '工作': 'Work',
    '生活': 'Life',
    '学习': 'Study',
    '健康': 'Health'
  };

  function displayTagName(tag) {
    if (!tag) return '';
    if (state.lang === 'en' && DEFAULT_TAG_EN[tag.name]) return DEFAULT_TAG_EN[tag.name];
    return tag.name;
  }

  var EN_PATTERNS = [
    [/^(\d+) 件待办$/, '$1 tasks'],
    [/^(\d+) 件今天$/, '$1 due today'],
    [/^(\d+) 件重要$/, '$1 important'],
    [/^(\d+) 件已完成$/, '$1 completed'],
    [/^(\d+) 件$/, '$1 items'],
    [/^还剩 (\d+) 件，先完成最重要的一件。$/, '$1 left. Start with the most important one.'],
    [/^只剩 1 件，完成后就为今天收尾。$/, 'One left. Finish it and close the day.'],
    [/^还有 (\d+) 件已经逾期，先处理最要紧的那一件。$/, '$1 overdue. Handle the most urgent one first.'],
    [/^展开 (\d+) 件$/, 'Show $1'],
    [/^\+(\d+) 件$/, '+$1'],
    [/^(\d+) 天$/, '$1 days'],
    [/^连续 (\d+) 天$/, '$1-day streak'],
    [/^(\d+) 件待办 · (\d+) 个标签$/, '$1 tasks · $2 tags'],
    [/^(\d+) 件已经逾期，先处理最要紧的那一件。$/, '$1 overdue. Handle the most urgent one first.'],
    [/^已清空 (\d+) 件完成$/, 'Cleared $1 completed'],
    [/^已清空 (\d+) 件完成，撤销$/, 'Cleared $1 completed'],
    [/^(\d+) 件待办$/, '$1 tasks'],
    [/^(\d+) 件今天$/, '$1 due today'],
    [/^(\d+) 件重要$/, '$1 important'],
    [/^(\d+) 件已完成$/, '$1 completed'],
    [/^(\d+) 件完成$/, '$1 completed'],
    [/^(\d+) 个标签$/, '$1 tags'],
    [/^(\d+) \/ 5 个标签$/, '$1 / 5 tags'],
    [/^(.*)保留所有权利$/, '$1All rights reserved'],
    [/^(\d+) \/ 5$/, '$1 / 5'],
    [/^还剩 (\d+) 件$/, '$1 left'],
    [/^连续 (\d+) 天$/, '$1-day streak'],
    [/^(\d+) 天$/, '$1 days']
  ];

  function translateText(text) {
    if (state.lang !== 'en') return text;
    var source = String(text == null ? '' : text);
    var trimmed = source.trim();
    if (!trimmed) return source;
    var translated = EN[trimmed];
    if (!translated) {
      for (var i = 0; i < EN_PATTERNS.length; i++) {
        if (EN_PATTERNS[i][0].test(trimmed)) {
          translated = trimmed.replace(EN_PATTERNS[i][0], EN_PATTERNS[i][1]);
          break;
        }
      }
    }
    if (!translated) return source;
    var lead = source.match(/^\s*/)[0];
    var trail = source.match(/\s*$/)[0];
    return lead + translated + trail;
  }

  function shouldSkipTranslation(node) {
    var el = node.parentElement;
    if (!el) return false;
    if (el.closest('script, style, textarea, .task-title, .task-notes, .q-task, .legal-copy user-content')) {
      return true;
    }
    return false;
  }

  function applyLanguage(root) {
    root = root || document.body;
    if (!root) return;
    if (state.lang === 'en') document.documentElement.lang = 'en';
    else document.documentElement.lang = 'zh-CN';
    if (typeof document.createTreeWalker !== 'function' || typeof NodeFilter === 'undefined') return;

    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var textNode;
    while ((textNode = walker.nextNode())) {
      if (shouldSkipTranslation(textNode)) continue;
      var raw = textNode.nodeValue;
      if (!raw || !raw.trim()) continue;
      if (state.lang === 'en') {
        if (textNode.__enText != null && raw === textNode.__enText && textNode.__zhText != null) {
          textNode.nodeValue = translateText(textNode.__zhText);
        } else if (/[\u4e00-\u9fff]/.test(raw)) {
          textNode.__zhText = raw;
          textNode.__enText = translateText(raw);
          textNode.nodeValue = textNode.__enText;
        }
      } else if (textNode.__zhText != null && raw === textNode.__enText) {
        textNode.nodeValue = textNode.__zhText;
        textNode.__zhText = null;
        textNode.__enText = null;
      }
    }

    var attrs = ['placeholder', 'aria-label', 'title'];
    $$('[placeholder], [aria-label], [title]', root).forEach(function (el) {
      if (el.closest('.task-main, .task-check, .q-task')) return;
      attrs.forEach(function (attr) {
        if (!el.hasAttribute(attr)) return;
        if (!el.__zhAttrs) el.__zhAttrs = {};
        if (state.lang === 'en') {
          if (el.__zhAttrs[attr] == null) el.__zhAttrs[attr] = el.getAttribute(attr);
          el.setAttribute(attr, translateText(el.__zhAttrs[attr]));
        } else if (el.__zhAttrs[attr] != null) {
          el.setAttribute(attr, el.__zhAttrs[attr]);
          delete el.__zhAttrs[attr];
        }
      });
    });
  }

  function setLang(lang) {
    state.lang = lang === 'en' ? 'en' : 'zh';
    saveState();
    renderAll();
    applyLanguage(document.body);
    syncLangButtons();
    haptic('light');
  }

  function syncLangButtons() {
    $$('#langSwitch .lang-btn, #consentLangSwitch .lang-btn').forEach(function (btn) {
      var active = btn.getAttribute('data-lang') === state.lang;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  var state = {
    version: VERSION,
    tasks: [],
    tags: [],
    theme: null,
    view: 'list',
    filter: 'all',
    tagFilter: 'all',
    sort: 'priority',
    lang: 'zh'
  };

  var editingId = null;
  var editingTagId = null;
  var selectedTagColor = TAG_COLORS[0];
  var form = { priority: 2, urgency: 1, due: null, tagId: null };
  var sheetOpen = false;
  var dialogOpen = false;
  var matrixExpanded = {};
  var saveTimer = null;
  var toastTimer = null;
  var lastFocused = null;

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------------- Date helpers ---------------- */

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  function dateKey(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function keyToDate(key) {
    if (!key) return null;
    var p = String(key).split('-').map(Number);
    if (p.length !== 3 || !p[0] || !p[1] || !p[2]) return null;
    return new Date(p[0], p[1] - 1, p[2], 12, 0, 0, 0);
  }

  function validDateKey(key) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(key || ''))) return false;
    var d = keyToDate(key);
    return !!d && dateKey(d) === key;
  }

  function addDays(offset) {
    var d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + offset);
    return dateKey(d);
  }

  function daysUntil(key) {
    if (!key) return null;
    var a = keyToDate(key);
    var b = keyToDate(dateKey());
    if (!a || !b) return null;
    return Math.round((a.getTime() - b.getTime()) / DAY);
  }

  function weekdayCN(d) {
    if (state.lang === 'en') {
      return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];
    }
    return ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][d.getDay()];
  }

  function weekdayShort(d) {
    if (state.lang === 'en') {
      return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()];
    }
    return ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
  }

  function headerDate() {
    var d = new Date();
    if (state.lang === 'en') {
      return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()] +
        ' ' + d.getDate() + ' · ' + weekdayCN(d);
    }
    return (d.getMonth() + 1) + '月' + d.getDate() + '日 · ' + weekdayCN(d);
  }

  function fullDate(key) {
    var d = keyToDate(key);
    if (!d) return state.lang === 'en' ? 'No deadline' : '不设期限';
    if (state.lang === 'en') {
      return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()] +
        ' ' + d.getDate() + ' · ' + weekdayCN(d);
    }
    return (d.getMonth() + 1) + '月' + d.getDate() + '日 · ' + weekdayCN(d);
  }

  function greetingCopy() {
    var h = new Date().getHours();
    if (state.lang === 'en') {
      if (h < 5) return { lead: "It's late. ", accent: 'Rest early', night: true,
        sub: 'Leave the rest for tomorrow. Take good care of yourself tonight.' };
      if (h < 9) return { lead: 'Good morning, ', accent: 'take it slow', night: false,
        sub: 'A new day. Start with the one thing that matters most.' };
      if (h < 12) return { lead: 'Good morning, ', accent: 'stay focused', night: false,
        sub: 'Put what matters first; the rest can wait.' };
      if (h < 14) return { lead: 'Good afternoon, ', accent: 'take a break', night: false,
        sub: 'Eat well, rest a little, then continue.' };
      if (h < 18) return { lead: 'Good afternoon, ', accent: 'take it slow', night: false,
        sub: 'Put what matters first; the rest can wait.' };
      if (h < 22) return { lead: 'Good evening, ', accent: 'take it slow', night: false,
        sub: 'Put what matters first; the rest can wait.' };
      return { lead: "It's late. ", accent: 'Rest early', night: true,
        sub: 'Leave the rest for tomorrow. Take good care of yourself tonight.' };
    }
    if (h < 5) {
      return { lead: '夜深了，', accent: '早些休息', night: true,
        sub: '把重要的事留到明天，今晚先好好休息。' };
    }
    if (h < 9) {
      return { lead: '早上好，', accent: '慢慢来', night: false,
        sub: '新的一天，先做最重要的一件。' };
    }
    if (h < 12) {
      return { lead: '上午好，', accent: '保持专注', night: false,
        sub: '把重要的事放在前面，其他的慢慢来。' };
    }
    if (h < 14) {
      return { lead: '中午好，', accent: '记得休息', night: false,
        sub: '吃好、歇一会儿，再继续也不迟。' };
    }
    if (h < 18) {
      return { lead: '下午好，', accent: '慢慢来', night: false,
        sub: '把重要的事放在前面，其他的慢慢来。' };
    }
    if (h < 22) {
      return { lead: '晚上好，', accent: '慢慢来', night: false,
        sub: '把重要的事放在前面，其他的慢慢来。' };
    }
    return { lead: '夜深了，', accent: '早些休息', night: true,
      sub: '把重要的事留到明天，今晚先好好休息。' };
  }

  function uid() {
    try {
      if (window.crypto && typeof window.crypto.randomUUID === 'function') {
        return window.crypto.randomUUID();
      }
    } catch (e) {}
    return 't-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  function isoAt(offset, hour, minute) {
    var d = new Date();
    d.setHours(hour == null ? 12 : hour, minute == null ? 0 : minute, 0, 0);
    d.setDate(d.getDate() + offset);
    return d.toISOString();
  }

  /* ---------------- Seed data ---------------- */

  function makeTask(title, notes, priority, urgency, due, category, completed, completedAt, createdAt, tagId) {
    return {
      id: uid(),
      title: title,
      notes: notes || '',
      priority: priority,
      urgency: urgency,
      due: due,
      category: category,
      tagId: tagId || null,
      completed: !!completed,
      completedAt: completed ? (completedAt || new Date().toISOString()) : null,
      createdAt: createdAt || new Date().toISOString()
    };
  }

  var CATEGORY_TAG_META = [
    { name: '工作', color: '#6A8DFF', id: 'tag-cat-work' },
    { name: '生活', color: '#EC87B6', id: 'tag-cat-life' },
    { name: '学习', color: '#9A7CF2', id: 'tag-cat-study' },
    { name: '健康', color: '#4CC4AE', id: 'tag-cat-health' }
  ];

  function seedTags() {
    return CATEGORY_TAG_META.map(function (item, index) {
      return {
        id: item.id,
        name: item.name,
        color: item.color,
        sortOrder: index,
        createdAt: new Date().toISOString()
      };
    });
  }

  function tagIdForCategory(category) {
    for (var i = 0; i < CATEGORY_TAG_META.length; i++) {
      if (CATEGORY_TAG_META[i].name === category) return CATEGORY_TAG_META[i].id;
    }
    return null;
  }

  function seedTasks() {
    var today = dateKey();
    var now = Date.now();
    var tasks = [
      makeTask('完成产品提案的最后一页', '补充竞品分析，并把数据更新到最新版本。', 3, 3, today, '工作', false, null, new Date(now - 4 * 3600000).toISOString()),
      makeTask('给妈妈回个电话', '问问她最近睡得怎么样。', 3, 2, today, '生活', false, null, new Date(now - 3 * 3600000).toISOString()),
      makeTask('回复物业群消息', '确认周六的停水时间。', 1, 3, today, '生活', false, null, new Date(now - 2.4 * 3600000).toISOString()),
      makeTask('阅读《设计中的设计》30 分钟', '从第 62 页继续，记下三个触动的观点。', 2, 1, today, '学习', false, null, new Date(now - 2 * 3600000).toISOString()),
      makeTask('预约年度体检', '选一个工作日上午，空腹前往。', 2, 1, addDays(1), '健康', false, null, new Date(now - 26 * 3600000).toISOString()),
      makeTask('整理旅行照片', '挑出 12 张，做成一本小小的相册。', 1, 1, addDays(2), '生活', false, null, new Date(now - 30 * 3600000).toISOString()),

      makeTask('回复客户邮件', '把交付时间与范围再确认一次。', 2, 3, today, '工作', true, new Date(now - 3.5 * 3600000).toISOString(), new Date(now - 6 * 3600000).toISOString()),
      makeTask('晚间拉伸 15 分钟', '', 1, 2, today, '健康', true, new Date(now - 1 * 3600000).toISOString(), new Date(now - 8 * 3600000).toISOString()),

      makeTask('整理季度预算', '把报销单据归档。', 2, 2, addDays(-1), '工作', true, isoAt(-1, 20, 10)),
      makeTask('晨跑 5 公里', '', 1, 2, addDays(-2), '健康', true, isoAt(-2, 7, 30)),
      makeTask('整理书桌', '只留下正在读的那本书。', 1, 1, addDays(-3), '生活', true, isoAt(-3, 21, 0)),
      makeTask('给绿植浇水', '', 1, 1, addDays(-4), '生活', true, isoAt(-4, 8, 0)),
      makeTask('复盘周会', '写下三个可以做得更好的地方。', 2, 2, addDays(-5), '工作', true, isoAt(-5, 19, 0)),
      makeTask('读完一篇文章', '', 1, 1, addDays(-6), '学习', true, isoAt(-6, 22, 0)),

      makeTask('整理发票', '', 2, 1, addDays(-8), '工作', true, isoAt(-8, 18, 0)),
      makeTask('预约健身房体验课', '', 1, 2, addDays(-9), '健康', true, isoAt(-9, 12, 0)),
      makeTask('读完一章《原子习惯》', '', 2, 1, addDays(-10), '学习', true, isoAt(-10, 22, 0)),
      makeTask('清理下载文件夹', '', 1, 1, addDays(-11), '工作', true, isoAt(-11, 17, 0)),
      makeTask('给朋友回消息', '', 1, 1, addDays(-12), '生活', true, isoAt(-12, 20, 0)),
      makeTask('周计划复盘', '', 2, 1, addDays(-13), '工作', true, isoAt(-13, 19, 0))
    ];
    tasks.forEach(function (task, index) {
      task.tagId = tagIdForCategory(task.category);
      task.sortOrder = index + 1;
    });
    return tasks;
  }

  function defaultState() {
    return {
      version: VERSION,
      tasks: seedTasks(),
      tags: seedTags(),
      tagSchema: true,
      theme: null,
      view: 'list',
      filter: 'all',
      tagFilter: 'all',
      sort: 'priority',
      lang: 'zh'
    };
  }

  /* ---------------- Persistence ---------------- */

  function validTagColor(value) {
    return /^#[0-9A-Fa-f]{6}$/.test(String(value || ''));
  }

  function normalizeTag(t, index) {
    if (!t || typeof t !== 'object') return null;
    var name = String(t.name || '').trim().slice(0, 12);
    if (!name) return null;
    var color = validTagColor(t.color)
      ? String(t.color).toUpperCase()
      : TAG_COLORS[index % TAG_COLORS.length];
    return {
      id: String(t.id || 'tag-' + uid()),
      name: name,
      color: color,
      sortOrder: Number(t.sortOrder) || index,
      createdAt: t.createdAt || new Date().toISOString()
    };
  }

  function normalizeTags(list) {
    var result = [];
    var names = {};
    var ids = {};
    (Array.isArray(list) ? list : []).forEach(function (item, index) {
      if (result.length >= MAX_TAGS) return;
      var tag = normalizeTag(item, index);
      if (!tag || names[tag.name] || ids[tag.id]) return;
      names[tag.name] = true;
      ids[tag.id] = true;
      result.push(tag);
    });
    return result;
  }

  function tagById(id) {
    if (!id) return null;
    for (var i = 0; i < state.tags.length; i++) {
      if (state.tags[i].id === id) return state.tags[i];
    }
    return null;
  }

  function normalizeTask(t, index) {
    if (!t || typeof t !== 'object' || !t.title) return null;
    return {
      id: String(t.id || uid()),
      title: String(t.title).slice(0, 120),
      notes: String(t.notes || '').slice(0, 300),
      priority: Math.min(3, Math.max(1, Number(t.priority) || 1)),
      urgency: Math.min(3, Math.max(1, Number(t.urgency) || 1)),
      due: validDateKey(t.due) ? String(t.due).slice(0, 10) : null,
      category: String(t.category || ''),
      tagId: t.tagId ? String(t.tagId) : null,
      completed: !!t.completed,
      completedAt: t.completed ? (t.completedAt || new Date().toISOString()) : null,
      createdAt: t.createdAt || new Date().toISOString(),
      sortOrder: Number.isFinite(Number(t.sortOrder)) ? Number(t.sortOrder) : index + 1
    };
  }

  function integrateClassification(tasks, tags) {
    var result = [];
    var byName = {};
    var byId = {};

    function add(tag) {
      if (!tag || result.length >= MAX_TAGS) return null;
      if (byName[tag.name]) return byName[tag.name];
      if (byId[tag.id]) tag.id = 'tag-' + uid();
      result.push(tag);
      byName[tag.name] = tag;
      byId[tag.id] = tag;
      return tag;
    }

    var categoryNames = CATEGORY_TAG_META.map(function (item) { return item.name; });
    tasks.forEach(function (task) {
      if (task.category && categoryNames.indexOf(task.category) < 0) {
        categoryNames.push(task.category);
      }
    });

    var categoryTags = {};
    categoryNames.forEach(function (name, index) {
      if (result.length >= MAX_TAGS) return;
      var existing = null;
      for (var i = 0; i < tags.length; i++) {
        if (tags[i].name === name) { existing = tags[i]; break; }
      }
      var meta = null;
      for (var m = 0; m < CATEGORY_TAG_META.length; m++) {
        if (CATEGORY_TAG_META[m].name === name) { meta = CATEGORY_TAG_META[m]; break; }
      }
      var tag = add({
        id: existing ? existing.id : (meta ? meta.id : 'tag-cat-' + index),
        name: name,
        color: existing ? existing.color : (meta ? meta.color : TAG_COLORS[index % TAG_COLORS.length]),
        sortOrder: index,
        createdAt: existing ? existing.createdAt : new Date().toISOString()
      });
      if (tag) categoryTags[name] = tag;
    });

    var grouped = {};
    tasks.forEach(function (task) {
      if (!task.tagId) return;
      if (!grouped[task.tagId]) grouped[task.tagId] = [];
      grouped[task.tagId].push(task);
    });

    tags.forEach(function (tag) {
      var isCategory = false;
      for (var name in categoryTags) {
        if (categoryTags[name] && categoryTags[name].id === tag.id) isCategory = true;
      }
      if (isCategory) return;
      var related = grouped[tag.id] || [];
      if (!related.length) return;
      var categories = {};
      related.forEach(function (task) {
        if (task.category) categories[task.category] = true;
      });
      var keys = Object.keys(categories);
      // A tag used inside only one existing category is redundant after merging.
      if (keys.length === 1 && categoryTags[keys[0]]) return;
      if (result.length >= MAX_TAGS) return;
      add({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        sortOrder: result.length,
        createdAt: tag.createdAt
      });
    });

    tasks.forEach(function (task) {
      var tag = null;
      if (task.tagId) {
        for (var i = 0; i < result.length; i++) {
          if (result[i].id === task.tagId) { tag = result[i]; break; }
        }
      }
      if (!tag && task.category && categoryTags[task.category]) {
        tag = categoryTags[task.category];
      }
      task.tagId = tag ? tag.id : null;
      task.category = tag ? tag.name : '';
    });

    return { tasks: tasks, tags: result };
  }

  function stateFromBackupJson(raw) {
    var data = JSON.parse(raw);
    if (!data || !Array.isArray(data.tasks)) throw new Error('invalid backup');
    var tags = normalizeTags(data.tags);
    var tasks = data.tasks.map(normalizeTask).filter(Boolean);
    var schema = data.tagSchema === true;
    if (!schema) {
      var integrated = integrateClassification(tasks, tags);
      tasks = integrated.tasks;
      tags = integrated.tags;
      schema = true;
    } else {
      var ids = {};
      tags.forEach(function (tag) { ids[tag.id] = true; });
      tasks.forEach(function (task) {
        if (task.tagId && !ids[task.tagId]) task.tagId = null;
      });
    }
    return {
      tasks: tasks,
      tags: tags,
      tagSchema: schema,
      theme: data.theme === 'dark' || data.theme === 'light' ? data.theme : null,
      sort: data.sort === 'urgency' || data.sort === 'custom' ? data.sort : 'priority',
      lang: data.lang === 'en' ? 'en' : 'zh'
    };
  }

  function loadState() {
    var raw = null;
    try {
      if (window.Android && typeof window.Android.loadState === 'function') {
        raw = window.Android.loadState();
      }
    } catch (e) {}
    if (!raw) {
      try { raw = window.localStorage.getItem(STORAGE_KEY); } catch (e) {}
    }
    if (!raw) return defaultState();

    try {
      var data = JSON.parse(raw);
      if (!data || !Array.isArray(data.tasks)) return defaultState();
      var tags = normalizeTags(data.tags);
      var tasks = data.tasks.map(normalizeTask).filter(Boolean);
      var tagSchema = data.tagSchema === true;
      if (!tagSchema) {
        var integrated = integrateClassification(tasks, tags);
        tasks = integrated.tasks;
        tags = integrated.tags;
        tagSchema = true;
      } else {
        var tagIds = {};
        tags.forEach(function (tag) { tagIds[tag.id] = true; });
        tasks.forEach(function (task) {
          if (task.tagId && !tagIds[task.tagId]) task.tagId = null;
        });
      }
      return {
        version: VERSION,
        tasks: tasks,
        tags: tags,
        tagSchema: tagSchema,
        theme: data.theme === 'dark' || data.theme === 'light' ? data.theme : null,
        view: 'list',
        filter: 'all',
        tagFilter: 'all',
        sort: data.sort === 'urgency' || data.sort === 'custom' ? data.sort : 'priority',
        lang: data.lang === 'en' ? 'en' : 'zh'
      };
    } catch (e) {
      return defaultState();
    }
  }

  function persistNow() {
    var raw;
    try { raw = JSON.stringify(state); } catch (e) { return; }
    try {
      if (window.Android && typeof window.Android.saveState === 'function') {
        window.Android.saveState(raw);
      } else {
        window.localStorage.setItem(STORAGE_KEY, raw);
      }
    } catch (e) {}
  }

  function saveState() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      saveTimer = null;
      persistNow();
    }, 90);
  }

  function setBackGuard(value) {
    try {
      if (window.Android && typeof window.Android.setBackGuard === 'function') {
        window.Android.setBackGuard(!!value);
      }
    } catch (e) {}
  }

  function haptic(type) {
    type = type || 'light';
    try {
      if (window.Android && typeof window.Android.haptic === 'function') {
        window.Android.haptic(type);
        return;
      }
      if (navigator.vibrate) {
        navigator.vibrate(type === 'success' ? [10, 35, 16] : 9);
      }
    } catch (e) {}
  }

  /* ---------------- Utilities ---------------- */

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function getTask(id) {
    for (var i = 0; i < state.tasks.length; i++) {
      if (state.tasks[i].id === id) return state.tasks[i];
    }
    return null;
  }

  function activeTasks() {
    return state.tasks.filter(function (t) { return !t.completed; });
  }

  function taskScore(t) {
    return t.priority * 3 + t.urgency;
  }

  function nextSortOrder() {
    var max = 0;
    state.tasks.forEach(function (task) {
      var value = Number(task.sortOrder) || 0;
      if (value > max) max = value;
    });
    return max + 1;
  }

  function sortByPriority(a, b) {
    var diff = taskScore(b) - taskScore(a);
    if (diff) return diff;
    var da = a.due || '9999-12-31';
    var db = b.due || '9999-12-31';
    if (da !== db) return da < db ? -1 : 1;
    return String(a.createdAt).localeCompare(String(b.createdAt));
  }

  function sortByUrgency(a, b) {
    var diff = b.urgency - a.urgency;
    if (diff) return diff;
    diff = b.priority - a.priority;
    if (diff) return diff;
    var da = a.due || '9999-12-31';
    var db = b.due || '9999-12-31';
    if (da !== db) return da < db ? -1 : 1;
    return String(a.createdAt).localeCompare(String(b.createdAt));
  }

  function sortByCustom(a, b) {
    var diff = (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0);
    if (diff) return diff;
    return String(a.createdAt).localeCompare(String(b.createdAt));
  }

  function activeComparator() {
    if (state.sort === 'urgency') return sortByUrgency;
    if (state.sort === 'custom') return sortByCustom;
    return sortByPriority;
  }

  function quadOf(t) {
    var important = t.priority >= 2;
    var urgent = t.urgency >= 2;
    if (important && urgent) return 'q1';
    if (important && !urgent) return 'q2';
    if (!important && urgent) return 'q3';
    return 'q4';
  }

  function priorityLabel(value) {
    if (state.lang === 'en') return ['Low', 'Medium', 'High'][Math.min(3, Math.max(1, value)) - 1];
    return (PRIORITY[value] || PRIORITY[1]).label;
  }

  function urgencyLabel(value) {
    if (state.lang === 'en') return ['Relaxed', 'Soon', 'Urgent'][Math.min(3, Math.max(1, value)) - 1];
    return (URGENCY[value] || URGENCY[1]).label;
  }

  function dueInfo(t) {
    var en = state.lang === 'en';
    if (t.completed) return { label: en ? 'Done' : '已完成', cls: 'is-done' };
    if (!t.due) return { label: en ? 'No deadline' : '无期限', cls: '' };
    var diff = daysUntil(t.due);
    if (diff == null) return { label: en ? 'No deadline' : '无期限', cls: '' };
    if (diff < 0) return { label: en ? 'Overdue' : '已逾期', cls: 'is-late' };
    if (diff === 0) return { label: en ? 'Today' : '今天', cls: 'is-today' };
    if (diff === 1) return { label: en ? 'Tomorrow' : '明天', cls: '' };
    if (diff === 2) return { label: en ? 'In 2 days' : '后天', cls: '' };
    var d = keyToDate(t.due);
    if (en) {
      return { label: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()] +
        ' ' + d.getDate(), cls: '' };
    }
    return { label: (d.getMonth() + 1) + '月' + d.getDate() + '日', cls: '' };
  }

  function completedOn(key) {
    return state.tasks.filter(function (t) {
      return t.completed && t.completedAt && dateKey(new Date(t.completedAt)) === key;
    }).length;
  }

  /* ---------------- Header ---------------- */

  function todayTasks() {
    var today = dateKey();
    return state.tasks.filter(function (t) { return t.due === today; });
  }

  function renderHeader() {
    var today = todayTasks();
    var done = today.filter(function (t) { return t.completed; }).length;
    var total = today.length;
    var remaining = Math.max(0, total - done);
    var pct = total ? Math.round((done / total) * 100) : 0;

    var greeting = greetingCopy();
    $('#dateLabel').textContent = headerDate();
    $('#greeting').innerHTML = greeting.lead +
      '<span class="gradient-text">' + greeting.accent + '</span>';

    var sub;
    var overdue = activeTasks().filter(function (t) {
      return t.due && daysUntil(t.due) < 0;
    }).length;
    if (greeting.night) {
      sub = greeting.sub;
    } else if (overdue > 0) {
      sub = overdue + ' 件已经逾期，先处理最要紧的那一件。';
    } else if (remaining === 0 && total > 0) {
      sub = '今天的待办都完成了，给自己一点掌声。';
    } else if (remaining > 0) {
      sub = '把重要的事放在前面，其他的慢慢来。';
    } else {
      sub = '清单很轻，今天可以按自己的节奏来。';
    }
    $('#subline').textContent = sub;

    $('#heroDone').textContent = done;
    $('#heroTotal').textContent = total;
    $('#ringPct').innerHTML = pct + '<span>%</span>';
    $('#progressRing').style.setProperty('--progress', pct);
    $('#progressRing').setAttribute('aria-label', '今日完成 ' + pct + '%');

    var hint;
    if (greeting.night) {
      if (!total) hint = '夜深了，早点休息。';
      else if (remaining === 0) hint = '今天的待办都完成了，早点休息。';
      else hint = '夜深了，剩下的事明天再继续。';
    } else if (!total) hint = '今天还没有安排，给自己留一点空白。';
    else if (remaining === 0) hint = '全部完成，今晚可以安心休息了。';
    else if (remaining === 1) hint = '只剩 1 件，完成后就为今天收尾。';
    else hint = '还剩 ' + remaining + ' 件，先完成最重要的一件。';
    $('#heroHint').textContent = hint;

    if (state.lang === 'en') {
      document.title = greeting.night ? 'Late night · Liquid Todo'
        : (total && remaining ? remaining + ' tasks · Liquid Todo' : 'Liquid Todo');
    } else {
      document.title = greeting.night ? '夜深了 · 流光待办'
        : (total && remaining ? remaining + ' 件待办 · 流光待办' : '流光待办 · Liquid Todo');
    }
  }

  /* ---------------- List ---------------- */

  function filteredTasks() {
    var today = dateKey();
    var list;
    if (state.filter === 'done') {
      list = state.tasks.filter(function (t) { return t.completed; }).sort(function (a, b) {
        return String(b.completedAt || '').localeCompare(String(a.completedAt || ''));
      });
    } else {
      list = activeTasks();
      if (state.filter === 'today') {
        list = list.filter(function (t) { return t.due && t.due <= today; });
      } else if (state.filter === 'important') {
        list = list.filter(function (t) { return t.priority === 3; });
      }
      list.sort(activeComparator());
    }
    if (state.tagFilter !== 'all') {
      list = list.filter(function (t) { return t.tagId === state.tagFilter; });
    }
    return list;
  }

  function setSort(mode) {
    if (mode !== 'priority' && mode !== 'urgency' && mode !== 'custom') return;
    state.sort = mode;
    saveState();
    renderTasks();
    haptic('light');
  }

  function moveTask(id, direction) {
    var list = activeTasks().sort(sortByCustom);
    var index = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) { index = i; break; }
    }
    if (index < 0) return;
    var target = index + (direction === 'up' ? -1 : 1);
    if (target < 0 || target >= list.length) {
      showToast(direction === 'up' ? '已经在最前面了' : '已经在最后面了');
      return;
    }
    var temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    list.forEach(function (task, i) { task.sortOrder = i + 1; });
    saveState();
    renderTasks();
    haptic('light');
  }

  function renderTagFilter() {
    var wrap = $('#tagFilter');
    if (!wrap) return;
    if (state.tagFilter !== 'all' && !tagById(state.tagFilter)) {
      state.tagFilter = 'all';
    }
    var html = '<button class="tag-pill' + (state.tagFilter === 'all' ? ' is-active' : '') +
      '" type="button" data-tag="all">全部</button>';
    state.tags.forEach(function (tag) {
      html += '<button class="tag-pill' + (state.tagFilter === tag.id ? ' is-active' : '') +
        '" type="button" data-tag="' + escapeHtml(tag.id) + '" style="--tag-color:' +
        escapeHtml(tag.color) + '"><i></i>' + escapeHtml(displayTagName(tag)) + '</button>';
    });
    html += '<button class="tag-pill tag-manage" type="button" data-tag="__manage">' +
      '<span>＋</span>' + (state.tags.length ? '标签' : '添加标签') + '</button>';
    wrap.innerHTML = html;
  }

  function renderTagSummary() {
    var el = $('#tagSummary');
    if (!el) return;
    el.textContent = state.tags.length
      ? state.tags.length + ' / ' + MAX_TAGS + ' 个标签'
      : '还没有自定义标签';
  }

  function renderColorPalette() {
    var wrap = $('#colorPalette');
    if (!wrap) return;
    wrap.innerHTML = TAG_COLORS.map(function (color) {
      return '<button class="color-swatch' + (selectedTagColor === color ? ' is-active' : '') +
        '" type="button" data-color="' + color + '" style="--swatch:' + color +
        '" aria-label="颜色 ' + color + '"></button>';
    }).join('');
  }

  function renderTagList() {
    var list = $('#tagManageList');
    if (!list) return;
    if (!state.tags.length) {
      list.innerHTML = '<div class="tag-manage-empty glass">还没有标签。创建一个，给待办多一层轻分类。</div>';
    } else {
      list.innerHTML = state.tags.map(function (tag) {
        var count = state.tasks.filter(function (t) { return t.tagId === tag.id; }).length;
        return '<div class="tag-manage-row glass" style="--tag-color:' + escapeHtml(tag.color) + '">' +
          '<span class="tag-row-dot"></span>' +
          '<div class="tag-row-main"><span class="tag-row-name">' + escapeHtml(displayTagName(tag)) +
          '</span><span class="tag-row-count">' + count + ' 件待办</span></div>' +
          '<div class="tag-row-actions">' +
            '<button class="tag-icon-btn" type="button" data-edit-tag="' + escapeHtml(tag.id) + '" aria-label="编辑标签"><svg class="icon"><use href="#i-pencil"/></svg></button>' +
            '<button class="tag-icon-btn is-danger" type="button" data-delete-tag="' + escapeHtml(tag.id) + '" aria-label="删除标签"><svg class="icon"><use href="#i-trash"/></svg></button>' +
          '</div>' +
        '</div>';
      }).join('');
    }
    var hint = $('#tagLimitHint');
    if (hint) {
      hint.textContent = state.tags.length >= MAX_TAGS
        ? '已达 5 个上限，可编辑或删除现有标签'
        : state.tags.length + ' / ' + MAX_TAGS;
    }
    var save = $('#saveTagBtn');
    if (save) {
      save.disabled = !editingTagId && state.tags.length >= MAX_TAGS;
    }
  }

  function setTagForm(tag) {
    editingTagId = tag ? tag.id : null;
    selectedTagColor = tag ? tag.color : TAG_COLORS[0];
    var input = $('#tagNameInput');
    if (input) input.value = tag ? tag.name : '';
    $('#tagEditorTitle').textContent = tag ? '编辑标签' : '新建标签';
    $('#saveTagBtn').querySelector('span').textContent = tag ? '保存修改' : '添加标签';
    $('#tagCancelEdit').hidden = !tag;
    renderColorPalette();
    renderTagList();
  }

  function renderTagsView() {
    if (!editingTagId) {
      var input = $('#tagNameInput');
      if (input && !input.value) selectedTagColor = TAG_COLORS[0];
      $('#tagEditorTitle').textContent = '新建标签';
      $('#saveTagBtn').querySelector('span').textContent = '添加标签';
      $('#tagCancelEdit').hidden = true;
    }
    renderColorPalette();
    renderTagList();
    applyLanguage($('[data-view-panel="tags"]'));
  }

  function saveTag() {
    var input = $('#tagNameInput');
    var name = input ? input.value.trim().slice(0, 12) : '';
    if (!name) {
      showToast('先给标签起个名字');
      if (input) input.focus();
      return;
    }
    var duplicate = state.tags.some(function (tag) {
      return tag.name === name && tag.id !== editingTagId;
    });
    if (duplicate) {
      showToast('已经有同名标签了');
      return;
    }
    if (!editingTagId && state.tags.length >= MAX_TAGS) {
      showToast('最多只能有 5 个标签');
      return;
    }
    if (editingTagId) {
      var tag = tagById(editingTagId);
      if (!tag) return;
      tag.name = name;
      tag.color = selectedTagColor;
      showToast('标签已更新');
    } else {
      state.tags.push({
        id: 'tag-' + uid(),
        name: name,
        color: selectedTagColor,
        sortOrder: state.tags.length,
        createdAt: new Date().toISOString()
      });
      showToast('标签已添加');
    }
    saveState();
    setTagForm(null);
    renderAll();
    renderTagsView();
    haptic('success');
  }

  function deleteTag(id) {
    var tag = tagById(id);
    if (!tag) return;
    showConfirm('删除标签', '删除「' + tag.name + '」后，关联的待办会保留，只会移除标签关联。',
      '删除标签', function () {
        state.tags = state.tags.filter(function (item) { return item.id !== id; });
        state.tasks.forEach(function (task) {
          if (task.tagId === id) task.tagId = null;
        });
        if (state.tagFilter === id) state.tagFilter = 'all';
        if (editingTagId === id) setTagForm(null);
        saveState();
        renderAll();
        renderTagsView();
        showToast('标签已删除，待办已保留');
      });
  }

  function taskCardHtml(t, index) {
    var due = dueInfo(t);
    var p = PRIORITY[t.priority] || PRIORITY[1];
    var u = URGENCY[t.urgency] || URGENCY[1];
    var title = escapeHtml(t.title);
    var tag = t.tagId ? tagById(t.tagId) : null;
    var tagHtml = '';
    if (tag) {
      tagHtml = '<span class="tag tag-custom"><i style="background:' +
        escapeHtml(tag.color) + '"></i>' + escapeHtml(displayTagName(tag)) + '</span>';
    }
    var doneCls = t.completed ? ' is-done' : '';
    var orderHtml = '';
    if (state.sort === 'custom' && !t.completed) {
      orderHtml = '<span class="task-order">' +
        '<button class="order-btn" type="button" data-move="up" aria-label="上移">&#8593;</button>' +
        '<button class="order-btn" type="button" data-move="down" aria-label="下移">&#8595;</button>' +
        '</span>';
    }
    return '' +
      '<article class="task-card glass' + doneCls + '" data-id="' + escapeHtml(t.id) + '" style="--i:' + index + '">' +
        '<button class="task-check" type="button" aria-label="' + (t.completed ? '标记为未完成' : '标记为完成') + '" aria-pressed="' + (t.completed ? 'true' : 'false') + '">' +
          '<svg class="icon"><use href="#i-check"/></svg>' +
        '</button>' +
        '<button class="task-main" type="button" aria-label="编辑：' + title + '">' +
          '<span class="task-title">' + title + '</span>' +
          '<span class="task-meta">' +
            '<span class="tag p' + t.priority + '"><i class="tag-dot"></i>' + priorityLabel(t.priority) + '</span>' +
            '<span class="tag u' + t.urgency + '"><svg class="icon"><use href="#' + u.icon + '"/></svg>' + urgencyLabel(t.urgency) + '</span>' +
            tagHtml +
          '</span>' +
        '</button>' +
        orderHtml +
        '<span class="task-due ' + due.cls + '">' + due.label + '</span>' +
      '</article>';
  }

  function emptyCopy() {
    if (state.tagFilter !== 'all') {
      return ['这个标签下还没有待办', '换一个标签看看，或添加一件新的事。'];
    }
    if (state.filter === 'done') return ['还没有完成记录', '完成一件小事，也算向前走了一步。'];
    if (state.filter === 'today') return ['今天没有待办', '给自己留一点空白，或者添加一件想做的事。'];
    if (state.filter === 'important') return ['没有高优先任务', '把重要的事留出来，是很好的节奏。'];
    return ['这一刻，清单是空的', '给自己留一点呼吸，或添加一件想做的事。'];
  }

  function renderTasks() {
    renderTagFilter();
    var visible = filteredTasks();
    var list = $('#taskList');
    var empty = $('#emptyState');
    var idx = FILTERS.indexOf(state.filter);
    if (idx < 0) idx = 0;
    $('#segmented').style.setProperty('--seg-index', idx);
    $$('.segment').forEach(function (btn) {
      var active = btn.getAttribute('data-filter') === state.filter;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    var todayCount = activeTasks().filter(function (t) {
      return t.due && t.due <= dateKey();
    }).length;
    var importantCount = activeTasks().filter(function (t) { return t.priority === 3; }).length;
    var doneCount = state.tasks.filter(function (t) { return t.completed; }).length;
    var captions = {
      all: activeTasks().length + ' 件待办',
      today: todayCount + ' 件今天',
      important: importantCount + ' 件重要',
      done: doneCount + ' 件已完成'
    };
    var caption = captions[state.filter] || '';
    if (state.tagFilter !== 'all') {
      var activeTag = tagById(state.tagFilter);
      if (activeTag) {
        caption = displayTagName(activeTag) + ' · ' + visible.length +
          (state.filter === 'done' ? ' 件已完成' : ' 件待办');
      }
    }
    $('#listCaption').textContent = caption;

    var clearInline = $('#clearDoneInline');
    var sortNote = $('#sortNote');
    var showClearInline = state.filter === 'done' && visible.length > 0;
    if (clearInline) clearInline.hidden = !showClearInline;
    if (sortNote) sortNote.hidden = showClearInline;
    $$('#sortBar .sort-chip').forEach(function (btn) {
      var active = btn.getAttribute('data-sort') === state.sort;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    if (!visible.length) {
      list.innerHTML = '';
      list.hidden = true;
      empty.hidden = false;
      var copy = emptyCopy();
      $('#emptyTitle').textContent = copy[0];
      $('#emptyText').textContent = copy[1];
      applyLanguage(empty);
      return;
    }

    list.hidden = false;
    empty.hidden = true;
    list.innerHTML = visible.map(taskCardHtml).join('');
    applyLanguage(list);
  }

  /* ---------------- Matrix ---------------- */

  function renderMatrix() {
    var active = activeTasks();
    var groups = { q1: [], q2: [], q3: [], q4: [] };
    active.forEach(function (t) { groups[quadOf(t)].push(t); });
    ['q1', 'q2', 'q3', 'q4'].forEach(function (q) {
      var count = $('[data-count="' + q + '"]');
      if (count) count.textContent = groups[q].length;
      var wrap = $('[data-tasks="' + q + '"]');
      if (!wrap) return;
      if (!groups[q].length) {
        matrixExpanded[q] = false;
        wrap.innerHTML = '<span class="q-empty">暂无任务</span>';
        return;
      }
      if (groups[q].length <= 2) matrixExpanded[q] = false;
      var expanded = !!matrixExpanded[q];
      var shown = expanded ? groups[q] : groups[q].slice(0, 2);
      var html = shown.map(function (t) {
        return '<button class="q-task" type="button" data-id="' + escapeHtml(t.id) + '"><span>' + escapeHtml(t.title) + '</span></button>';
      }).join('');
      if (groups[q].length > 2) {
        html += '<button class="q-more q-toggle" type="button" data-expand-q="' + q + '">' +
          (expanded ? '收起' : '展开 ' + (groups[q].length - 2) + ' 件') + '</button>';
      }
      wrap.innerHTML = html;
    });

    var insight;
    if (state.lang === 'en') {
      if (groups.q1.length) {
        insight = '"' + groups.q1[0].title + '" is the best place to start. Then make room for what is important but not urgent.';
      } else if (groups.q2.length) {
        insight = 'No fires today. Give your energy to long-term work like "' + groups.q2[0].title + '".';
      } else if (active.length) {
        insight = 'Nothing demands immediate action. Take ten minutes to reconsider what really matters.';
      } else {
        insight = 'Your list is clear. Take a walk, or leave one meaningful thing for tomorrow.';
      }
    } else if (groups.q1.length) {
      insight = '「' + groups.q1[0].title + '」最值得现在动手。做完它，再去照顾那些重要但不紧急的事。';
    } else if (groups.q2.length) {
      insight = '今天没有太多火情。把精力留给「' + groups.q2[0].title + '」这样的长线任务吧。';
    } else if (active.length) {
      insight = '没有必须立刻处理的事，给自己十分钟，重新想想什么才是真正重要的。';
    } else {
      insight = '清单已经空了。去散个步，或者为明天留下一件真正重要的事。';
    }
    $('#matrixInsight').textContent = insight;
    applyLanguage($('#matrixGrid'));
    applyLanguage($('#matrixInsight'));
  }

  /* ---------------- Stats ---------------- */

  function lastDays(n) {
    var days = [];
    for (var i = n - 1; i >= 0; i--) {
      var d = new Date();
      d.setHours(12, 0, 0, 0);
      d.setDate(d.getDate() - i);
      days.push({ key: dateKey(d), date: d, count: completedOn(dateKey(d)) });
    }
    return days;
  }

  function renderStats() {
    var days = lastDays(7);
    var weekDone = days.reduce(function (sum, d) { return sum + d.count; }, 0);
    var prev = 0;
    for (var i = 14; i >= 7; i--) {
      var d = new Date();
      d.setHours(12, 0, 0, 0);
      d.setDate(d.getDate() - i);
      prev += completedOn(dateKey(d));
    }
    var diff = weekDone - prev;
    var delta = $('#weekDelta');
    var en = state.lang === 'en';
    if (prev === 0) {
      delta.innerHTML = '<svg class="icon"><use href="#i-sparkles"/></svg>' +
        (en ? weekDone + ' completions this week' : '本周已积累 ' + weekDone + ' 次完成');
    } else if (diff >= 0) {
      delta.innerHTML = '<svg class="icon"><use href="#i-sparkles"/></svg>' +
        (en ? 'vs last week +' + diff : '较上周 +' + diff);
    } else {
      delta.innerHTML = '<svg class="icon"><use href="#i-sparkles"/></svg>' +
        (en ? 'vs last week ' + diff : '较上周 ' + diff);
    }
    $('#weekDone').textContent = weekDone;
    var goal = 10;
    var miniPct = Math.min(100, Math.round((weekDone / goal) * 100));
    $('#miniRing').style.setProperty('--progress', miniPct);
    $('#miniRing').setAttribute('aria-label', en ? 'Weekly goal ' + miniPct + '%' : '本周目标完成 ' + miniPct + '%');
    $('#miniPct').textContent = miniPct;

    var max = Math.max.apply(null, days.map(function (d) { return d.count; }).concat([1]));
    $('#barChart').innerHTML = days.map(function (d, i) {
      var h = Math.max(8, Math.round((d.count / max) * 100));
      var todayCls = i === days.length - 1 ? ' is-today' : '';
      return '<div class="bar-col"><div class="bar' + todayCls + '" style="height:' + h + '%;--i:' + i + '">' +
        (d.count ? '<span class="bar-value">' + d.count + '</span>' : '') + '</div></div>';
    }).join('');
    $('#barLabels').innerHTML = days.map(function (d, i) {
      return '<span class="' + (i === days.length - 1 ? 'is-today' : '') + '">' + weekdayShort(d.date) + '</span>';
    }).join('');

    var streak = 0;
    for (var s = 0; s < 60; s++) {
      var d2 = new Date();
      d2.setHours(12, 0, 0, 0);
      d2.setDate(d2.getDate() - s);
      if (completedOn(dateKey(d2)) > 0) streak++;
      else break;
    }
    $('#streakDays').textContent = streak;
    $('#streakDots').innerHTML = days.map(function (d, i) {
      return '<i class="' + (i >= days.length - Math.min(streak, 7) ? 'is-on' : '') + '"></i>';
    }).join('');

    var best = days.reduce(function (a, b) { return b.count > a.count ? b : a; }, days[0]);
    $('#bestDay').textContent = best.count
      ? (en ? weekdayCN(best.date) : '周' + weekdayShort(best.date))
      : '—';
    $('#bestDayCount').textContent = best.count
      ? (en ? best.count + ' completed' : '完成 ' + best.count + ' 件')
      : (en ? 'Waiting for the first one' : '等待第一件完成');

    var active = activeTasks();
    var total = active.length || 1;
    var counts = { 3: 0, 2: 0, 1: 0 };
    active.forEach(function (t) { counts[t.priority]++; });
    var labels = { 3: en ? 'High' : '高', 2: en ? 'Medium' : '中', 1: en ? 'Low' : '低' };
    $('#distRows').innerHTML = [3, 2, 1].map(function (p) {
      var pct = Math.round((counts[p] / total) * 100);
      return '<div class="dist-row">' +
        '<span class="dist-label">' + labels[p] + (en ? '' : '优先') + '</span>' +
        '<div class="dist-track"><div class="dist-fill" style="width:' + pct + '%"></div></div>' +
        '<span class="dist-count">' + counts[p] + '</span>' +
      '</div>';
    }).join('');
  }

  /* ---------------- Views ---------------- */

  function applyBackGuard() {
    setBackGuard(consentOpen || dialogOpen || sheetOpen || state.view !== 'list');
  }

  function switchView(view) {
    if (view !== 'list' && view !== 'matrix' && view !== 'stats' &&
        view !== 'settings' && view !== 'tags') {
      view = 'list';
    }
    state.view = view;
    $$('.view').forEach(function (panel) {
      var active = panel.getAttribute('data-view-panel') === view;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });
    var dockTarget = view === 'tags' ? 'settings' : view;
    $$('.dock-item').forEach(function (btn) {
      var active = btn.getAttribute('data-view') === dockTarget;
      btn.classList.toggle('is-active', active);
      if (active) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    });
    if (view === 'list') renderTasks();
    if (view === 'matrix') renderMatrix();
    if (view === 'stats') renderStats();
    if (view === 'settings') renderSettings();
    if (view === 'tags') renderTagsView();
    applyLanguage($('[data-view-panel="' + view + '"]'));
    applyBackGuard();
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, 0); }
  }

  function renderAll() {
    renderHeader();
    renderTasks();
    renderMatrix();
    renderStats();
    renderSettings();
    syncLangButtons();
    applyLanguage(document.body);
  }

  /* ---------------- Theme ---------------- */

  function hasNativeSystemTheme() {
    try {
      return !!(window.Android && typeof window.Android.isSystemDark === 'function');
    } catch (e) {
      return false;
    }
  }

  function systemDark() {
    // Native Configuration is the source of truth on HyperOS: its WebView may
    // keep prefers-color-scheme stale after a system theme change.
    if (hasNativeSystemTheme()) {
      try {
        var nativeDark = window.Android.isSystemDark();
        if (typeof nativeDark === 'boolean') return nativeDark;
      } catch (e) {}
    }
    try { return window.matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) { return false; }
  }

  function applyTheme(theme, store) {
    var dark = theme === 'dark';
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#080d1a' : '#eef3ff');
    var icon = $('#themeIcon use');
    if (icon) icon.setAttribute('href', dark ? '#i-sun' : '#i-moon');
    var btn = $('#themeBtn');
    if (btn) btn.setAttribute('aria-label', dark ? '切换浅色模式' : '切换深色模式');
    try {
      if (window.Android && typeof window.Android.setDarkMode === 'function') {
        window.Android.setDarkMode(dark);
      }
    } catch (e) {}
    if (store) {
      state.theme = dark ? 'dark' : 'light';
      saveState();
    }
    syncSettingsControls();
  }

  function initTheme() {
    var theme = state.theme || (systemDark() ? 'dark' : 'light');
    applyTheme(theme, false);
    if (!hasNativeSystemTheme()) {
      // Browser preview / old native shell fallback. On HyperOS the native
      // Configuration broadcast is used instead, because this media query can
      // remain stale after a system theme change.
      try {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
          if (state.theme === null) {
            applyTheme(e.matches ? 'dark' : 'light', false);
          }
        });
      } catch (e) {}
    }
  }

  function toggleTheme() {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next, true);
    haptic('light');
  }

  /* ---------------- Settings / compatibility mode ---------------- */

  function getAppVersion() {
    var version = APP_VERSION;
    try {
      if (window.Android && typeof window.Android.getAppVersion === 'function') {
        var nativeVersion = window.Android.getAppVersion();
        if (nativeVersion) version = String(nativeVersion);
      }
    } catch (e) {}
    return version;
  }

  function syncSettingsControls() {
    var followingSystem = state.theme === null;
    var followSwitch = $('#followSystemSwitch');
    if (followSwitch) {
      followSwitch.setAttribute('aria-checked', followingSystem ? 'true' : 'false');
    }

    var darkSwitch = $('#darkModeSwitch');
    if (darkSwitch) {
      darkSwitch.setAttribute('aria-checked',
        document.documentElement.getAttribute('data-theme') === 'dark' ? 'true' : 'false');
      darkSwitch.disabled = followingSystem;
      darkSwitch.setAttribute('aria-disabled', followingSystem ? 'true' : 'false');
    }
    var darkRow = $('#darkModeRow');
    if (darkRow) darkRow.classList.toggle('is-disabled', followingSystem);
    var darkDesc = $('#darkModeDesc');
    if (darkDesc) {
      darkDesc.textContent = followingSystem
        ? '当前由系统自动控制；关闭“跟随系统”后可手动选择'
        : '深色背景与柔和光晕，夜间更护眼';
    }

    var safeSwitch = $('#safeModeSwitch');
    if (safeSwitch) {
      safeSwitch.setAttribute('aria-checked',
        document.documentElement.classList.contains('safe-mode') ? 'true' : 'false');
    }
    var lowSwitch = $('#lowPowerSwitch');
    if (lowSwitch) {
      lowSwitch.setAttribute('aria-checked',
        document.documentElement.classList.contains('low-power') ? 'true' : 'false');
    }
  }

  function startSystemThemeWatcher() {
    // HyperOS 3.0 occasionally skips both Activity recreation and the WebView
    // media-query update. A low-frequency foreground poll is the final safety
    // net; it is completely idle in manual mode and while backgrounded.
    if (!hasNativeSystemTheme()) return;
    window.setInterval(function () {
      if (document.hidden || state.theme !== null) return;
      var current = document.documentElement.getAttribute('data-theme');
      var next = systemDark() ? 'dark' : 'light';
      if (current !== next) applyTheme(next, false);
    }, 1500);
  }

  function setFollowSystem(enabled) {
    if (enabled) {
      state.theme = null;
      applyTheme(systemDark() ? 'dark' : 'light', false);
      saveState();
      showToast('已跟随系统外观自动切换');
    } else {
      state.theme = document.documentElement.getAttribute('data-theme') === 'dark'
        ? 'dark' : 'light';
      saveState();
      showToast('已切换为手动外观');
    }
    syncSettingsControls();
    haptic('light');
  }

  function renderSettings() {
    var version = getAppVersion();
    var appVersion = $('#appVersion');
    var aboutVersion = $('#aboutVersion');
    if (appVersion) appVersion.textContent = version;
    if (aboutVersion) aboutVersion.textContent = 'v' + version;
    renderTagSummary();
    syncSettingsControls();
  }

  function applySafeMode(enabled, persist) {
    enabled = !!enabled;
    document.documentElement.classList.toggle('safe-mode', enabled);
    if (persist) {
      var saved = false;
      try {
        if (window.Android && typeof window.Android.setSafeModeEnabled === 'function') {
          window.Android.setSafeModeEnabled(enabled);
          saved = true;
        }
      } catch (e) {}
      if (!saved) {
        try { window.localStorage.setItem(SAFE_MODE_KEY, enabled ? '1' : '0'); } catch (e) {}
      }
      haptic('light');
      showToast(enabled ? '已开启兼容模式，将记住此选择' : '已关闭兼容模式，恢复完整光影', { duration: 2400 });
    }
    syncSettingsControls();
  }

  function applyLowPower(enabled, persist) {
    enabled = !!enabled;
    document.documentElement.classList.toggle('low-power', enabled);
    if (persist) {
      var saved = false;
      try {
        if (window.Android && typeof window.Android.setLowPowerEnabled === 'function') {
          window.Android.setLowPowerEnabled(enabled);
          saved = true;
        }
      } catch (e) {}
      if (!saved) {
        try { window.localStorage.setItem(LOW_POWER_KEY, enabled ? '1' : '0'); } catch (e) {}
      }
      haptic('light');
      showToast(enabled ? '已开启低功耗运行，将记住此选择' : '已关闭低功耗运行', { duration: 2400 });
    }
    syncSettingsControls();
  }

  function initLowPower() {
    var enabled = true;
    var fromNative = false;
    try {
      if (window.Android && typeof window.Android.isLowPower === 'function') {
        enabled = !!window.Android.isLowPower();
        fromNative = true;
      }
    } catch (e) {}
    if (!fromNative) {
      try {
        var saved = window.localStorage.getItem(LOW_POWER_KEY);
        enabled = saved !== '0';
      } catch (e) {}
    }
    applyLowPower(enabled, false);
  }

  function toggleLowPower() {
    var enabled = document.documentElement.classList.contains('low-power');
    if (!enabled) {
      applyLowPower(true, true);
      return;
    }
    showConfirm(
      '关闭低功耗模式？',
      '关闭后会恢复完整模糊与循环光影，可能增加功耗、发热，并在部分设备上出现运行不稳定。',
      '仍然关闭',
      function () { applyLowPower(false, true); }
    );
  }

  function initSafeMode() {
    var enabled = false;
    var fromNative = false;
    try {
      if (window.Android && typeof window.Android.isSafeMode === 'function') {
        enabled = !!window.Android.isSafeMode();
        fromNative = true;
      }
    } catch (e) {}
    if (!fromNative) {
      try { enabled = window.localStorage.getItem(SAFE_MODE_KEY) === '1'; } catch (e) {}
    }
    if (/[?&]safe=1/.test(window.location.search)) enabled = true;
    applySafeMode(enabled, false);
  }

  var consentOpen = false;

  function privacyAccepted() {
    try {
      if (window.Android && typeof window.Android.isPrivacyAccepted === 'function') {
        return !!window.Android.isPrivacyAccepted();
      }
    } catch (e) {}
    try { return window.localStorage.getItem('liquid_todo_privacy') === '1'; } catch (e) {}
    return false;
  }

  function acceptPrivacy() {
    try {
      if (window.Android && typeof window.Android.acceptPrivacy === 'function') {
        window.Android.acceptPrivacy();
      } else {
        window.localStorage.setItem('liquid_todo_privacy', '1');
      }
    } catch (e) {}
    consentOpen = false;
    var gate = $('#consentGate');
    if (gate) gate.hidden = true;
    document.body.classList.remove('consent-open');
    applyBackGuard();
    showToast('已同意隐私政策与用户协议');
  }

  function initPrivacy() {
    if (privacyAccepted()) return;
    consentOpen = true;
    var gate = $('#consentGate');
    if (gate) gate.hidden = false;
    document.body.classList.add('consent-open');
    applyBackGuard();
  }

  function showPrivacyPolicy() {
    if (state.lang === 'en') {
      openDialog(
        '<p class="dialog-kicker">PRIVACY POLICY</p>' +
        '<h2 class="dialog-title" id="dialogTitle">Privacy Policy</h2>' +
        '<div class="legal-copy">' +
          '<p><strong>Effective: 30 October 2026</strong></p>' +
          '<p>Liquid Todo is an offline-first local task app. We keep data handling to a minimum.</p>' +
          '<p><strong>1. What we do not collect</strong><br>No INTERNET permission; no accounts, phone numbers, contacts, location, device identifiers, analytics or advertising SDKs.</p>' +
          '<p><strong>2. Where data lives</strong><br>Tasks, tags and settings are stored in a local Room database and SharedPreferences. Uninstalling or clearing app data removes them unless you exported a backup.</p>' +
          '<p><strong>3. Permissions</strong><br>Only VIBRATE. Backup and restore use the system file picker and require no storage permission.</p>' +
          '<p><strong>4. Encrypted backups</strong><br>Backups are encrypted with AES-256-GCM using a password you choose and saved where you choose. The password is never stored; keep it and the file safe.</p>' +
          '<p><strong>5. Third parties</strong><br>No data is sent to any server. Contacting the developer through the system mail app is handled by your email provider.</p>' +
          '<p><strong>6. Children</strong><br>The app does not collect personal information from children.</p>' +
          '<p><strong>7. Changes & contact</strong><br>Material changes will be shown in the app. Contact: Rivers Yuri · flicks.meek.3y@icloud.com.</p>' +
        '</div>' +
        '<div class="dialog-actions" style="grid-template-columns:1fr">' +
          '<button class="dialog-btn is-primary" id="dialogClose" type="button">Got it</button>' +
        '</div>'
      );
      $('#dialogClose').onclick = closeDialog;
      return;
    }
    openDialog(
      '<p class="dialog-kicker">PRIVACY POLICY</p>' +
      '<h2 class="dialog-title" id="dialogTitle">隐私政策</h2>' +
      '<div class="legal-copy">' +
        '<p><strong>生效日期：2026-10-30</strong></p>' +
        '<p>流光待办（Liquid Todo）是一款离线优先的本地待办应用。我们尊重并尽量少地处理你的信息。</p>' +
        '<p><strong>1. 我们不收集什么</strong><br>不申请 INTERNET 权限，不收集账号、手机号、通讯录、位置、设备标识或使用统计，不接入广告或第三方分析 SDK。</p>' +
        '<p><strong>2. 数据保存在哪里</strong><br>待办、标签和设置保存在本机 Room 数据库与 SharedPreferences 中。应用卸载或清除数据后，这些内容会被删除，除非你事先导出备份。</p>' +
        '<p><strong>3. 权限</strong><br>仅申请 VIBRATE（触感反馈）。备份和恢复通过系统文件选择器完成，不申请存储权限。</p>' +
        '<p><strong>4. 加密备份</strong><br>备份文件由你设置密码后使用 AES-256-GCM 加密，文件保存在你选择的位置。密码不会保存在应用中；请自行保管密码和备份文件。</p>' +
        '<p><strong>5. 第三方</strong><br>应用不向任何服务器发送数据。通过系统邮件应用联系开发者时，邮件内容由你的邮件服务商处理。</p>' +
        '<p><strong>6. 未成年人</strong><br>本应用不面向未成年人收集任何个人信息。</p>' +
        '<p><strong>7. 变更与联系</strong><br>如政策发生重大变化，会在应用内提示。联系开发者：Rivers Yuri · flicks.meek.3y@icloud.com。</p>' +
      '</div>' +
      '<div class="dialog-actions" style="grid-template-columns:1fr">' +
        '<button class="dialog-btn is-primary" id="dialogClose" type="button">我知道了</button>' +
      '</div>'
    );
    $('#dialogClose').onclick = closeDialog;
  }

  function showUserAgreement() {
    if (state.lang === 'en') {
      openDialog(
        '<p class="dialog-kicker">TERMS OF USE</p>' +
        '<h2 class="dialog-title" id="dialogTitle">Terms of Use</h2>' +
        '<div class="legal-copy">' +
          '<p><strong>Effective: 30 October 2026</strong></p>' +
          '<p>By using Liquid Todo you agree to these terms and the Privacy Policy.</p>' +
          '<p><strong>1. Licence</strong><br>You receive a personal, non-exclusive, non-transferable licence. Do not use the app for unlawful purposes or attempt to break, reverse-engineer or resell it.</p>' +
          '<p><strong>2. Your content</strong><br>Tasks, tags and notes you create belong to you. Back up important data yourself; uninstalling, clearing data or forgetting a backup password can make data unrecoverable.</p>' +
          '<p><strong>3. Backup & restore</strong><br>You control backup files. Replace overwrites current data; Merge only adds items not already present. Confirm before proceeding.</p>' +
          '<p><strong>4. Service & liability</strong><br>The app is provided “as is” without a guarantee of uninterrupted or error-free operation. The developer is not liable for loss caused by devices, systems, mistakes or data loss, but will try to help.</p>' +
          '<p><strong>5. Changes</strong><br>These terms may change with releases; material changes will be shown in the app.</p>' +
          '<p><strong>6. Contact</strong><br>Rivers Yuri · flicks.meek.3y@icloud.com</p>' +
        '</div>' +
        '<div class="dialog-actions" style="grid-template-columns:1fr">' +
          '<button class="dialog-btn is-primary" id="dialogClose" type="button">Got it</button>' +
        '</div>'
      );
      $('#dialogClose').onclick = closeDialog;
      return;
    }
    openDialog(
      '<p class="dialog-kicker">TERMS OF USE</p>' +
      '<h2 class="dialog-title" id="dialogTitle">用户协议</h2>' +
      '<div class="legal-copy">' +
        '<p><strong>生效日期：2026-10-30</strong></p>' +
        '<p>欢迎使用流光待办。开始使用即表示你已阅读并同意本协议与隐私政策。</p>' +
        '<p><strong>1. 使用许可</strong><br>我们授予你个人的、非独占的、不可转让的使用许可。请勿将本应用用于违法用途，或尝试破坏、反向工程、转售本应用。</p>' +
        '<p><strong>2. 你的内容</strong><br>你创建的待办、标签和备注归你所有。请自行备份重要数据；删除应用、清除数据或忘记备份密码都可能造成数据无法恢复。</p>' +
        '<p><strong>3. 备份与恢复</strong><br>备份文件由你自行保管。恢复时的“覆盖”会替换当前数据，“合并”只加入备份中不存在的条目。请确认后再操作。</p>' +
        '<p><strong>4. 服务与责任</strong><br>本应用按“现状”提供，不承诺完全不中断或无错误。因设备、系统、误操作或数据丢失造成的损失，开发者不承担法律责任，但会尽力提供帮助。</p>' +
        '<p><strong>5. 变更</strong><br>我们可能随版本更新调整本协议，重大变更会在应用内提示。</p>' +
        '<p><strong>6. 联系</strong><br>Rivers Yuri · flicks.meek.3y@icloud.com</p>' +
      '</div>' +
      '<div class="dialog-actions" style="grid-template-columns:1fr">' +
        '<button class="dialog-btn is-primary" id="dialogClose" type="button">我知道了</button>' +
      '</div>'
    );
    $('#dialogClose').onclick = closeDialog;
  }

  function openGithub() {
    var url = 'https://github.com/RiversYuri/LiquidTo-Do';
    try {
      if (window.Android && typeof window.Android.openUrl === 'function') {
        window.Android.openUrl(url);
        return;
      }
    } catch (e) {}
    try { window.open(url, '_blank'); } catch (e) {}
  }

  function openEmail() {
    try {
      if (window.Android && typeof window.Android.openEmail === 'function') {
        window.Android.openEmail();
        return;
      }
    } catch (e) {}
    window.location.href = 'mailto:flicks.meek.3y@icloud.com';
  }

  /* ---------------- Glass dialog ---------------- */

  function openDialog(html, options) {
    options = options || {};
    var backdrop = $('#dialogBackdrop');
    var card = $('#dialogCard');
    if (!backdrop || !card) return;
    card.innerHTML = html;
    applyLanguage(card);
    backdrop.hidden = false;
    dialogOpen = true;
    document.body.classList.add('dialog-open');
    backdrop.onclick = function (event) {
      if (event.target === backdrop && options.dismissible !== false) closeDialog();
    };
    applyBackGuard();
    var focusTarget = card.querySelector('[data-autofocus]') || card.querySelector('input');
    if (focusTarget) {
      setTimeout(function () { try { focusTarget.focus(); } catch (e) {} }, 120);
    }
  }

  function closeDialog() {
    var backdrop = $('#dialogBackdrop');
    var card = $('#dialogCard');
    if (!backdrop || !dialogOpen) return;
    dialogOpen = false;
    backdrop.hidden = true;
    card.innerHTML = '';
    backdrop.onclick = null;
    document.body.classList.remove('dialog-open');
    applyBackGuard();
  }

  function showConfirm(title, message, confirmText, onConfirm) {
    openDialog(
      '<p class="dialog-kicker">PLEASE CONFIRM</p>' +
      '<h2 class="dialog-title" id="dialogTitle">' + escapeHtml(title) + '</h2>' +
      '<p class="dialog-desc">' + escapeHtml(message) + '</p>' +
      '<div class="dialog-actions">' +
        '<button class="dialog-btn" id="dialogCancel" type="button">取消</button>' +
        '<button class="dialog-btn is-primary" id="dialogConfirm" type="button">' +
          escapeHtml(confirmText || '确定') + '</button>' +
      '</div>'
    );
    $('#dialogCancel').onclick = closeDialog;
    $('#dialogConfirm').onclick = function () {
      closeDialog();
      onConfirm();
    };
  }

  function showPasswordDialog(mode) {
    var isBackup = mode === 'backup';
    openDialog(
      '<p class="dialog-kicker">' + (isBackup ? 'ENCRYPTED BACKUP' : 'RESTORE BACKUP') + '</p>' +
      '<h2 class="dialog-title" id="dialogTitle">' +
        (isBackup ? '创建加密备份' : '恢复加密备份') + '</h2>' +
      '<p class="dialog-desc">' +
        (isBackup
          ? '设置一个备份密码。文件使用 AES-256 加密，密码不会保存在任何地方。'
          : '输入创建备份时设置的密码。恢复会覆盖当前数据。') +
      '</p>' +
      '<label class="dialog-field"><span class="dialog-label">备份密码</span>' +
        '<input class="dialog-input" id="backupPassword" type="password" maxlength="64" ' +
        'placeholder="至少 6 个字符" data-autofocus autocomplete="new-password"></label>' +
      (isBackup
        ? '<label class="dialog-field"><span class="dialog-label">确认密码</span>' +
          '<input class="dialog-input" id="backupPasswordConfirm" type="password" maxlength="64" ' +
          'placeholder="再输入一次" autocomplete="new-password"></label>'
        : '') +
      '<p class="dialog-error" id="dialogError" hidden></p>' +
      '<div class="dialog-actions">' +
        '<button class="dialog-btn" id="dialogCancel" type="button">取消</button>' +
        '<button class="dialog-btn is-primary" id="dialogConfirm" type="button">' +
          (isBackup ? '选择保存位置' : '选择备份文件') + '</button>' +
      '</div>'
    );
    $('#dialogCancel').onclick = closeDialog;
    $('#dialogConfirm').onclick = function () {
      var password = $('#backupPassword').value;
      var error = $('#dialogError');
      if (!password || password.length < 6) {
        error.textContent = '密码至少需要 6 个字符';
        error.hidden = false;
        return;
      }
      if (isBackup) {
        var again = $('#backupPasswordConfirm').value;
        if (password !== again) {
          error.textContent = '两次输入的密码不一致';
          error.hidden = false;
          return;
        }
      }
      if (!window.Android || typeof window.Android.startBackup !== 'function') {
        error.textContent = '备份功能仅在 Android 应用中可用';
        error.hidden = false;
        return;
      }
      closeDialog();
      try {
        persistNow();
        if (isBackup) window.Android.startBackup(password, JSON.stringify(state));
        else window.Android.startRestore(password);
      } catch (e) {
        showToast('操作失败，请重试');
      }
    };
  }

  window.onBackupResult = function (ok, message) {
    if (ok) haptic('success');
    showToast(message || (ok ? '备份完成' : '备份失败'), { duration: 3200 });
  };

  function mergeBackupIntoState(backup) {
    var tags = state.tags.slice();
    var byName = {};
    var usedIds = {};
    tags.forEach(function (tag) {
      byName[tag.name] = tag;
      usedIds[tag.id] = true;
    });
    var tagMap = {};
    backup.tags.forEach(function (tag) {
      if (byName[tag.name]) {
        tagMap[tag.id] = byName[tag.name];
        return;
      }
      if (tags.length >= MAX_TAGS) return;
      var id = usedIds[tag.id] ? 'tag-' + uid() : tag.id;
      var copy = {
        id: id,
        name: tag.name,
        color: tag.color,
        sortOrder: tags.length,
        createdAt: tag.createdAt
      };
      tags.push(copy);
      byName[copy.name] = copy;
      usedIds[copy.id] = true;
      tagMap[tag.id] = copy;
    });

    var ids = {};
    var titles = {};
    state.tasks.forEach(function (task) {
      ids[task.id] = true;
      titles[String(task.title || '').trim()] = true;
    });
    var maxOrder = 0;
    state.tasks.forEach(function (task) {
      maxOrder = Math.max(maxOrder, Number(task.sortOrder) || 0);
    });

    backup.tasks.forEach(function (task) {
      // A merge normally keeps current tasks on ID collision. If an old
      // backup reuses an ID for a different title, still add it with a new
      // ID instead of silently dropping the backup item.
      var id = task.id;
      var title = String(task.title || '').trim();
      if (ids[id]) {
        if (!title || titles[title]) return;
        id = 'task-' + uid();
        while (ids[id]) id = 'task-' + uid();
      }
      if (!title) return;
      var mapped = task.tagId ? tagMap[task.tagId] : null;
      if (!mapped && task.category) mapped = byName[task.category];
      var copy = {
        id: id,
        title: title,
        notes: task.notes,
        priority: task.priority,
        urgency: task.urgency,
        due: task.due,
        category: mapped ? mapped.name : '',
        tagId: mapped ? mapped.id : null,
        completed: task.completed,
        completedAt: task.completedAt,
        createdAt: task.createdAt,
        sortOrder: ++maxOrder
      };
      state.tasks.push(copy);
      ids[copy.id] = true;
      titles[title] = true;
    });
    state.tags = tags;
  }

  function applyBackupState(backup, merge) {
    if (merge) {
      mergeBackupIntoState(backup);
    } else {
      state.tasks = backup.tasks.slice();
      state.tags = backup.tags.slice();
    }
    state.tagSchema = true;
    state.view = 'list';
    state.filter = 'all';
    state.tagFilter = 'all';
    persistNow();
    renderAll();
    switchView('list');
    haptic('success');
    showToast(merge ? '已合并备份' : '恢复完成');
  }

  window.onRestoreReady = function (summary, json) {
    var backup;
    try {
      backup = stateFromBackupJson(json);
    } catch (e) {
      showToast('备份内容无法识别');
      return;
    }
    openDialog(
      '<p class="dialog-kicker">RESTORE BACKUP</p>' +
      '<h2 class="dialog-title" id="dialogTitle">恢复备份</h2>' +
      '<p class="dialog-desc">备份包含 ' + escapeHtml(summary) + '。选择恢复方式：</p>' +
      '<p class="dialog-desc"><strong>合并</strong>会保留当前待办，只把备份中不存在的条目加入；<strong>覆盖</strong>会替换当前全部数据。</p>' +
      '<div class="dialog-actions dialog-actions-three">' +
        '<button class="dialog-btn" id="dialogCancel" type="button">取消</button>' +
        '<button class="dialog-btn" id="restoreMerge" type="button">合并</button>' +
        '<button class="dialog-btn is-danger" id="restoreOverwrite" type="button">覆盖</button>' +
      '</div>'
    );
    $('#dialogCancel').onclick = closeDialog;
    function apply(merge) {
      closeDialog();
      try {
        applyBackupState(backup, merge);
      } catch (e) {
        showToast('恢复失败，请重试');
      }
    }
    $('#restoreMerge').onclick = function () { apply(true); };
    $('#restoreOverwrite').onclick = function () { apply(false); };
  };

  window.onRestoreResult = function (ok, message) {
    showToast(message || (ok ? '恢复完成' : '恢复失败'), { duration: 3200 });
  };

  function showEasterEgg() {
    openDialog(
      '<div class="egg-heart">♥</div>' +
      '<p class="dialog-kicker">JUST FOR YOU</p>' +
      '<h2 class="dialog-title egg-title" id="dialogTitle">辛苦了，抱抱你。</h2>' +
      '<p class="dialog-desc egg-copy">无论今天完成了多少，<br>你都值得被温柔对待。</p>' +
      '<div class="egg-slogan">把重要的事，放在光里。</div>' +
      '<p class="egg-signature">—— 流光待办 · Rivers Yuri</p>' +
      '<button class="dialog-btn is-primary" id="dialogClose" type="button" style="width:100%;margin-top:16px">收下这个拥抱</button>'
    );
    $('#dialogClose').onclick = closeDialog;
    haptic('success');
    try { burstConfetti(null); } catch (e) {}
  }

  function showChangelog() {
    var entries;
    if (state.lang === 'en') {
      entries = [
        ['3.2.3', 'Fixed merge restore: a backup item that reuses an existing task ID with a different title is now added with a new ID instead of being silently skipped.'],
        ['3.2.2', 'Fixed backup and restore: the backup carries the current task state, and restore applies the decrypted data immediately as merge or replace. Added first-launch language selection and a GitHub link on the About page.'],
        ['3.2.1', 'Low power mode is now on by default, with a warning when turning it off; English interface; expandable matrix quadrants; edit without opening the keyboard; priority, urgency and custom sorting; restore as merge or replace; privacy policy, terms and first-launch consent; developer name updated to Rivers Yuri.'],
        ['3.1.0', 'Categories and tags merged into one tag system. Default tags: Work, Life, Study, Health. Up to five tags, all editable.'],
        ['3.0.0', 'Room database with migration; encrypted local backup and restore; custom tags and filtering; low power mode; native launch transition; time-aware greeting copy.'],
        ['2.1.1', 'Xiaomi HyperOS 3.0 follow-system dark mode fix.'],
        ['2.1.0', 'Clear completed tasks with undo; follow-system appearance.'],
        ['2.0.1', 'Fixed a DecorView WindowInsetsController crash on some Android 14/15 devices.'],
        ['2.0.0', 'Settings and About page; remembered compatibility mode; dark mode.'],
        ['1.0.1', 'WebView renderer crash protection; native recovery page; startup watchdog; API isolation.'],
        ['1.0.0', 'First release: tasks, priority/urgency, Eisenhower matrix, stats, light/dark themes, offline storage.']
      ];
    } else {
      entries = [
        ['3.2.3', '修复合并恢复：备份条目复用已有任务 ID 但标题不同时，不再被静默跳过，会生成新 ID 插入。'],
        ['3.2.2', '修复备份/恢复无效：备份直接携带当前清单状态，解密后立即按“合并/覆盖”写入清单；首次启动增加语言选择；关于页增加 GitHub 仓库入口。'],
        ['3.2.1', '默认开启低功耗模式，关闭时增加风险确认；新增英文界面；矩阵象限可展开；编辑待办不自动调起输入法；新增按紧急程度与自定义排序；恢复数据可选合并或覆盖；新增隐私政策、用户协议与首次启动同意；开发者更名为 Rivers Yuri。'],
        ['3.1.0', '分类与标签整合为统一标签体系，默认工作/生活/学习/健康，最多 5 个，可自由增删改。'],
        ['3.0.0', 'Room 数据库与旧数据迁移；本地加密备份/恢复；自定义标签与筛选；低功耗；原生开屏过渡；分时段问候文案。'],
        ['2.1.1', '适配 Xiaomi HyperOS 3.0 跟随系统深色模式。'],
        ['2.1.0', '清空已完成并支持撤销；跟随系统外观。'],
        ['2.0.1', '修复部分 Android 14/15 设备 DecorView WindowInsetsController 启动崩溃。'],
        ['2.0.0', '设置与关于页；兼容模式记忆；深色模式。'],
        ['1.0.1', 'WebView 渲染崩溃保护；原生恢复页；启动看门狗；API 隔离。'],
        ['1.0.0', '首个版本：待办、优先级/紧急度、四象限、统计、深浅色、离线存储。']
      ];
    }
    var body = entries.map(function (item) {
      return '<p><strong>v' + item[0] + '</strong><br>' + item[1] + '</p>';
    }).join('');
    openDialog(
      '<p class="dialog-kicker">CHANGELOG</p>' +
      '<h2 class="dialog-title" id="dialogTitle">' + (state.lang === 'en' ? 'Changelog' : '更新日志') + '</h2>' +
      '<div class="legal-copy">' + body + '</div>' +
      '<div class="dialog-actions" style="grid-template-columns:1fr">' +
        '<button class="dialog-btn is-primary" id="dialogClose" type="button">' +
          (state.lang === 'en' ? 'Close' : '知道了') + '</button>' +
      '</div>'
    );
    $('#dialogClose').onclick = closeDialog;
  }

  var versionTapCount = 0;
  var versionTapTimer = null;

  function handleVersionTap() {
    versionTapCount++;
    if (versionTapTimer) clearTimeout(versionTapTimer);
    versionTapTimer = setTimeout(function () {
      versionTapCount = 0;
      versionTapTimer = null;
    }, 4000);
    if (versionTapCount >= 10) {
      versionTapCount = 0;
      if (versionTapTimer) clearTimeout(versionTapTimer);
      versionTapTimer = null;
      showEasterEgg();
    } else {
      haptic('light');
    }
  }

  /* ---------------- Toast + confetti ---------------- */

  function hideToast() {
    var el = $('#toast');
    el.classList.remove('is-visible');
    var action = $('#toastAction');
    action.hidden = true;
    action.onclick = null;
    toastTimer = null;
  }

  function showToast(text, opts) {
    opts = opts || {};
    var el = $('#toast');
    $('#toastText').textContent = translateText(text);
    var action = $('#toastAction');
    if (opts.action && typeof opts.onAction === 'function') {
      action.hidden = false;
      action.textContent = translateText(opts.action);
      action.onclick = function () {
        hideToast();
        opts.onAction();
      };
    } else {
      action.hidden = true;
      action.onclick = null;
    }
    el.classList.add('is-visible');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, opts.duration || (opts.action ? 4800 : 2400));
  }

  function burstConfetti(rect) {
    if (!rect) return;
    var colors = ['#6e8dff', '#a47bf0', '#ef8cba', '#58cbb5', '#f3bb63'];
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    for (var i = 0; i < 11; i++) {
      var el = document.createElement('i');
      el.className = 'confetti';
      var angle = (Math.PI * 2 * i) / 11 + Math.random() * 0.4;
      var dist = 34 + Math.random() * 42;
      el.style.left = cx + 'px';
      el.style.top = cy + 'px';
      el.style.setProperty('--tx', (Math.cos(angle) * dist).toFixed(1) + 'px');
      el.style.setProperty('--ty', (Math.sin(angle) * dist - 14).toFixed(1) + 'px');
      el.style.setProperty('--r', Math.round(Math.random() * 300 - 150) + 'deg');
      el.style.setProperty('--c', colors[i % colors.length]);
      el.style.width = (4 + Math.round(Math.random() * 4)) + 'px';
      el.style.height = (4 + Math.round(Math.random() * 4)) + 'px';
      document.body.appendChild(el);
      (function (node) { setTimeout(function () { node.remove(); }, 980); })(el);
    }
  }

  /* ---------------- Task operations ---------------- */

  function toggleDone(id, sourceEl) {
    var task = getTask(id);
    if (!task) return;
    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString() : null;
    saveState();
    if (task.completed) {
      var rect = sourceEl ? sourceEl.getBoundingClientRect() : null;
      burstConfetti(rect);
      haptic('success');
      showToast('完成一件，很棒。');
    } else {
      haptic('light');
      showToast('已移回待办。');
    }
    renderHeader();
    renderTasks();
    renderMatrix();
    renderStats();
  }

  function removeTask(id) {
    var index = -1;
    for (var i = 0; i < state.tasks.length; i++) {
      if (state.tasks[i].id === id) { index = i; break; }
    }
    if (index < 0) return;
    var removed = state.tasks[index];
    state.tasks.splice(index, 1);
    saveState();
    renderAll();
    showToast('已删除待办', {
      action: '撤销',
      duration: 5000,
      onAction: function () {
        state.tasks.splice(Math.min(index, state.tasks.length), 0, removed);
        saveState();
        renderAll();
        showToast('已恢复待办');
      }
    });
  }

  /* ---------------- Sheet ---------------- */

  function setChoiceGroup(id, value) {
    $$('#' + id + ' .choice').forEach(function (btn) {
      btn.classList.toggle('is-active', Number(btn.getAttribute('data-value')) === Number(value));
      btn.setAttribute('aria-pressed', Number(btn.getAttribute('data-value')) === Number(value) ? 'true' : 'false');
    });
  }



  function syncDateUI() {
    var today = dateKey();
    var matched = false;
    $$('#dateChips .date-chip').forEach(function (btn) {
      var off = btn.getAttribute('data-offset');
      var active = false;
      if (off === 'none') active = !form.due;
      else if (form.due) active = form.due === addDays(Number(off));
      btn.classList.toggle('is-active', active);
      if (active) matched = true;
    });
    var input = $('#dateInput');
    input.value = form.due || '';
    $('#dateInputLabel').textContent = form.due ? fullDate(form.due) : '不设期限';
    return matched;
  }

  function renderFormTags() {
    var wrap = $('#tagChoices');
    if (!wrap) return;
    if (form.tagId && !tagById(form.tagId)) form.tagId = null;
    var html = '<button class="tag-choice' + (!form.tagId ? ' is-active' : '') +
      '" type="button" data-tag-id="">无标签</button>';
    state.tags.forEach(function (tag) {
      html += '<button class="tag-choice' + (form.tagId === tag.id ? ' is-active' : '') +
        '" type="button" data-tag-id="' + escapeHtml(tag.id) + '" style="--tag-color:' +
        escapeHtml(tag.color) + '"><i></i>' + escapeHtml(displayTagName(tag)) + '</button>';
    });
    wrap.innerHTML = html;
  }

  function syncFormUI() {
    setChoiceGroup('priorityChoices', form.priority);
    setChoiceGroup('urgencyChoices', form.urgency);
    renderFormTags();
    syncDateUI();
  }

  function openSheet(task) {
    lastFocused = document.activeElement;
    editingId = task ? task.id : null;
    var isEdit = !!task;
    form = {
      priority: task ? task.priority : 2,
      urgency: task ? task.urgency : 1,
      due: task ? task.due : dateKey(),
      tagId: task ? task.tagId : null
    };
    $('#sheetKicker').textContent = isEdit ? 'TASK DETAILS' : 'NEW TASK';
    $('#sheetTitle').textContent = isEdit ? '编辑待办' : '新建待办';
    $('#titleInput').value = task ? task.title : '';
    $('#notesInput').value = task ? task.notes : '';
    $('#saveTaskBtn').querySelector('span').textContent = isEdit ? '保存修改' : '添加待办';
    $('#sheetActions').hidden = !isEdit;
    if (isEdit) {
      $('#toggleDoneBtn').querySelector('span').textContent = task.completed ? '移回待办' : '标记完成';
    }
    $('#titleError').hidden = true;
    $('#titleInput').classList.remove('is-error');
    syncFormUI();
    sheetOpen = true;
    document.body.classList.add('sheet-open', 'is-locked');
    $('#scrim').classList.add('is-open');
    $('#sheet').classList.add('is-open');
    $('#sheet').setAttribute('aria-hidden', 'false');
    applyBackGuard();
    var scroll = $('.sheet-scroll');
    if (scroll) scroll.scrollTop = 0;
    setTimeout(function () {
      if (!isEdit) $('#titleInput').focus();
    }, 380);
  }

  function closeSheet(focus) {
    if (!sheetOpen) return;
    sheetOpen = false;
    $('#scrim').classList.remove('is-open');
    $('#sheet').classList.remove('is-open');
    $('#sheet').setAttribute('aria-hidden', 'true');
    document.body.classList.remove('sheet-open', 'is-locked');
    document.documentElement.style.setProperty('--keyboard', '0px');
    try {
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      if (window.Android && typeof window.Android.hideKeyboard === 'function') {
        window.Android.hideKeyboard();
      }
    } catch (e) {}
    applyBackGuard();
    if (focus !== false && lastFocused && typeof lastFocused.focus === 'function') {
      setTimeout(function () { try { lastFocused.focus(); } catch (e) {} }, 80);
    }
  }

  function validateTitle() {
    var input = $('#titleInput');
    var value = input.value.trim();
    if (!value) {
      input.classList.add('is-error');
      $('#titleError').hidden = false;
      input.focus();
      haptic('light');
      return null;
    }
    input.classList.remove('is-error');
    $('#titleError').hidden = true;
    return value;
  }

  function submitTask(e) {
    if (e) e.preventDefault();
    var title = validateTitle();
    if (!title) return;
    var notes = $('#notesInput').value.trim();
    var task = editingId ? getTask(editingId) : null;
    var selectedTag = form.tagId ? tagById(form.tagId) : null;

    if (task) {
      task.title = title;
      task.notes = notes;
      task.priority = form.priority;
      task.urgency = form.urgency;
      task.due = form.due;
      task.category = selectedTag ? selectedTag.name : '';
      task.tagId = selectedTag ? selectedTag.id : null;
      saveState();
      closeSheet();
      renderAll();
      showToast('修改已保存');
    } else {
      var newTask = {
        id: uid(),
        title: title,
        notes: notes,
        priority: form.priority,
        urgency: form.urgency,
        due: form.due,
        category: selectedTag ? selectedTag.name : '',
        tagId: selectedTag ? selectedTag.id : null,
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString(),
        sortOrder: nextSortOrder()
      };
      state.tasks.push(newTask);
      state.filter = 'all';
      saveState();
      closeSheet();
      renderAll();
      haptic('success');
      showToast('已添加到清单');
    }
  }

  /* ---------------- Data actions ---------------- */

  function clearDone() {
    var removed = state.tasks.filter(function (t) { return t.completed; });
    if (!removed.length) {
      showToast('还没有已完成的待办');
      return;
    }
    state.tasks = state.tasks.filter(function (t) { return !t.completed; });
    saveState();
    renderAll();
    showToast('已清空 ' + removed.length + ' 件完成', {
      action: '撤销',
      duration: 5000,
      onAction: function () {
        state.tasks = state.tasks.concat(removed);
        saveState();
        renderAll();
        showToast('已恢复完成记录');
      }
    });
  }

  function resetData() {
    var oldTasks = state.tasks;
    var oldTags = state.tags;
    state.tasks = seedTasks();
    state.tags = seedTags();
    state.filter = 'all';
    state.tagFilter = 'all';
    saveState();
    renderAll();
    switchView('list');
    showToast('已恢复示例数据', {
      action: '撤销',
      duration: 5000,
      onAction: function () {
        state.tasks = oldTasks;
        state.tags = oldTags;
        state.tagFilter = 'all';
        saveState();
        renderAll();
        showToast('已恢复之前的数据');
      }
    });
  }

  /* ---------------- Native back + insets ---------------- */

  window.closeTopLayer = function () {
    if (dialogOpen) {
      closeDialog();
      return true;
    }
    if (sheetOpen) {
      closeSheet();
      return true;
    }
    if (consentOpen) return true;
    if (state.view === 'tags') {
      switchView('settings');
      return true;
    }
    if (state.view !== 'list') {
      switchView('list');
      return true;
    }
    return false;
  };

  // Called from MainActivity.onConfigurationChanged / onResume. Keeps the
  // follow-system mode correct even when HyperOS does not recreate the
  // Activity or update the WebView media query.
  window.setSystemTheme = function (dark) {
    if (state.theme === null) {
      applyTheme(dark ? 'dark' : 'light', false);
    }
  };

  window.setSafeArea = function (top, bottom) {
    if (typeof top === 'number') {
      document.documentElement.style.setProperty('--safe-top', Math.max(8, top) + 'px');
    }
    if (typeof bottom === 'number') {
      document.documentElement.style.setProperty('--safe-bottom', Math.max(8, bottom) + 'px');
    }
  };

  window.setKeyboardInset = function (px) {
    var value = Math.max(0, Number(px) || 0);
    document.documentElement.style.setProperty('--keyboard', value + 'px');
  };

  /* ---------------- Events ---------------- */

  function bindEvents() {
    $('#matrixGrid').addEventListener('click', function (e) {
      var toggle = e.target.closest('[data-expand-q]');
      if (!toggle) return;
      var q = toggle.getAttribute('data-expand-q');
      matrixExpanded[q] = !matrixExpanded[q];
      renderMatrix();
    });
    $('#langSwitch').addEventListener('click', function (e) {
      var btn = e.target.closest('.lang-btn');
      if (btn) setLang(btn.getAttribute('data-lang'));
    });
    $('#consentLangSwitch').addEventListener('click', function (e) {
      var btn = e.target.closest('.lang-btn');
      if (btn) setLang(btn.getAttribute('data-lang'));
    });
    $('#themeBtn').addEventListener('click', toggleTheme);
    $('#followSystemSwitch').addEventListener('click', function () {
      setFollowSystem(state.theme !== null);
    });
    $('#darkModeSwitch').addEventListener('click', toggleTheme);
    $('#safeModeSwitch').addEventListener('click', function () {
      applySafeMode(!document.documentElement.classList.contains('safe-mode'), true);
    });
    $('#lowPowerSwitch').addEventListener('click', toggleLowPower);
    $('#privacyBtn').addEventListener('click', showPrivacyPolicy);
    $('#termsBtn').addEventListener('click', showUserAgreement);
    $('#consentPrivacy').addEventListener('click', showPrivacyPolicy);
    $('#consentTerms').addEventListener('click', showUserAgreement);
    $('#consentAgree').addEventListener('click', acceptPrivacy);
    $('#consentDecline').addEventListener('click', function () {
      showToast('需要同意隐私政策与用户协议后才能继续使用');
    });
    $('#emailBtn').addEventListener('click', openEmail);
    $('#githubBtn').addEventListener('click', openGithub);
    $('#backupBtn').addEventListener('click', function () { showPasswordDialog('backup'); });
    $('#restoreBtn').addEventListener('click', function () { showPasswordDialog('restore'); });
    $('#aboutVersion').addEventListener('click', handleVersionTap);
    $('#changelogBtn').addEventListener('click', showChangelog);
    $('#manageTagsBtn').addEventListener('click', function () { switchView('tags'); });
    $('#tagsBack').addEventListener('click', function () { switchView('settings'); });
    $('#saveTagBtn').addEventListener('click', saveTag);
    $('#tagCancelEdit').addEventListener('click', function () { setTagForm(null); });
    $('#tagNameInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveTag();
      }
    });
    $('#colorPalette').addEventListener('click', function (e) {
      var btn = e.target.closest('.color-swatch');
      if (!btn) return;
      selectedTagColor = btn.getAttribute('data-color');
      renderColorPalette();
      haptic('light');
    });
    $('#tagManageList').addEventListener('click', function (e) {
      var edit = e.target.closest('[data-edit-tag]');
      if (edit) {
        var tag = tagById(edit.getAttribute('data-edit-tag'));
        if (tag) setTagForm(tag);
        return;
      }
      var del = e.target.closest('[data-delete-tag]');
      if (del) deleteTag(del.getAttribute('data-delete-tag'));
    });

    $('#tagFilter').addEventListener('click', function (e) {
      var btn = e.target.closest('.tag-pill');
      if (!btn) return;
      var id = btn.getAttribute('data-tag');
      if (id === '__manage') {
        switchView('tags');
        return;
      }
      state.tagFilter = id || 'all';
      haptic('light');
      renderTasks();
    });

    $('#segmented').addEventListener('click', function (e) {
      var btn = e.target.closest('.segment');
      if (!btn) return;
      var filter = btn.getAttribute('data-filter');
      if (filter === state.filter) return;
      state.filter = filter;
      haptic('light');
      renderTasks();
    });

    $('#sortBar').addEventListener('click', function (e) {
      var btn = e.target.closest('.sort-chip');
      if (!btn) return;
      setSort(btn.getAttribute('data-sort'));
    });

    $('#taskList').addEventListener('click', function (e) {
      var card = e.target.closest('.task-card');
      if (!card) return;
      var id = card.getAttribute('data-id');
      var order = e.target.closest('.order-btn');
      if (order) {
        e.preventDefault();
        moveTask(id, order.getAttribute('data-move'));
        return;
      }
      var check = e.target.closest('.task-check');
      if (check) {
        e.preventDefault();
        toggleDone(id, check);
        return;
      }
      if (e.target.closest('.task-main')) openSheet(getTask(id));
    });

    $('.dock').addEventListener('click', function (e) {
      var btn = e.target.closest('.dock-item');
      if (!btn) return;
      switchView(btn.getAttribute('data-view'));
      haptic('light');
    });

    $('#matrixGrid').addEventListener('click', function (e) {
      var btn = e.target.closest('.q-task');
      if (!btn) return;
      var task = getTask(btn.getAttribute('data-id'));
      if (task) openSheet(task);
    });

    $('#addBtn').addEventListener('click', function () { openSheet(null); });
    $('#emptyAdd').addEventListener('click', function () { openSheet(null); });
    $('#closeSheet').addEventListener('click', function () { closeSheet(); });
    $('#scrim').addEventListener('click', function () { closeSheet(); });
    $('#taskForm').addEventListener('submit', submitTask);

    $('#titleInput').addEventListener('input', function () {
      if ($('#titleInput').value.trim()) {
        $('#titleInput').classList.remove('is-error');
        $('#titleError').hidden = true;
      }
    });

    $('#priorityChoices').addEventListener('click', function (e) {
      var btn = e.target.closest('.choice');
      if (!btn) return;
      form.priority = Number(btn.getAttribute('data-value'));
      syncFormUI();
      haptic('light');
    });

    $('#urgencyChoices').addEventListener('click', function (e) {
      var btn = e.target.closest('.choice');
      if (!btn) return;
      form.urgency = Number(btn.getAttribute('data-value'));
      syncFormUI();
      haptic('light');
    });

    $('#dateChips').addEventListener('click', function (e) {
      var btn = e.target.closest('.date-chip');
      if (!btn) return;
      var off = btn.getAttribute('data-offset');
      form.due = off === 'none' ? null : addDays(Number(off));
      syncDateUI();
      haptic('light');
    });

    $('#dateInput').addEventListener('change', function (e) {
      form.due = e.target.value || null;
      syncDateUI();
    });

    $('#tagChoices').addEventListener('click', function (e) {
      var btn = e.target.closest('.tag-choice');
      if (!btn) return;
      form.tagId = btn.getAttribute('data-tag-id') || null;
      renderFormTags();
      haptic('light');
    });

    $('#toggleDoneBtn').addEventListener('click', function () {
      if (!editingId) return;
      var task = getTask(editingId);
      if (!task) return;
      task.completed = !task.completed;
      task.completedAt = task.completed ? new Date().toISOString() : null;
      saveState();
      closeSheet();
      renderAll();
      if (task.completed) {
        haptic('success');
        showToast('完成一件，很棒。');
      } else {
        haptic('light');
        showToast('已移回待办。');
      }
    });

    $('#deleteTaskBtn').addEventListener('click', function () {
      if (!editingId) return;
      var id = editingId;
      closeSheet(false);
      removeTask(id);
    });

    $('#clearDoneBtn').addEventListener('click', clearDone);
    $('#clearDoneInline').addEventListener('click', clearDone);
    $('#resetBtn').addEventListener('click', resetData);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (dialogOpen) closeDialog();
        else if (sheetOpen) closeSheet();
        else if (state.view === 'tags') switchView('settings');
        else if (state.view !== 'list') switchView('list');
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        openSheet(null);
      }
    });

    window.addEventListener('pagehide', function () {
      if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
      persistNow();
    });

    document.addEventListener('visibilitychange', function () {
      var hidden = document.visibilityState === 'hidden';
      document.documentElement.classList.toggle('is-background', hidden);
      if (hidden) {
        persistNow();
      } else if (state.theme === null) {
        var current = document.documentElement.getAttribute('data-theme');
        var next = systemDark() ? 'dark' : 'light';
        if (current !== next) applyTheme(next, false);
      }
    });

    if (!window.Android && window.visualViewport) {
      var vv = window.visualViewport;
      var applyKeyboard = function () {
        if (!sheetOpen) return;
        var kb = Math.max(0, window.innerHeight - (vv.height + vv.offsetTop));
        document.documentElement.style.setProperty('--keyboard', kb + 'px');
      };
      vv.addEventListener('resize', applyKeyboard);
      vv.addEventListener('scroll', applyKeyboard);
    }
  }

  /* ---------------- Boot ---------------- */

  function boot() {
    try {
      state = loadState();
      initSafeMode();
      initLowPower();
      initTheme();
      startSystemThemeWatcher();
      bindEvents();
      renderAll();
      switchView('list');
      initPrivacy();
      document.documentElement.classList.toggle('is-background', document.hidden);
      if (window.Android) {
        var nativeSplash = $('#splash');
        if (nativeSplash && nativeSplash.parentNode) nativeSplash.parentNode.removeChild(nativeSplash);
      }
      // Ensure a freshly seeded state reaches Room even if the user makes no edit.
      persistNow();

      var splash = $('#splash');
      if (splash) {
        setTimeout(function () {
          if (splash.parentNode) splash.parentNode.removeChild(splash);
        }, 1750);
      }

      setTimeout(function () {
        try {
          if (window.Android && typeof window.Android.pageReady === 'function') {
            window.Android.pageReady();
          }
        } catch (e) {}
      }, 120);
    } catch (error) {
      var splash = $('#splash');
      if (splash && splash.parentNode) splash.parentNode.removeChild(splash);
      try {
        if (window.Android && typeof window.Android.pageError === 'function') {
          window.Android.pageError(String((error && error.stack) || error));
        }
      } catch (e) {}
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
