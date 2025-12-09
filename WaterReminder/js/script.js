// ==================== 配置 ====================
const STORAGE_KEY = "waterPro2025";
let DAILY_GOAL = 2000;
const MIN_FOR_STREAK = 1000;
const REMIND_INTERVAL = 45 * 60 * 1000; // 45分钟提醒一次

// 健康提醒内容库（可继续添加）
const HEALTH_TIPS = [
    "早晨空腹喝一杯温水，能唤醒身体、促进代谢",
    "饭前30分钟喝水有助于控制食量，助你减肥",
    "运动后及时补水，避免脱水影响恢复",
    "睡前2小时少喝水，避免夜间起夜影响睡眠",
    "少量多次喝水比一次性暴饮更健康",
    "水温最好在35–40℃，太烫太凉都伤胃",
    "喝水太快容易打嗝，慢慢小口喝最舒服",
    "女性经期多喝红枣枸杞水，有助补血暖宫",
    "夏天出汗多，每小时至少补充200ml水分",
    "冬天也要多喝水，暖气房里更容易缺水哦",
    "咖啡、奶茶不能代替白开水哦",
    "口渴已是缺水信号，别等渴了才喝水",
    "正确喝水顺序：起床 → 饭前 → 运动后 → 睡前少量"
];

// ==================== 数据结构 ====================
let data = { records: {}, lastRemind: 0 };

// ==================== 初始化 ====================
window.onload = () => {
    loadAllData();
    updateAllDisplay();
    startRemindTimer();
    setupButtons();
    getRandomTip(); // 首次加载一条提醒
};

// 加载所有数据
function loadAllData() {
    // 喝水记录
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) data = JSON.parse(saved);

    // 目标
    const goal = localStorage.getItem("dailyGoal");
    if (goal) {
        DAILY_GOAL = Number(goal);
        document.getElementById("goal").textContent = DAILY_GOAL;
    }
}

// 保存数据
function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 获取今天日期字符串
function getToday() {
    return new Date().toISOString().slice(0,10);
}

// ==================== 喝水功能 ====================
function addWater(ml) {
    const today = getToday();
    if (!data.records[today]) data.records[today] = 0;
    data.records[today] += ml;
    saveData();
    updateAllDisplay();
}

function customAdd() {
    const input = prompt("请输入喝水量（ml）", "350");
    if (input && !isNaN(input)) {
        const num = Number(input);
        if (num > 0) addWater(num);
    }
}

// ==================== 界面更新 ====================
function updateAllDisplay() {
    const today = getToday();
    const amount = data.records[today] || 0;
    const percent = Math.min(100, Math.round(amount / DAILY_GOAL * 100));

    document.getElementById("today").textContent = amount;
    document.getElementById("percent").textContent = percent;
    document.getElementById("amount-text").textContent = amount + " ml";
    document.getElementById("water").style.height = percent + "%";

    updateStreak();
    updateWeekAvg();
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
    document.getElementById("streak").textContent = streak;
}

function updateWeekAvg() {
    let total = 0;
    let count = 0;
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = date.toISOString().slice(0,10);
        if (data.records[key]) {
            total += data.records[key];
            count++;
        }
    }
    const avg = count > 0 ? Math.round(total / count) : 0;
    document.getElementById("week-avg").textContent = avg;
}

// ==================== 健康提醒功能（新增）================
function getRandomTip() {
    const tip = HEALTH_TIPS[Math.floor(Math.random() * HEALTH_TIPS.length)];
    document.getElementById("tip-card").textContent = "Tip: " + tip;
}

// 45分钟定时提醒 + 健康小贴士
function startRemindTimer() {
    setInterval(() => {
        if (document.hasFocus() && Date.now() - data.lastRemind > 10000) {
            const today = getToday();
            if ((!data.records[today] || data.records[today] < DAILY_GOAL * 0.6)) {
                if (confirm("已经45分钟没喝水啦！\n\n" + getRandomTip().replace("Tip: ", "") + "\n\n现在喝一杯吗？")) {
                    addWater(250);
                }
            }
            data.lastRemind = Date.now();
            saveData();
        }
    }, REMIND_INTERVAL);
}

// ==================== 其他功能 ====================
// 长按重置当天
function setupButtons() {
    const resetBtn = document.getElementById("reset-btn");
    let timer;
    resetBtn.onmousedown = resetBtn.ontouchstart = () => {
        timer = setTimeout(() => {
            if (confirm("确定要重置今天的饮水记录吗？")) {
                delete data.records[getToday()];
                saveData();
                updateAllDisplay();
                alert("已重置当天记录");
            }
        }, 2000);
        resetBtn.textContent = "松手取消...";
        resetBtn.style.background = "#d32f2f";
    };
    resetBtn.onmouseup = resetBtn.onmouseleave = resetBtn.ontouchend = () => {
        clearTimeout(timer);
        resetBtn.textContent = "长按重置当天";
        resetBtn.style.background = "#ff5252";
    };

    // 设置按钮
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
        updateAllDisplay();
        closeModal();
    } else alert("目标范围：1000~5000ml");
}

function closeModal() {
    document.getElementById("settings-modal").style.display = "none";
}

function showHistory() {
    let msg = "近7天饮水记录：\n\n";
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0,10);
        const amt = data.records[key] || 0;
        const day = d.toLocaleDateString("zh-CN", {month:"numeric", day:"numeric"});
        msg += `${day}（${["日","一","二","三","四","五","六"][d.getDay()]}） ${amt}ml ${amt >= MIN_FOR_STREAK ? "Success" : ""}\n`;
    }
    alert(msg);
}