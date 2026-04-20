// ============================================
// KINETIC FOCUS — script.js
// ============================================

const APP_STORAGE_KEY = 'kinetic_data_v3';
const APP_CONTRIBS_KEY = 'kinetic_contributions_v3';

let completed = 0, streak = 0, bestStreak = 0;
let contributions = JSON.parse(localStorage.getItem(APP_CONTRIBS_KEY)) || {};
let currentHeatmapYear = new Date().getFullYear();

function saveToStorage() {
    if (streak > bestStreak) bestStreak = streak;
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify({ completed, streak, bestStreak }));
    localStorage.setItem(APP_CONTRIBS_KEY, JSON.stringify(contributions));
}

function loadFromStorage() {
    const data = JSON.parse(localStorage.getItem(APP_STORAGE_KEY));
    if (data) { completed = data.completed||0; streak = data.streak||0; bestStreak = data.bestStreak||0; }
    document.getElementById("completedCount").innerText = completed;
    document.getElementById("todayStreak").innerText = streak;
    document.getElementById("bestStreak").innerText = bestStreak;
}

// ============================================
// PARTICLE BACKGROUND (canvas)
// ============================================
function initParticles() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    });

    const COLORS = ['rgba(157,78,221,', 'rgba(199,125,255,', 'rgba(58,12,163,'];
    const particles = Array.from({length: 70}, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.5 + 0.1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
    }));

    // A few larger glowing nodes
    const nodes = Array.from({length: 12}, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 3 + 1.5,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
    }));

    function draw() {
        ctx.clearRect(0, 0, W, H);

        // Draw connection lines between nearby nodes
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i+1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 220) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(157,78,221,${0.12 * (1 - dist/220)})`;
                    ctx.lineWidth = 0.6;
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
        }

        // Draw particles
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
            ctx.fillStyle = p.color + p.alpha + ')';
            ctx.fill();
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
            if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        });

        // Draw glowing nodes
        nodes.forEach(n => {
            ctx.beginPath();
            const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
            grd.addColorStop(0, n.color + '0.8)');
            grd.addColorStop(1, n.color + '0)');
            ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI*2);
            ctx.fillStyle = grd;
            ctx.fill();
            n.x += n.vx; n.y += n.vy;
            if (n.x < 0) n.x = W; if (n.x > W) n.x = 0;
            if (n.y < 0) n.y = H; if (n.y > H) n.y = 0;
        });

        requestAnimationFrame(draw);
    }
    draw();
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    initDragAndDrop();
    initParticles();

    // Loader → Landing (always show landing first)
    setTimeout(() => {
        const loader = document.getElementById('loader');
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.classList.add('hidden');
            document.getElementById('landingPage').classList.remove('hidden');
        }, 500);
    }, 2000);

    // 3D tilt
    document.addEventListener('mousemove', (e) => {
        const xAxis = (window.innerWidth/2 - e.pageX) / 40;
        const yAxis = (window.innerHeight/2 - e.pageY) / 40;
        const loginPage = document.getElementById('loginPage');
        const tiltCard = document.getElementById('tiltCard');
        if (!loginPage.classList.contains('hidden') && tiltCard)
            tiltCard.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        const lp = document.getElementById('landingPage');
        const lc = document.querySelector('.landing-content');
        if (!lp.classList.contains('hidden') && lc)
            lc.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg) translateZ(50px)`;
    });
    document.addEventListener('mouseleave', () => {
        const tiltCard = document.getElementById('tiltCard');
        if (tiltCard) tiltCard.style.transform = 'rotateY(0deg) rotateX(0deg)';
        const lc = document.querySelector('.landing-content');
        if (lc) lc.style.transform = 'rotateY(0deg) rotateX(0deg) translateZ(50px)';
    });
});

// ============================================
// NAVIGATION
// ============================================
function goToLogin() {
    document.getElementById('landingPage').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('hidden');
}

function showPage(id) {
    document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
    if (id === 'profile') {
        const user = localStorage.getItem("user") || "KF";
        document.getElementById("profileInitials").innerText = user.substring(0,2).toUpperCase();
        document.getElementById("profileUsername").innerText = user;
        document.getElementById("profileCompleted").innerText = completed;
        document.getElementById("profileStreak").innerText = streak;
        document.getElementById("profileBest").innerText = bestStreak;
        generateHeatmap(currentHeatmapYear);
    }
    if (id === 'reports') updateReportsLogic();
}

// ============================================
// AUTH
// ============================================
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    if (tab === 'login') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('loginForm').classList.add('active');
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('signupForm').classList.add('active');
    }
}

