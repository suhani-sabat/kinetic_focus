// --- CENTRALIZED APP DATA & PERSISTENCE ---
const APP_STORAGE_KEY = 'kinetic_data_v3'; 
const APP_CONTRIBS_KEY = 'kinetic_contributions_v3';

let completed = 0;
let streak = 0;
let bestStreak = 0;
let contributions = JSON.parse(localStorage.getItem(APP_CONTRIBS_KEY)) || {};

function saveToStorage() {
    if (streak > bestStreak) bestStreak = streak;
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify({ completed, streak, bestStreak }));
    localStorage.setItem(APP_CONTRIBS_KEY, JSON.stringify(contributions));
}

function loadFromStorage() {
    const data = JSON.parse(localStorage.getItem(APP_STORAGE_KEY));
    if (data) {
        completed = data.completed || 0;
        streak = data.streak || 0;
        bestStreak = data.bestStreak || 0;
    }
    
    document.getElementById("completedCount").innerText = completed;
    document.getElementById("todayStreak").innerText = streak;
    document.getElementById("bestStreak").innerText = bestStreak;
}

// --- INIT, LOADER & LANDING ---
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    initDragAndDrop();

    // Loader Sequence
    setTimeout(() => {
        const loader = document.getElementById('loader');
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.classList.add('hidden');
            // If already logged in, go straight to app. Otherwise, show landing page.
            if(localStorage.getItem("user")) {
                document.getElementById('appContent').classList.remove('hidden');
                document.querySelector('.ambient-universe').classList.add('hidden');
                generateHeatmap(new Date().getFullYear());
                updateReportsLogic();
            } else {
                document.getElementById('landingPage').classList.remove('hidden');
            }
        }, 500);
    }, 2000); // 2 second loading animation

    // 3D Mouse Tracking for Panels
    document.addEventListener('mousemove', (e) => {
        let xAxis = (window.innerWidth / 2 - e.pageX) / 40; 
        let yAxis = (window.innerHeight / 2 - e.pageY) / 40;

        // Login Card
        const loginPage = document.getElementById('loginPage');
        const tiltCard = document.getElementById('tiltCard');
        if (!loginPage.classList.contains('hidden') && tiltCard) {
            tiltCard.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        }

        // Landing Content
        const landingPage = document.getElementById('landingPage');
        if (!landingPage.classList.contains('hidden')) {
            document.querySelector('.landing-content').style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg) translateZ(50px)`;
        }

        // App Panels (Only if they have hover-3d class and are currently visible)
        document.querySelectorAll('.page:not(.hidden) .hover-3d').forEach(panel => {
            // CSS handles the hover, but we can add slight parallax if wanted.
            // For stability, relying on CSS :hover for the main pop effect is smoother.
        });
    });

    document.addEventListener('mouseleave', () => {
        const tiltCard = document.getElementById('tiltCard');
        if (tiltCard) tiltCard.style.transform = `rotateY(0deg) rotateX(0deg)`;
        const landingContent = document.querySelector('.landing-content');
        if(landingContent) landingContent.style.transform = `rotateY(0deg) rotateX(0deg) translateZ(50px)`;
    });
});

// --- NAVIGATION ---
function goToLogin() {
    document.getElementById('landingPage').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('hidden');
}

function showPage(id) {
    document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
    
    if(id === 'profile') {
        generateHeatmap(new Date().getFullYear()); 
        let user = localStorage.getItem("user") || "KF";
        document.getElementById("profileInitials").innerText = user.substring(0,2).toUpperCase();
    }
    if(id === 'reports') {
        updateReportsLogic();
    }
}

// --- AUTHENTICATION ---
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    
    if(tab === 'login') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('loginForm').classList.add('active');
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('signupForm').classList.add('active');
    }
}

function signup() {
    let user = document.getElementById("signupUser").value;
    let pass = document.getElementById("signupPass").value;
    if(!user || !pass) { alert("Please fill in both fields"); return; }
    localStorage.setItem("user", user);
    localStorage.setItem("pass", pass);
    alert("Account created! Please log in.");
    switchTab('login'); 
}

function login() {
    let user = document.getElementById("loginUser").value;
    let pass = document.getElementById("loginPass").value;
    let storedUser = localStorage.getItem("user");
    let storedPass = localStorage.getItem("pass");

    if (user === storedUser && pass === storedPass && user !== "" && user !== null) {
        document.getElementById("loginPage").classList.add("hidden");
        document.querySelector(".ambient-universe").classList.add("hidden"); 
        document.getElementById("appContent").classList.remove("hidden");
        
        // Initial setup on login
        let initials = user.substring(0,2).toUpperCase();
        document.getElementById("profileInitials").innerText = initials;
        generateHeatmap(new Date().getFullYear());
        updateReportsLogic();

    } else {
        alert("Invalid credentials.");
    }
}

// --- TASK SYSTEM ---
function recordContribution(dateString) {
    if(!contributions[dateString]) contributions[dateString] = 0;
    contributions[dateString]++;
    completed++; streak++;
    if (streak > bestStreak) bestStreak = streak;
    
    document.getElementById("completedCount").innerText = completed;
    document.getElementById("todayStreak").innerText = streak;
    document.getElementById("bestStreak").innerText = bestStreak;
    saveToStorage();
}

function addTask() {
    let text = document.getElementById("taskText").value;
    let type = document.getElementById("taskType").value;
    if (!text) return;

    let task = document.createElement("div");
    task.className = "task"; 

    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    checkbox.onchange = function () {
        const todayStr = new Date().toISOString().slice(0, 10); 
        recordContribution(todayStr);
        task.style.transform = "translateZ(50px) scale(1.1)"; // Pop out before deleting
        task.style.opacity = "0";
        setTimeout(() => task.remove(), 300);
    };

    let span = document.createElement("span");
    span.innerText = text;
    task.appendChild(checkbox); task.appendChild(span);
    document.getElementById(type).appendChild(task);
    document.getElementById("taskText").value = "";
}

function initDragAndDrop() {
    new Sortable(document.getElementById('non'), { group: 'tasks', animation: 200 });
    new Sortable(document.getElementById('day'), { group: 'tasks', animation: 200 });
    new Sortable(document.getElementById('overflow'), { group: 'tasks', animation: 200 });
}


// --- PROFILE HEATMAP (Fixed Zero State) ---
function setHeatmapYear(year) {
    document.querySelectorAll('.heatmap-container .year-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    generateHeatmap(year);
}

function generateHeatmap(year) {
    const grid = document.getElementById('heatmapGrid');
    const totalCountLabel = document.getElementById('totalContribs');
    grid.innerHTML = ''; 
    
    const today = new Date();
    const isCurrentYear = today.getFullYear() === year;
    const oneYearAgo = new Date(); oneYearAgo.setDate(today.getDate() - 364);
    
    const startDate = isCurrentYear ? oneYearAgo : new Date(year, 0, 1);
    const endDate = isCurrentYear ? today : new Date(year, 11, 31);
    const formatDate = (date) => date.toISOString().slice(0, 10);
    
    grid.innerHTML += `<div class="contribution-box day">Mon</div><div class="contribution-box day" style="grid-row: 4">Wed</div><div class="contribution-box day" style="grid-row: 6">Fri</div>`;

    const numDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    let yearContribCount = 0; let lastMonth = -1;

    for (let i = 0; i < numDays; i++) {
        const currentDay = new Date(startDate); currentDay.setDate(startDate.getDate() + i);
        const dateStr = formatDate(currentDay);
        
        // Ensure count is strictly treated as integer
        const count = parseInt(contributions[dateStr] || 0);
        yearContribCount += count;
        
        let level = 0;
        if (count > 0 && count < 2) level = 1;
        else if (count >= 2 && count < 4) level = 2;
        else if (count >= 4) level = 3;
        
        const box = document.createElement('div');
        box.className = `contribution-box level-${level}`;
        box.title = `${dateStr}: ${count} tasks`; 

        const month = currentDay.getMonth();
        if (month !== lastMonth) {
            const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            const labelBox = document.createElement('div');
            labelBox.className = 'contribution-box month'; labelBox.innerText = months[month];
            grid.appendChild(labelBox); lastMonth = month;
        }
        grid.appendChild(box);
    }
    
    totalCountLabel.innerText = yearContribCount;
    
    // Manage empty state class for styling
    if(yearContribCount === 0) {
        grid.classList.add('empty-state');
    } else {
        grid.classList.remove('empty-state');
    }
}

// Button to explicitly load fake data to test UI
function addSampleContribution() {
    completed = 0; streak = 0; bestStreak = 0; contributions = {}; 
    for (let i = 0; i < 365; i++) {
        const pastDate = new Date(); pastDate.setDate(new Date().getDate() - i);
        const count = Math.floor(Math.random() * 5); // 0 to 4
        if(count > 0) {
            contributions[pastDate.toISOString().slice(0, 10)] = count;
            completed += count;
        }
    }
    streak = 14; bestStreak = 42;
    saveToStorage(); loadFromStorage();
    generateHeatmap(new Date().getFullYear()); 
    updateReportsLogic();
    alert('Sample Data Loaded! Visuals updated.');
}


// --- REPORTS LOGIC ---
function switchReport(type) {
    document.querySelectorAll('#reports .year-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const subtitle = document.getElementById('reportSubtitle');
    if(type === 'week') subtitle.innerText = "Overview of your flow states this week.";
    else subtitle.innerText = "Overview of your flow states this month.";
    
    updateReportsLogic(true); // pass true to just animate bars if data exists
}

function updateReportsLogic(onlyAnimate = false) {
    const zeroMsg = document.getElementById('zeroDataMessage');
    const chart = document.getElementById('reportChart');
    const insightText = document.getElementById('reportInsight');
    
    if (completed === 0) {
        // Show zero state
        zeroMsg.classList.remove('hidden');
        chart.classList.add('hidden');
        insightText.innerText = "You haven't logged any tasks yet. Initialize your flow state by adding a 'Task of the Day' to activate analytics.";
    } else {
        // Show chart
        zeroMsg.classList.add('hidden');
        chart.classList.remove('hidden');
        
        if(!onlyAnimate) {
            if (completed < 10) {
                insightText.innerText = `You've completed ${completed} tasks so far. Excellent start. Focus on consistency over intensity to build your streak.`;
            } else {
                insightText.innerText = `Outstanding momentum! With ${completed} completed tasks and a streak of ${streak}, your neural efficiency is peaking. Maintain this rhythm.`;
            }
        }
        
        // Animate chart bars
        setTimeout(() => {
            const bars = document.querySelectorAll('.bar');
            bars.forEach(bar => {
                let randomHeight = Math.floor(Math.random() * 70) + 20; // 20% to 90%
                bar.style.height = randomHeight + "%";
            });
        }, 100);
    }
}


