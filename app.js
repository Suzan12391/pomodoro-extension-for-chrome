const startBtn   = document.querySelector('#startBtn');
const endtBtn    = document.querySelector('#endBtn');
const pausetBtn  = document.querySelector('#pausetBtn');

const workForm   = document.querySelector('#workForm');
const breakForm  = document.querySelector('#breakForm');
const divv       = document.querySelector('#divv');
const divv2       = document.querySelector('#divv2');

const endSond = document.querySelector('#endSond')
const startSond = document.querySelector('#startSond')

let timerId   = null;   
let endTime   = null;   
let remaining = 0;      
let status    = 'idle';
let mode      = null;  

const defaultQueries = [
  "hello",
  "cute kawaii waving",
  "kawaii welcome",
  "chibi hello",
  "cute starting"
];

const startQueries = [
  "kawaii work",
  "kawaii cute study",
  "kawaii focus",
];

const pauseQueries = [
  "kawaii wait",
  "kawaii pause",
  "kawaii thinking",
  "kawaii hold on"
];


const endQueries = [
  "kawaii done",
  "cute finish",
  "kawaii bye",
  "chibi completed",
  "cute success"
];


function activate(formElement) {
  workForm.classList.remove('active');
  breakForm.classList.remove('active');
  formElement.classList.add('active');
}

workForm.addEventListener('click', () => {
  mode = "work";
  activate(workForm);
  showSticker("gif/start.gif");

});

breakForm.addEventListener('click', () => {
  mode = "break";
  activate(breakForm);
  showSticker("gif/Break.gif");

});



function getMinutesFromForm(activeForm) {
  const input  = activeForm.querySelector('.userInput');
  const select = activeForm.querySelector('.userSelect');

  if (input.value !== '') {
    return Number(input.value);
  } else {
    return Number(select.value);
  }
}


function updateDisplay(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;

  // leading zero
  minutes = String(minutes).padStart(2, '0');
  seconds = String(seconds).padStart(2, '0');

  divv.textContent = `${minutes}:${seconds}`;
}


function startTimer(durationMinutes) {
  remaining = durationMinutes * 60000;
  endTime   = Date.now() + remaining;
  status    = 'running';

  startSond.currentTime = 0;
  startSond.play().catch(() => {});

  if (timerId !== null) {
    clearInterval(timerId);
  }

  timerId = setInterval(() => {
    remaining = endTime - Date.now();
    if (remaining < 0) remaining = 0;

    updateDisplay(remaining);

    if (remaining <= 0) {
      handleTimerEnd();
    }
  }, 1000);
}



startBtn.addEventListener('click', () => {
  const activeForm = document.querySelector('.active');
   
  if (!activeForm) {
   divv2.innerHTML='Pick Work or Break first'
    return;
  }

  const minutes = getMinutesFromForm(activeForm);
  divv2.innerHTML="Timer started."
  if (!minutes || minutes <= 0) {
    divv2.innerHTML='Please choose a valid time'
    return;
  }

  startTimer(minutes);
  showSticker("gif/start.gif")
  startBtn.classList.add("activeBtn");
  
});


pausetBtn.addEventListener('click', () => {

  if (status === 'running') {
    clearInterval(timerId);
    timerId = null;
    remaining = endTime - Date.now();
    if (remaining < 0) remaining = 0;
    status = 'paused';
   
        divv2.innerHTML="Session paused — resume when ready."
       pausetBtn.classList.add("activeBtn");
       startBtn.classList.remove("activeBtn");
       showSticker("gif/pause2.gif");


    return;
  }


  if (status === 'paused') {
    endTime = Date.now() + remaining;
    status  = 'running';
    
   timerId = setInterval(() => {
  remaining = endTime - Date.now();

  if (remaining < 0) remaining = 0;

  updateDisplay(remaining);

  if (remaining <= 0) {
    handleTimerEnd();
  }
}, 1000);

divv2.innerHTML = "Resumed. Keep going!";
startBtn.classList.add("activeBtn");
pausetBtn.classList.remove("activeBtn");


 
  }
});


endtBtn.addEventListener('click', () => {
    divv2.innerHTML="Session ended."
  clearInterval(timerId);
  timerId   = null;
  remaining = 0;
  status    = 'idle';
  updateDisplay(0);
 
   showSticker("gif/end.gif");
   workForm.classList.remove('active');
  breakForm.classList.remove('active');

  startBtn.classList.remove("activeBtn");
  pausetBtn.classList.remove("activeBtn")
});

function showSticker(path) {
  const gif = document.querySelector("#gifBox");

  gif.style.opacity = 0;

  setTimeout(() => {
    gif.src = path;
    gif.style.opacity = 1;
  }, 150);
}






document.addEventListener("click", (e) => {


  if (
    workForm.contains(e.target) ||
    breakForm.contains(e.target) ||
    startBtn.contains(e.target) ||
    pausetBtn.contains(e.target) ||
    endtBtn.contains(e.target)
  ) {
    return;
  }


  workForm.classList.remove("active");
  breakForm.classList.remove("active");

  startBtn.classList.remove("activeBtn");
  pausetBtn.classList.remove("activeBtn");
  endtBtn.classList.remove("activeBtn");

});


function handleTimerEnd() {
  clearInterval(timerId);
  timerId = null;
  status  = 'idle';
  remaining = 0;

  updateDisplay(0);

 
  if (mode === "work") {
    divv2.innerHTML = "Work session finished! Take a break.";
  } else if (mode === "break") {
    divv2.innerHTML = "Break is over. Back to work!";
  } else {
    divv2.innerHTML = "Time is up!";
  }


  workForm.classList.remove('active');
  breakForm.classList.remove('active');
  startBtn.classList.remove("activeBtn");
  pausetBtn.classList.remove("activeBtn");

  
  if (endSond) {
    endSond.currentTime = 0;
    endSond.play().catch(() => {});
  }


  showSticker("gif/end.gif");

 
  if (typeof chrome !== "undefined" && chrome.notifications) {
    let message;
    if (mode === "work") {
      message = "Your work session has finished.";
    } else if (mode === "break") {
      message = "Your break is over.";
    } else {
      message = "Timer finished.";
    }

    chrome.notifications.create("", {
      type: "basic",
      iconUrl: "icon.png",
      title: "Pomodoro Timer",
      message,
      priority: 2
    });
  }


  if (typeof chrome !== "undefined" && chrome.tabs) {
    chrome.tabs.create({ url: "finish.html" });
  }
  
}