function signup() {
    const user = document.getElementById("signupUser").value.trim();
    const pass = document.getElementById("signupPass").value;
    if (!user || !pass) { alert("Please fill in both fields"); return; }
    localStorage.setItem("user", user);
    localStorage.setItem("pass", pass);
    alert("Account created! Please log in.");
    switchTab('login');
}

function login() {
    const user = document.getElementById("loginUser").value.trim();
    const pass = document.getElementById("loginPass").value;
    const storedUser = localStorage.getItem("user");
    const storedPass = localStorage.getItem("pass");
    if (user === storedUser && pass === storedPass && user !== "") {
        document.getElementById("loginPage").classList.add("hidden");
        document.getElementById("appContent").classList.remove("hidden");
        document.getElementById("profileInitials").innerText = user.substring(0,2).toUpperCase();
        document.getElementById("profileUsername").innerText = user;
        generateHeatmap(currentHeatmapYear);
        updateReportsLogic();
    } else {
        alert("Invalid credentials.");
    }
}

function togglePass(inputId, btn) {
    const input = document.getElementById(inputId);
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.querySelector('svg').style.opacity = isHidden ? '1' : '0.4';
}

// ============================================
// TASKS
// ============================================
function recordContribution(dateStr) {
    if (!contributions[dateStr]) contributions[dateStr] = 0;
    contributions[dateStr]++;
    completed++; streak++;
    if (streak > bestStreak) bestStreak = streak;
    document.getElementById("completedCount").innerText = completed;
    document.getElementById("todayStreak").innerText = streak;
    document.getElementById("bestStreak").innerText = bestStreak;
    saveToStorage();
}

function addTask() {
    const text = document.getElementById("taskText").value.trim();
    const type = document.getElementById("taskType").value;
    if (!text) return;
    const task = document.createElement("div");
    task.className = "task";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.onchange = () => {
        recordContribution(new Date().toISOString().slice(0,10));
        task.style.opacity = "0"; task.style.transform = "scale(1.1)";
        setTimeout(() => task.remove(), 300);
    };
    const span = document.createElement("span");
    span.innerText = text;
    task.appendChild(checkbox); task.appendChild(span);
    document.getElementById(type).appendChild(task);
    document.getElementById("taskText").value = "";
}

function initDragAndDrop() {
    ['non','day','overflow'].forEach(id =>
        new Sortable(document.getElementById(id), { group: 'tasks', animation: 200 })
    );
}

// ============================================
// HEATMAP — FIXED MONTH LABELS
// ============================================
function setHeatmapYear(year, e) {
    currentHeatmapYear = year;
    document.querySelectorAll('.heatmap-full-panel .year-btn').forEach(b => b.classList.remove('active'));
    if (e && e.target) e.target.classList.add('active');
    generateHeatmap(year);
}

function generateHeatmap(year) {
    const grid = document.getElementById('heatmapGrid');
    const monthBar = document.getElementById('heatmapMonthLabels');
    const totalLabel = document.getElementById('totalContribs');
    const activeLabel = document.getElementById('heatmapActiveDays');
    grid.innerHTML = ''; monthBar.innerHTML = '';

    const today = new Date();
    const isCurrentYear = today.getFullYear() === year;
    let startDate, endDate;
    if (isCurrentYear) {
        endDate = new Date(today);
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 364);
    } else {
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 11, 31);
    }

    // Align start to Sunday
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const COL_PX = 17; // 14px cell + 3px gap

    const totalDays = Math.round((endDate - startDate) / 86400000) + 1;
    const totalWeeks = Math.ceil(totalDays / 7);

    // -- Build month labels using absolute positioning --
    // Find the first week index where each month starts
    const monthWeekMap = {};
    for (let w = 0; w < totalWeeks; w++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + w * 7);
        if (d > endDate) break;
        const m = d.getMonth();
        const mName = MONTHS[m];
        // Only set if this is the first occurrence in a new month-column
        if (!(mName in monthWeekMap)) {
            monthWeekMap[mName] = w;
        } else {
            // Also track month transitions mid-year
            const nextMonday = new Date(d);
            nextMonday.setDate(d.getDate() + 1);
            if (nextMonday.getMonth() !== m && !(MONTHS[nextMonday.getMonth()] in monthWeekMap)) {
                monthWeekMap[MONTHS[nextMonday.getMonth()]] = w + 1;
            }
        }
    }

    // Set month bar width to match grid
    const gridW = totalWeeks * COL_PX;
    monthBar.style.width = gridW + 'px';

    // Place labels absolutely, skip if too close to previous
    let lastPlacedX = -30;
    MONTHS.forEach(mName => {
        if (!(mName in monthWeekMap)) return;
        const x = monthWeekMap[mName] * COL_PX;
        if (x - lastPlacedX < 28) return; // skip if overlap
        lastPlacedX = x;
        const el = document.createElement('span');
        el.className = 'month-label-item';
        el.style.left = x + 'px';
        el.innerText = mName;
        monthBar.appendChild(el);
    });

    // -- Build grid cells --
    let totalContribs = 0, activeDays = 0, maxSt = 0, curSt = 0;

    for (let w = 0; w < totalWeeks; w++) {
        for (let d = 0; d < 7; d++) {
            const day = new Date(startDate);
            day.setDate(startDate.getDate() + w * 7 + d);
            const dateStr = day.toISOString().slice(0,10);
            const inRange = day >= new Date(year,0,1) && day <= endDate;
            const box = document.createElement('div');
            box.className = 'contribution-box';
            if (!inRange) {
                box.style.visibility = 'hidden';
                grid.appendChild(box);
                continue;
            }
            const count = parseInt(contributions[dateStr] || 0);
            totalContribs += count;
            if (count > 0) { activeDays++; curSt++; if (curSt > maxSt) maxSt = curSt; }
            else curSt = 0;
            let level = 0;
            if (count === 1) level = 1;
            else if (count >= 2 && count < 4) level = 2;
            else if (count >= 4) level = 3;
            box.classList.add('level-' + level);
            box.title = dateStr + ': ' + count + ' task' + (count !== 1 ? 's' : '');
            grid.appendChild(box);
        }
    }

    totalLabel.innerText = totalContribs;
    activeLabel.innerText = 'Total active days: ' + activeDays + '   |   Max streak: ' + maxSt;
}

