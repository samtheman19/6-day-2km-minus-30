// =======================
// CONFIG
// =======================
const SPEED_STEP = 0.1;
const STORAGE_KEY = "runProgress_v2";

// Audio beep
const beep = new Audio(
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA="
);

// =======================
// STORAGE
// =======================
let savedData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
  history: []
};

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
}

// =======================
// WORKOUT PLAN
// =======================
const workouts = {
  "Monday": {
    type: "Intervals",
    explain: "Short, hard efforts at race pace with minimal recovery. Focus on relaxed speed and consistent splits.",
    warmup: ["Easy Jog – 10 min", "Dynamic stretches – 5 min"],
    main: [{ name: "400 m @ 2 km pace", reps: 6, rest: 15, speed: 14.7 }],
    mobility: [{ name: "Hip Flexor Stretch", duration: 60 }]
  },
  "Tuesday": {
    type: "Tempo",
    explain: "Comfortably hard sustained running to improve lactate threshold.",
    warmup: ["Easy Jog – 10 min"],
    main: [
      { name: "Tempo run", reps: 1, rest: 0, speed: 13.8 },
      { name: "100 m strides", reps: 3, rest: 60, speed: 16.0 }
    ],
    mobility: [{ name: "Hamstring Stretch", duration: 60 }]
  },
  "Wednesday": {
    type: "Recovery",
    explain: "Easy aerobic running to aid recovery and maintain efficiency.",
    warmup: ["Brisk walk – 5 min"],
    main: [{ name: "Easy run – 20 min", reps: 1, rest: 0, speed: 11.5 }],
    mobility: [{ name: "Full-body stretch", duration: 900 }]
  },
  "Thursday": {
    type: "VO₂ Max",
    explain: "Longer intervals slightly faster than race pace to improve oxygen uptake.",
    warmup: ["Easy Jog – 10 min"],
    main: [{ name: "500 m fast intervals", reps: 5, rest: 120, speed: 15.0 }],
    mobility: [{ name: "Quad Stretch", duration: 60 }]
  },
  "Friday": {
    type: "Endurance + Strides",
    explain: "Aerobic base work followed by fast but relaxed strides.",
    warmup: ["Easy Jog – 5–10 min"],
    main: [
      { name: "Long easy run", reps: 1, rest: 0, speed: 11.0 },
      { name: "Strides", reps: 4, rest: 90, speed: 16.5 }
    ],
    mobility: [{ name: "Foam roll", duration: 600 }]
  },
  "Saturday": {
    type: "Race Simulation",
    explain: "Broken race effort to rehearse pacing and fatigue control.",
    warmup: ["Easy Jog – 10 min"],
    main: [
      { name: "1 km steady", reps: 1, rest: 120, speed: 14.0 },
      { name: "500 m goal pace", reps: 1, rest: 120, speed: 14.7 },
      { name: "400 m fast", reps: 2, rest: 120, speed: 15.2 }
    ],
    mobility: [{ name: "Hip Flexor Stretch", duration: 60 }]
  }
};

// =======================
// DOM
// =======================
const daySelect = document.getElementById("daySelect");
const dayTitle = document.getElementById("dayTitle");
const warmupList = document.getElementById("warmupList");
const mainBlock = document.getElementById("mainBlock");
const mobilityList = document.getElementById("mobilityList");

// Populate selector
Object.keys(workouts).forEach(d => {
  const o = document.createElement("option");
  o.value = d;
  o.textContent = d;
  daySelect.appendChild(o);
});

// =======================
// FEEDBACK LOGIC
// =======================
function generateFeedback() {
  const entries = savedData.history.slice(-12);
  if (!entries.length) return "Complete a few sessions to unlock personalised feedback.";

  const hits = entries.filter(e => e.hit).length;
  const ratio = hits / entries.length;

  if (ratio > 0.8) return "You’re consistently hitting targets. Training is progressing well — stay controlled and confident.";
  if (ratio > 0.5) return "Mixed results this week. You’re on track — focus on pacing and relaxed form.";
  return "Recent sessions suggest fatigue. Paces have been adjusted to support recovery.";
}

// =======================
// RENDER DAY
// =======================
function renderDay(day) {
  const data = workouts[day];
  dayTitle.textContent = day;

  // Feedback card
  let feedback = document.getElementById("weeklyFeedback");
  if (!feedback) {
    feedback = document.createElement("div");
    feedback.id = "weeklyFeedback";
    feedback.className = "card";
    dayTitle.after(feedback);
  }
  feedback.innerHTML = `
    <div class="cardTitle">Weekly Feedback</div>
    <div class="muted">${generateFeedback()}</div>
  `;

  // Explanation card
  let explain = document.getElementById("workoutExplain");
  if (!explain) {
    explain = document.createElement("div");
    explain.id = "workoutExplain";
    explain.className = "card";
    feedback.after(explain);
  }
  explain.innerHTML = `
    <div class="cardTitle">${data.type}</div>
    <div class="muted">${data.explain}</div>
  `;

  // Warm-up
  warmupList.innerHTML = "";
  data.warmup.forEach(w => {
    const li = document.createElement("li");
    li.textContent = w;
    warmupList.appendChild(li);
  });

  // Main
  mainBlock.innerHTML = "";
  data.main.forEach((set, i) => {
    const row = document.createElement("div");
    row.className = "setRow";
    row.innerHTML = `
      <div class="setNum">${i + 1}</div>
      <div>${set.name}</div>
      <input class="pillInput" type="number" step="0.1" value="${set.speed}">
      <div>${set.reps}</div>
      <div>${set.rest ? formatTime(set.rest) : "—"}</div>
      <div class="restBox">${set.rest ? formatTime(set.rest) : "00:00"}</div>
      <div class="doneWrap"><input type="checkbox" class="done"></div>
    `;
    mainBlock.appendChild(row);

    const speedInput = row.querySelector("input");
    const check = row.querySelector(".done");

    check.addEventListener("change", () => {
      if (!check.checked) return;

      const hit = confirm("Did you hit the target speed?");
      savedData.history.push({ hit });
      save();

      speedInput.value = (parseFloat(speedInput.value) + (hit ? SPEED_STEP : -SPEED_STEP)).toFixed(1);
      beep.play();
    });
  });

  // Mobility
  mobilityList.innerHTML = "";
  data.mobility.forEach(m => {
    const div = document.createElement("div");
    div.className = "mobItem";
    div.innerHTML = `
      <div class="mobName">${m.name}</div>
      <div class="mobTimer">${formatTime(m.duration)}</div>
      <button class="mobBtn">Start</button>
      <div class="mobDone"><input type="checkbox" class="mobChk"></div>
    `;
    mobilityList.appendChild(div);

    const btn = div.querySelector(".mobBtn");
    const timer = div.querySelector(".mobTimer");
    let r = m.duration, t;

    btn.onclick = () => {
      if (t) {
        clearInterval(t);
        t = null;
        btn.textContent = "Start";
      } else {
        btn.textContent = "Pause";
        t = setInterval(() => {
          r--;
          timer.textContent = formatTime(r);
          if (r <= 0) {
            clearInterval(t);
            beep.play();
          }
        }, 1000);
      }
    };
  });
}

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// Init
renderDay(Object.keys(workouts)[0]);
daySelect.onchange = e => renderDay(e.target.value);
