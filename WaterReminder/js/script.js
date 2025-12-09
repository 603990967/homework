// ==================== 配置区 ====================
const STORAGE_KEY = "waterReminderData2025"; // localStorage 键名，改年份防冲突
const DAILY_GOAL = 2000;                     // 每日目标（ml），可自行修改
const MIN_FOR_STREAK = 1000;                 // 算打卡的最低饮水量
const REMIND_INTERVAL = 45 * 60 * 1000;      // 提醒间隔：45分钟

// ==================== 数据结构 ====================
let data = {
    records: {},   // 例: {"2025-12-09": 1750, "2025-12-08": 2100}
    lastRemind: 0  // 记录上次提醒时间戳，防止重复弹窗
};

// ==================== 初始化 ====================
// 页面加载完载全后执行
window.onload = function () {
    loadData();
    updateUI();
    updateStreak();
    startRemindTimer(); // 启动定时提醒
};

// 从 localStorage 加载数据
function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        data = JSON.parse(saved);
    }
}

// 保存数据到 localStorage（每次喝水都自动保存）
function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 获取今天日期字符串（YYYY-MM-DD）
function getToday() {
    return new Date().toISOString().slice(0,10);
}

// ==================== 核心功能 ====================
// 添加指定毫升水
function addWater(ml) {
    const today = getToday();
    if (!data.records[today]) data.records[today] = 0;
    data.records[today] += ml;
    saveData();
    updateUI();
    updateStreak();
}

// 自定义加水
function customAdd() {
    let ml = prompt("请输入喝了多少毫升？", "300");
    if (ml !== null && !isNaN(ml) && Number(ml) > 0) {
        addWater(Number(ml));
    }
}

// 更新界面所有数字和水位动画
function updateUI() {
    const today = getToday();
    const amount = data.records[today] || 0;
    const percent = Math.min(100, Math.round(amount / DAILY_GOAL * 100));

    document.getElementById("today").textContent = amount;
    document.getElementById("percent").textContent = percent;
    document.getElementById("amount-text").textContent = amount + "ml";

    // 水位动画
    document.getElementById("water").style.height = percent + "%";
}

// 计算连续打卡天数
function updateStreak() {
    let streak = 0;
    let checkDate = new Date();

    while (true) {
        const key = checkDate.toISOString().slice(0,10);
        if (data.records[key] && data.records[key] >= MIN_FOR_STREAK) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1); // 前一天
        } else {
            break;
        }
    }
    document.getElementById("streak").textContent = `连续打卡 ${streak} 天`;
}

// ==================== 定时提醒 ====================
function startRemindTimer() {
    setInterval(() => {
        // 只在页面可见且聚焦时提醒
        if (document.hasFocus()) {
            const now = Date.now();
            // 简单防重复：10秒内不重复提醒
            if (now - data.lastRemind > 10000) {
                if (confirm("已经45分钟没记录喝水啦！现在喝一杯吗？")) {
                    addWater(250); // 默认加一杯普通水
                }
                data.lastRemind = now;
                saveData();
            }
        }
    }, REMIND_INTERVAL);
}