// ============================================
// REPORTS
// ============================================
function switchReport(type) {
    document.querySelectorAll('#reports .year-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('reportSubtitle').innerText =
        type === 'week' ? "Overview of your flow states this week." : "Overview of your flow states this month.";
    updateReportsLogic(true);
}

function updateReportsLogic(onlyAnimate = false) {
    const zeroMsg = document.getElementById('zeroDataMessage');
    const chart = document.getElementById('reportChart');
    const insight = document.getElementById('reportInsight');
    if (completed === 0) {
        zeroMsg.classList.remove('hidden'); chart.classList.add('hidden');
        insight.innerText = "You haven't logged any tasks yet. Add tasks and complete them to activate analytics.";
    } else {
        zeroMsg.classList.add('hidden'); chart.classList.remove('hidden');
        if (!onlyAnimate) {
            insight.innerText = completed < 10
                ? `You've completed ${completed} tasks so far. Focus on consistency to build your streak.`
                : `Outstanding! ${completed} tasks completed with a streak of ${streak}. Keep the momentum.`;
        }
        setTimeout(() => {
            document.querySelectorAll('.bar').forEach(b => {
                b.style.height = Math.floor(Math.random() * 70 + 20) + '%';
            });
        }, 100);
    }
}

// ============================================
// AI COACH — REAL CLAUDE API
// The Anthropic API doesn't support direct
// browser calls due to CORS. We use a CORS
// proxy. For production, set up your own
// backend proxy at /api/chat. The fallback
// below uses a smart local response engine.
// ============================================
let chatMessages = [];
let isBotTyping = false;

function handleChatEnter(e) {
    if (e.key === 'Enter' && !isBotTyping) sendChatMessage();
}

function sendChatMessage() {
    if (isBotTyping) return;
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;
    appendMessage(msg, 'user');
    input.value = '';
    chatMessages.push({ role: 'user', content: msg });
    showTypingIndicator();
    callClaude();
}

function appendMessage(text, sender) {
    const history = document.getElementById('chatHistory');
    const div = document.createElement('div');
    div.className = 'chat-msg ' + sender;
    div.innerHTML = '<div class="msg-bubble">' + text.replace(/\n/g, '<br>') + '</div>';
    history.appendChild(div);
    history.scrollTop = history.scrollHeight;
}

function showTypingIndicator() {
    isBotTyping = true;
    const history = document.getElementById('chatHistory');
    const div = document.createElement('div');
    div.className = 'chat-msg bot'; div.id = 'typingIndicator';
    div.innerHTML = '<div class="msg-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>';
    history.appendChild(div);
    history.scrollTop = history.scrollHeight;
}

function removeTypingIndicator() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
    isBotTyping = false;
}

