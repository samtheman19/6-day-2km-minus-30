// =======================
// CONFIG
// =======================
const SPEED_STEP = 0.1; // km/h progression
const STORAGE_KEY = "runProgress_v1";

// Audio
const beep = new Audio(
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA="
);

// =======================
// LOAD SAVED DATA
// =======================
let savedData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

// =======================
// BASE WORKOUT PLAN
// =======================
const workouts = {
  "Day 1": {
    warmup: ["Easy Jog – 10 min", "Dynamic stretches – 5 min"],
    main: [
      { name: "400 m intervals", reps: 6, rest: 15, speed: 14.7 }
    ],
    mobility: [{ name: "Hip Flexor Stretch", duration: 60 }]
  },

  "Day 2": {
    warmup: ["Easy Jog – 10 min"],
    main: [
      { name: "Tempo run", reps: 1, rest: 0, speed: 13.8 },
      { name: "100 m strides", reps: 3, rest: 60, speed: 16.0 }
    ],
    mobility: [{ name: "Hamstring Stretch", duration: 60 }]
  },

  "Day 3": {
    warmup: ["Brisk walk – 5 min"],
    main: [
      { name: "Easy run – 20 min", reps: 1, rest: 0, speed: 11.5 }
    ],
    mobility: [{ name: "Full-body stretch", duration: 900 }]
  },

  "Day 4": {
    warmup: ["Easy Jog – 10 min"],
    main: [
      { name: "500 m fast intervals", reps: 5, rest: 120, speed: 15.0 }
    ],
    mobility: [{ name: "Quad Stretch", duration: 60 }]
  },

  "Day 5": {
    warmup: ["Easy Jog – 5–10 min"],
    main: [
      { name: "Long easy run", reps: 1, rest: 0, speed: 11.0 },
      { name: "Strides", reps: 4, rest: 90, speed: 16.5 }
    ],
    mobility: [{ name: "Foam roll", duration: 600 }]
  },

  "Day 6": {
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
// DOM REFS
// =======================
const daySelect = document.getElementById("daySelect");
const dayTitle = document.getElementById("dayTitle");
const warmupList = document.getElementById("warmupList");
const mainBlock = document.getElementById("mainBlock");
const mobilityList = document.getElementById("mobilityList");

// =======================
// INIT DAY SELECTOR
// =======================
Object.keys(workouts).forEach(d => {
  const o = document.createElement("option");
  o.value = d;
  o.textContent = d;
  daySelect.appendChild(o);
});

// =======================
// RENDER DAY
// =======================
function renderDay(day) {
  const data = workouts[day];
  const dayKey = day;

  dayTitle.textContent = day;
  warmupList.innerHTML = "";
  mainBlock.innerHTML = "";
  mobilityList.innerHTML = "";

  data.warmup.forEach(w => {
    const li = document.createElement("li");
    li.textContent = w;
    warmupList.appendChild(li);
  });

  data.main.forEach((set, idx) => {
    const storeKey = `${dayKey}_${idx}`;
    const saved = savedData[storeKey] || { speed: set.speed };

    const row = document.createElement("div");
    row.className = "setRow";

    row.innerHTML = `
      <div class="setNum">${idx + 1}</div>
      <div>${set.name}</div>
      <input class="pillInput" type="number" step="0.1" value="${saved.speed}">
      <div>${set.reps}</div>
      <div>${set.rest ? formatTime(set.rest) : "—"}</div>
      <div class="restBox">${set.rest ? formatTime(set.rest) : "00:00"}</div>
      <div class="doneWrap">
        <input type="checkbox" class="done">
      </div>
    `;

    mainBlock.appendChild(row);

    const speedInput = row.querySelector("input");
    const checkbox = row.querySelector(".done");
    const restBox = row.querySelector(".restBox");

    speedInput.addEventListener("change", () => {
      saved.speed = parseFloat(speedInput.value);
      savedData[storeKey] = saved;
      save();
    });

    if (set.rest > 0) {
      checkbox.addEventListener("change", () => {
        if (!checkbox.checked) return;

        beep.play();
        let remaining = set.rest;
        restBox.textContent = formatTime(remaining);

        const timer = setInterval(() => {
          remaining--;
          restBox.textContent = formatTime(remaining);
          if (remaining <= 0) {
            clearInterval(timer);
            beep.play();
          }
        }, 1000);
      });
    }

    checkbox.addEventListener("change", () => {
      if (!checkbox.checked) return;

      const hit = confirm("Did you hit the target speed?");
      saved.speed += hit ? SPEED_STEP : -SPEED_STEP;
      saved.speed = Math.max(8, Math.min(saved.speed, 20));
      savedData[storeKey] = saved;
      save();
    });
  });

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
    const timerEl = div.querySelector(".mobTimer");

    let rem = m.duration;
    let int = null;

    btn.onclick = () => {
      if (int) {
        clearInterval(int);
        int = null;
        btn.textContent = "Start";
      } else {
        btn.textContent = "Pause";
        int = setInterval(() => {
          rem--;
          timerEl.textContent = formatTime(rem);
          if (rem <= 0) {
            clearInterval(int);
            beep.play();
          }
        }, 1000);
      }
    };
  });
}

// =======================
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
}

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// =======================
renderDay(Object.keys(workouts)[0]);
daySelect.onchange = e => renderDay(e.target.value);
