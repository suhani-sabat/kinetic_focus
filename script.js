function showPage(id){

document.querySelectorAll(".page")
.forEach(p=>p.classList.add("hidden"))

document.getElementById(id).classList.remove("hidden")

}


/* LOGIN */

function signup(){

let user=document.getElementById("signupUser").value
let pass=document.getElementById("signupPass").value

localStorage.setItem("user",user)
localStorage.setItem("pass",pass)

alert("Account created. Please login.")

}


function login(){

let user=document.getElementById("loginUser").value
let pass=document.getElementById("loginPass").value

let storedUser=localStorage.getItem("user")
let storedPass=localStorage.getItem("pass")

if(user===storedUser && pass===storedPass){

document.getElementById("loginPage").style.display="none"
document.getElementById("appContent").style.display="block"

}else{

alert("Invalid login")

}

}


/* TASK SYSTEM */

let completed=0
let streak=0

function addTask(){

let text=document.getElementById("taskText").value
let type=document.getElementById("taskType").value

if(!text) return

let task=document.createElement("div")
task.className="task"

let checkbox=document.createElement("input")
checkbox.type="checkbox"

checkbox.onchange=function(){

completed++
streak++

document.getElementById("completedCount").innerText=completed
document.getElementById("todayStreak").innerText=streak

task.remove()

}

let span=document.createElement("span")
span.innerText=text

task.appendChild(checkbox)
task.appendChild(span)

document.getElementById(type).appendChild(task)

document.getElementById("taskText").value=""

}


/* DRAG & DROP */

new Sortable(non,{group:'tasks'})
new Sortable(day,{group:'tasks'})
new Sortable(overflow,{group:'tasks'})



/* TIMER */

let timer
let remainingTime

function startTimer(){

let minutes=document.getElementById("customMinutes").value || 25

remainingTime=minutes*60

document.getElementById("focusScreen").classList.add("active")

updateTimer()

timer=setInterval(()=>{

remainingTime--

updateTimer()

if(remainingTime<=0){
clearInterval(timer)
exitFocus()
}

},1000)

}

function updateTimer(){

let m=Math.floor(remainingTime/60)
let s=remainingTime%60

document.getElementById("focusTime").innerText =
m+":"+(s<10?"0":"")+s

}

function exitFocus(){

clearInterval(timer)

document.getElementById("focusScreen").classList.remove("active")

}