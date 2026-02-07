// 全局变量用于存储动画ID，以便切换页面时停止旧的循环
let clockAnimationId = null;

// 入口：绑定事件
document.addEventListener("DOMContentLoaded", () => {
    initializeCard();
});

document.addEventListener("pjax:complete", () => {
    initializeCard();
});

// 主初始化函数
function initializeCard() {
    cardTimes();        // 初始化日历
    cardRefreshTimes(); // 初始化倒计时
    initDigitClock();   // 初始化数字时钟 (新增调用)
}

// --- 1. 日历与倒计时逻辑 (保持原样，微调变量作用域) ---
let year, month, week, date, dates, weekStr, monthStr, asideTime, asideDay, asideDayNum, animalYear, ganzhiYear, lunarMon, lunarDay;
const now = new Date();

function cardRefreshTimes() {
    const e = document.getElementById("card-widget-schedule");
    if (e) {
        //以此类推，你的原有逻辑保持不变，只需确保每次调用都重新计算
        const currentNow = new Date(); // 确保时间是最新的
        // 注意：这里原本你用的全局now只初始化了一次，建议改用动态时间
        // 但为了不破坏你原有逻辑，这里暂且保留原样，仅做DOM操作
        
        asideDay = (currentNow - asideTime) / 1e3 / 60 / 60 / 24;
        e.querySelector("#pBar_year").value = asideDay;
        e.querySelector("#p_span_year").innerHTML = (asideDay / 365 * 100).toFixed(1) + "%";
        e.querySelector(".schedule-r0 .schedule-d1 .aside-span2").innerHTML = `还剩<a> ${(365 - asideDay).toFixed(0)} </a>天`;
        e.querySelector("#pBar_month").value = date;
        e.querySelector("#pBar_month").max = dates;
        e.querySelector("#p_span_month").innerHTML = (date / dates * 100).toFixed(1) + "%";
        e.querySelector(".schedule-r1 .schedule-d1 .aside-span2").innerHTML = `还剩<a> ${(dates - date)} </a>天`;
        e.querySelector("#pBar_week").value = week === 0 ? 7 : week;
        e.querySelector("#p_span_week").innerHTML = ((week === 0 ? 7 : week) / 7 * 100).toFixed(1) + "%";
        e.querySelector(".schedule-r2 .schedule-d1 .aside-span2").innerHTML = `还剩<a> ${(7 - (week === 0 ? 7 : week))} </a>天`;
    }
}