// --- AI COACH CHATBOT (Improved Logic) ---
function handleChatEnter(e) {
    if (e.key === 'Enter') sendChatMessage();
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if(!msg) return;

    appendMessage(msg, 'user');
    input.value = '';
    scrollToChatBottom();

    // Show typing indicator (simulated by delay)
    setTimeout(() => {
        let reply = getSmartAIResponse(msg.toLowerCase());
        appendMessage(reply, 'bot');
        scrollToChatBottom();
    }, 1000);
}

function appendMessage(text, sender) {
    const history = document.getElementById('chatHistory');
    const div = document.createElement('div');
    div.className = `chat-msg ${sender}`;
    div.innerHTML = `<div class="msg-bubble">${text}</div>`;
    history.appendChild(div);
}

function scrollToChatBottom() {
    const history = document.getElementById('chatHistory');
    history.scrollTop = history.scrollHeight;
}

// Better mock logic mapping user intent
function getSmartAIResponse(input) {
    if (input.includes('schedule') || input.includes('plan')) {
        return "I recommend the 'Eat the Frog' method. Put your hardest or most critical task in the 'Non-Negotiable' column and tackle it first. Do you want to set a 25-minute timer for it?";
    } else if (input.includes('study') || input.includes('learn') || input.includes('read')) {
        return "For studying, active recall is best. Study the material for 25 minutes, then close your books and try to write down everything you remember. Should we start the timer?";
    } else if (input.includes('code') || input.includes('bug') || input.includes('project') || input.includes('html') || input.includes('java')) {
        return "When you hit a roadblock in development, stepping away helps. Take a 10-minute break. If it's a massive project, break it down into smaller sub-tasks on your board.";
    } else if (input.includes('tired') || input.includes('exhausted') || input.includes('burnout')) {
        return "Your kinetic energy is low. Rest is essential for long-term flow. Log off, hydrate, and don't look at a screen for the next hour.";
    } else if (input.includes('sub') || input.includes('multiple') || input.includes('lot')) {
        return "That's a lot to juggle. Let's sequence them. Pick just ONE sub-task and drag it to 'Task of the Day'. Ignore the rest until that one is done.";
    } else if (input.includes('hello') || input.includes('hi')) {
        return "Greetings! Neural net is synced. What is our primary objective for today?";
    } else {
        // Fallback array for variety
        const fallbacks = [
            "Interesting. To maintain momentum, let's ensure that's broken down into an actionable step on your board.",
            "I hear you. If you're feeling stuck, starting a 25-minute focus timer usually breaks the friction.",
            "Understood. Let's focus on execution. Drag your next action item to the 'Task of the Day' column.",
            "That makes sense. Productivity is about rhythm. Are you ready to enter the Flow State?"
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
}


// --- 3D FOCUS TIMER ---
let timer; let remainingTime;

function startTimer() {
    let minutes = document.getElementById("customMinutes").value || 25;
    remainingTime = minutes * 60;
    
    document.getElementById("focusScreen").classList.add("active");
    updateTimer();

    timer = setInterval(() => {
        remainingTime--; updateTimer();
        if (remainingTime <= 0) {
            clearInterval(timer); exitFocus();
            recordContribution(new Date().toISOString().slice(0, 10));
            generateHeatmap(new Date().getFullYear()); 
            updateReportsLogic();
            alert("Deep work session complete. Flow state achieved! +1 Contribution");
        }
    }, 1000);
}

function updateTimer() {
    let m = Math.floor(remainingTime / 60); let s = remainingTime % 60;
    document.getElementById("focusTime").innerText = (m<10?"0"+m:m) + ":" + (s<10?"0"+s:s);
}

function exitFocus() {
    clearInterval(timer);
    document.getElementById("focusScreen").classList.remove("active");
}