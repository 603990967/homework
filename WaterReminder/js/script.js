// ==================== 配置 ====================
const STORAGE_KEY = "waterReminderPro2025";
let DAILY_GOAL = 2000;
const MIN_FOR_STREAK = 1000;
const REMIND_INTERVAL = 45 * 60 * 1000;

// ==================== 数据 ====================
let data = { records: {}, lastRemind: 0 };

// ==================== 初始化 ====================
window.onload = () => {
    loadData();
    loadGoal();
    updateUI();
    updateStreak();
    startRemindTimer();
    setupResetButton();
    setupSettingsButton();
};

// 加载数据
function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) data = JSON.parse(saved);
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadGoal() {
    const savedGoal = localStorage.getItem("dailyGoal");
    if (savedGoal) {
        DAILY_GOAL = Number(savedGoal);
        document.getElementById("goal").textContent = DAILY_GOAL;
    }
}

// ==================== 核心功能 ====================
function getToday() {
    return new Date().toISOString().slice(0,10);
}

function addWater(ml) {
    const today = getToday();
    if (!data.records[today]) data.records[today] = 0;
    data.records[today] += ml;
    saveData();
    updateUI();
    updateStreak();
}

function customAdd() {
    const input = prompt("请输入喝水量（ml）", "300");
    if (input && !isNaN(input) && Number(input) > 0) {
        addWater(Number(input));
    }
}

// 重置当天记录（长按3秒）
function setupResetButton() {
    const btn = document.getElementById("reset-btn");
    let timer;
    btn.onmousedown = btn.ontouchstart = () => {
        timer = setTimeout(() => {
            if (confirm("确定要重置今天的饮水记录吗？")) {
                const today = getToday();
                delete data.records[today];
                saveData();
                updateUI();
                updateStreak();
                alert("已重置当天记录！");
            }
        }, 2000);
        btn.style.background = "#d32f2f";
        btn.textContent = "松手取消...";
    };
    btn.onmouseup = btn.onmouseleave = btn.ontouchend = () => {
        clearTimeout(timer);
        btn.style.background = "#ff5252";
        btn.textContent = "长按重置当天";
    };
}

// 设置目标
function setupSettingsButton() {
    document.getElementById("settings-btn").onclick = () => {
        document.getElementById("settings-modal").style.display = "flex";
        document.getElementById("new-goal").value = DAILY_GOAL;
    };
}

function saveGoal() {
    const val = document.getElementById("new-goal").value;
    if (val >= 1000 && val <= 5000) {
        DAILY_GOAL = Number(val);
        localStorage.setItem("dailyGoal", DAILY_GOAL);
        document.getElementById("goal").textContent = DAILY_GOAL;
        updateUI();
        closeModal();
    } else {
        alert("目标范围：1000~5000ml");
    }
}

function closeModal() {
    document.getElementById("settings-modal").style.display = "none";
}

// 查看历史记录（简单版）
function showHistory() {
    let msg = "近7天记录：\n\n";
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = date.toISOString().slice(0,10);
        const amount = data.records[key] || 0;
        const day = date.toLocaleDateString("zh-CN", {month:"short", day:"numeric"});
        msg += `${day}：${amount} ml ${amount >= MIN_FOR_STREAK ? "Success" : ""}\n`;
    }
    alert(msg);
}

// 更新界面
function updateUI() {
    const today = getToday();
    const amount = data.records[today] || 0;
    const percent = Math.min(100, Math.round(amount / DAILY_GOAL * 100));

    document.getElementById("today").textContent = amount;
    document.getElementById("percent").textContent = percent;
    document.getElementById("amount-text").textContent = amount + " ml";
    document.getElementById("water").style.height = percent + "%";
}

function updateStreak() {
    let streak = 0;
    let check = new Date();
    while (true) {
        const key = check.toISOString().slice(0,10);
        if (data.records[key] && data.records[key] >= MIN_FOR_STREAK) {
            streak++;
            check.setDate(check.getDate() - 1);
        } else break;
    }
    document.getElementById("streak").textContent = `连续打卡 ${streak} 天`;
}

// 定时提醒
function startRemindTimer() {
    setInterval(() => {
        if (document.hasFocus() && Date.now() - data.lastRemind > 10000) {
            if (confirm("已经45分钟没喝水啦，要记录一杯吗？")) {
                addWater(250);
            }
            data.lastRemind = Date.now();
        }
    }, REMIND_INTERVAL);
}