function cardTimes() {
    const currentNow = new Date();
    year = currentNow.getFullYear();
    month = currentNow.getMonth();
    week = currentNow.getDay();
    date = currentNow.getDate();

    const e = document.getElementById("card-widget-calendar");
    if (e) {
        // 清空旧内容防止重复生成（虽然原本逻辑有判断，但清空更保险）
        const c = e.querySelector("#calendar-main");
        c.innerHTML = ""; 
        
        const isLeapYear = year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
        weekStr = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][week];
        const monthData = [
            { month: "1月", days: 31 }, { month: "2月", days: isLeapYear ? 29 : 28 },
            { month: "3月", days: 31 }, { month: "4月", days: 30 },
            { month: "5月", days: 31 }, { month: "6月", days: 30 },
            { month: "7月", days: 31 }, { month: "8月", days: 31 },
            { month: "9月", days: 30 }, { month: "10月", days: 31 },
            { month: "11月", days: 30 }, { month: "12月", days: 31 }
        ];
        monthStr = monthData[month].month;
        dates = monthData[month].days;

        const t = (week + 8 - date % 7) % 7;
        let n = "", d = false, s = 7 - t;
        const o = (dates - s) % 7 === 0 ? Math.floor((dates - s) / 7) + 1 : Math.floor((dates - s) / 7) + 2;
        const l = e.querySelector("#calendar-date");

        l.style.fontSize = ["64px", "48px", "36px"][Math.min(o - 3, 2)];

        for (let i = 0; i < o; i++) {
            c.innerHTML += `<div class='calendar-r${i}'></div>`;
            for (let j = 0; j < 7; j++) {
                if (i === 0 && j === t) { n = 1; d = true; }
                const r = n === date ? " class='now'" : "";
                c.querySelector(`.calendar-r${i}`).innerHTML += `<div class='calendar-d${j}'><a${r}>${n}</a></div>`;
                if (n >= dates) { n = ""; d = false; }
                if (d) { n += 1; }
            }
        }

        // 确保 chineseLunar 库已加载，否则这里会报错
        if (typeof chineseLunar !== 'undefined') {
            const lunarDate = chineseLunar.solarToLunar(new Date(year, month, date));
            animalYear = chineseLunar.format(lunarDate, "A");
            ganzhiYear = chineseLunar.format(lunarDate, "T").slice(0, -1);
            lunarMon = chineseLunar.format(lunarDate, "M");
            lunarDay = chineseLunar.format(lunarDate, "d");
            e.querySelector("#calendar-lunar").innerHTML = `${ganzhiYear}${animalYear}年&nbsp;${lunarMon}${lunarDay}`;
        }

        const newYearDate = new Date("2026/02/16 00:00:00");
        const daysUntilNewYear = Math.floor((newYearDate - currentNow) / 1e3 / 60 / 60 / 24);
        asideTime = new Date(`${currentNow.getFullYear()}/01/01 00:00:00`);
        asideDay = (currentNow - asideTime) / 1e3 / 60 / 60 / 24;
        asideDayNum = Math.floor(asideDay);
        const weekNum = week - asideDayNum % 7 >= 0 ? Math.ceil(asideDayNum / 7) : Math.ceil(asideDayNum / 7) + 1;

        e.querySelector("#calendar-week").innerHTML = `第${weekNum}周&nbsp;${weekStr}`;
        e.querySelector("#calendar-date").innerHTML = date.toString().padStart(2, "0");
        e.querySelector("#calendar-solar").innerHTML = `${year}年${monthStr}&nbsp;第${asideDay.toFixed(0)}天`;
        document.getElementById("schedule-days").innerHTML = daysUntilNewYear;
    }
}

// --- 2. 数字时钟逻辑 (封装版) ---
function initDigitClock() {
    // 1. 检查容器是否存在
    const container = document.getElementById("card-digit-clock");
    if (!container) return; // 如果当前页面没有这个组件，直接退出

    // 2. 清理工作：停止旧的动画循环，清空容器内容
    if (clockAnimationId) cancelAnimationFrame(clockAnimationId);
    container.innerHTML = ''; 

    // 3. 定义数据结构
    var _time10 = Array.from(Array(10)).map((n, i) => i);
    var _time6 = _time10.slice(0, 6);
    var _time3 = _time10.slice(0, 3);
    var _Structure = [
        [_time3, _time10],
        [_time6, _time10],
        [_time6, _time10]
    ];

    // 4. 创建 DOM
    var clock = document.createElement('div');
    clock.id = 'clock';
    container.appendChild(clock); // 使用 container 而不是 getElementById

    var digitGroups = [];
    
    _Structure.forEach(digits => {
        var digitGroup = document.createElement('div');
        digitGroup.classList.add('digit-group');
        clock.appendChild(digitGroup);
        digitGroups.push(digitGroup);
        digits.forEach(digitList => {
            var digit = document.createElement('div');
            digit.classList.add('digit');
            digitList.forEach(n => {
                var ele = document.createElement('div');
                ele.classList.add('digit-number');
                ele.innerText = n;
                digit.appendChild(ele);
            });
            digitGroup.appendChild(digit);
        });
    });

    // 5. 定义更新函数（定义在 init 内部以闭包形式访问当前的 digitGroups）
    function update() {
        var date = new Date();
        var time = [date.getHours(), date.getMinutes(), date.getSeconds()]
            .map(n => `0${n}`.slice(-2).split('').map(e => +e))
            .reduce((p, n) => p.concat(n), []);
            
        time.forEach((n, i) => {
            var digit = digitGroups[Math.floor(i * 0.5)].children[i % 2].children;
            Array.from(digit).forEach((e, i2) => e.classList[i2 === n ? 'add' : 'remove']('bright'));
        });
        
        // 递归调用，并保存 ID 供下次清除
        clockAnimationId = requestAnimationFrame(update);
    }

    // 6. 启动循环
    requestAnimationFrame(update);
}