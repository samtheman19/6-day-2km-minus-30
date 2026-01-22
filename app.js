document.addEventListener("DOMContentLoaded", () => {

  // ======================
  // CONFIG
  // ======================
  const SPEED_STEP = 0.1;
  const STORAGE_KEY = "runProgress_v3";

  const beep = new Audio(
    "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA="
  );

  let savedData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { history: [] };

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
  }

  // ======================
  // WORKOUT PLAN
  // ======================
  const workouts = {
    "Monday": {
      type: "Intervals",
      explain: "Short, hard efforts at race pace with minimal recovery. Focus on relaxed speed and consistent splits.",
      warmup: ["Easy jog – 10 min", "Dynamic stretches – 5 min"],
      main: [{ name: "400 m @ 2 km pace", reps: 6, rest: 15, speed: 14.7 }],
      mobility: [{ name: "Hip flexor stretch", duration: 60 }]
    },

    "Tuesday": {
      type: "Tempo",
      explain: "A controlled but challenging sustained run to improve lactate threshold.",
      warmup: ["Easy jog – 10 min"],
      main: [
        { name: "Tempo run", reps: 1, rest: 0, speed: 13.8 },
        { name: "100 m strides", reps: 3, rest: 60, speed: 16.0 }
      ],
      mobility: [{ name: "Hamstring stretch", duration: 60 }]
    },

    "Wednesday": {
      type: "Recovery",
      explain: "Low intensity running to promote recovery and reinforce good mechanics.",
      warmup: ["Brisk walk – 5 min"],
      main: [{ name: "Easy run – 20 min", reps: 1, rest: 0, speed: 11.5 }],
      mobility: [{ name: "Full body stretch", duration: 900 }]
    },

    "Thursday": {
      type: "VO₂ Max",
      explain: "Longer intervals slightly faster than race pace to increase aerobic power.",
      warmup: ["Easy jog – 10 min"],
      main: [{ name: "500 m fast intervals", reps: 5, rest: 120, speed: 15.0 }],
      mobility: [{ name: "Quad stretch", duration: 60 }]
    },

    "Friday": {
      type: "Endurance + Strides",
      explain: "Easy aerobic running followed by relaxed fast strides.",
      warmup: ["Easy jog – 5–10 min"],
      main: [
        { name: "Long easy run", reps: 1, rest: 0, speed: 11.0 },
        { name: "Strides", reps: 4, rest: 90, speed: 16.5 }
      ],
      mobility: [{ name: "Foam roll", duration: 600 }]
    },

    "Saturday": {
      type: "Race Simulation",
      explain: "Broken race effort to rehearse pacing and fatigue management.",
      warmup: ["Easy jog – 10 min"],
      main: [
        { name: "1 km steady", reps: 1, rest: 120, speed: 14.0 },
        { name: "500 m goal pace", reps: 1, rest: 120, speed: 14.7 },
        { name: "400 m fast", reps: 2, rest: 120, speed: 15.2 }
      ],
      mobility: [{ name: "Hip flexor stretch", duration: 60 }]
    }
  };

  // ======================
  // DOM
  // ======================
  const daySelect = document.getElementById("daySelect");
  const dayTitle = document.getElementById("dayTitle");
  const dayCard = document.getElementById("dayCard");
  const warmupList = document.getElementById("warmupList");
  const mainBlock = document.getElementById("mainBlock");
  const mobilityList = document.getElementById("mobilityList");

  // ======================
  // Populate selector
  // ======================
  daySelect.innerHTML = "";
  Object.keys(workouts).forEach(day => {
    const opt = document.createElement("option");
    opt.value = day;
    opt.textContent = day;
    daySelect.appendChild(opt);
  });

  // ======================
  // Feedback logic
  // ======================
  function weeklyFeedback() {
    const last = savedData.history.slice(-10);
    if (!last.length) return "Complete sessions to unlock personalised feedback.";

    const hits = last.filter(x => x.hit).length / last.length;
    if (hits > 0.8) return "You are consistently hitting target pace. Progress is on track.";
    if (hits > 0.5) return "Mixed results this week. Stay controlled and focus on form.";
    return "Fatigue detected. Paces have been adjusted to protect recovery.";
  }

  // ======================
  // Render day
  // ======================
  function renderDay(day) {
    const data = workouts[day];
    dayTitle.textContent = day;

    // Remove old info cards
    dayCard.querySelectorAll(".infoCard").forEach(el => el.remove());

    // Weekly feedback
    const feedback = document.createElement("div");
    feedback.className = "card infoCard";
    feedback.innerHTML = `
      <div class="cardTitle">Weekly Feedback</div>
      <div class="muted">${weeklyFeedback()}</div>
    `;

    // Explanation
    const explain = document.createElement("div");
    explain.className = "card infoCard";
    explain.innerHTML = `
      <div class="cardTitle">${data.type}</div>
      <div class="muted">${data.explain}</div>
    `;

    dayCard.insertBefore(feedback, warmupList.parentElement);
    dayCard.insertBefore(explain, warmupList.parentElement);

    // Warm-up
    warmupList.innerHTML = "";
    data.warmup.forEach(w => {
      const li = document.createElement("li");
      li.textContent = w;
      warmupList.appendChild(li);
    });

    // Main sets
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

      const checkbox = row.querySelector(".done");
      checkbox.addEventListener("change", () => {
        if (!checkbox.checked) return;
        const hit = confirm("Did you hit the target speed?");
        savedData.history.push({ hit });
        save();
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
    });
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  // Init
  renderDay(Object.keys(workouts)[0]);
  daySelect.addEventListener("change", e => renderDay(e.target.value));
});