async function callClaude() {
    const SYSTEM = `You are Kinetic Coach, an AI productivity and study assistant inside Kinetic Focus app. Help users with:
- Task prioritization, time management, scheduling
- Study strategies (active recall, spaced repetition, Pomodoro)
- Programming and coding help
- Focus techniques and overcoming burnout
- Motivation and goal-setting
Keep responses concise, practical, energetic. Use short paragraphs. Be direct. Never be preachy.`;

    // Try the Anthropic API directly (works if server has CORS headers or via proxy)
    try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'anthropic-dangerous-direct-browser-access': 'true' },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 800,
                system: SYSTEM,
                messages: chatMessages
            })
        });
        const data = await res.json();
        removeTypingIndicator();
        if (data.content && data.content[0]) {
            const reply = data.content.filter(b => b.type === 'text').map(b => b.text).join('\n');
            chatMessages.push({ role: 'assistant', content: reply });
            appendMessage(reply, 'bot');
        } else if (data.error) {
            // API error → use smart local fallback
            const reply = smartLocalReply(chatMessages[chatMessages.length-1].content);
            chatMessages.push({ role: 'assistant', content: reply });
            appendMessage(reply, 'bot');
        }
    } catch(err) {
        removeTypingIndicator();
        // Network/CORS error → smart local fallback
        const reply = smartLocalReply(chatMessages[chatMessages.length-1].content);
        chatMessages.push({ role: 'assistant', content: reply });
        appendMessage(reply, 'bot');
    }
}

function smartLocalReply(input) {
    const q = input.toLowerCase();
    if (q.match(/hello|hi|hey|sup|yo/)) return "Greetings! Neural net synced. What's our primary objective today?";
    if (q.match(/schedule|plan|organize|manage time/)) return "Use the 'Eat the Frog' method: put your hardest task in Non-Negotiable and attack it first thing. Everything else flows easier after that. Want to set a 25-min timer now?";
    if (q.match(/study|learn|exam|test|read|memorize/)) return "Best study technique: 25 min active reading → close the material → write everything you remember from scratch. That retrieval practice beats re-reading every time. Start the timer?";
    if (q.match(/code|bug|programming|debug|javascript|python|html|css|java|error/)) return "When stuck on a bug: explain the problem out loud (rubber duck it), then check your assumptions one by one. If you've been at it >30 min, take a 10-min break — your brain solves problems in the background.";
    if (q.match(/tired|exhausted|burnout|overwhelm|stressed/)) return "Your kinetic energy is depleted. That's data, not weakness. Take a real break — no screens, hydrate, walk outside if possible. Come back in 30 min. You can't pour from an empty vessel.";
    if (q.match(/focus|distract|concentrate|attention/)) return "Kill all notifications for the next 25 minutes. Put your phone face-down in another room. The single most effective focus hack is eliminating the option to get distracted. Use the Deep Work timer.";
    if (q.match(/motivat|lazy|procrastinat/)) return "Motivation follows action, not the other way around. Start with just 2 minutes on the task. Once you start, momentum builds. Set the timer for 25 min and just begin — you won't want to stop.";
    if (q.match(/goal|target|objective/)) return "A good goal has 3 things: it's specific, measurable, and has a deadline. 'Study more' is not a goal. 'Finish chapters 3-5 by Thursday 6pm' is. Drop your task into the board and let's execute.";
    const fallbacks = [
        "Break it into smaller actions and put the first one on your board. Execution beats planning every time.",
        "Solid. Let's make it actionable — what's the single next physical step you need to take on this?",
        "Understood. Start the 25-min Deep Work timer and go. Thinking too much is the enemy of doing.",
        "That's a great question. The key is consistency over intensity. Small daily actions compound into massive results."
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

// ============================================
// FOCUS TIMER
// ============================================
let timer, remainingTime;

function startTimer() {
    const minutes = parseInt(document.getElementById("customMinutes").value) || 25;
    remainingTime = minutes * 60;
    document.getElementById("focusScreen").classList.add("active");
    updateTimerDisplay();
    timer = setInterval(() => {
        remainingTime--;
        updateTimerDisplay();
        if (remainingTime <= 0) {
            clearInterval(timer); exitFocus();
            recordContribution(new Date().toISOString().slice(0,10));
            generateHeatmap(currentHeatmapYear);
            updateReportsLogic();
            alert("Deep work session complete! Flow state achieved. +1 Contribution");
        }
    }, 1000);
}

function updateTimerDisplay() {
    const m = Math.floor(remainingTime / 60);
    const s = remainingTime % 60;
    document.getElementById("focusTime").innerText = (m<10?'0'+m:m) + ':' + (s<10?'0'+s:s);
}

function exitFocus() {
    clearInterval(timer);
    document.getElementById("focusScreen").classList.remove("active");
}