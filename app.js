document.addEventListener("DOMContentLoaded", () => {

  // ----------------------
  // Config & Storage
  // ----------------------
  const SPEED_STEP = 0.1;
  const STORAGE_KEY = "runPlan_v3";
  const beep = new Audio(
    "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA="
  );

  let savedData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { history: []};

  function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
  }

  // ----------------------
  // Workout Plan
  // ----------------------
  const workouts = {
    "Monday": {
      type: "Intervals",
      explain: "Short, high-intensity intervals to improve race pace speed and VO₂ max.",
      warmup: ["Easy jog – 10 min", "Dynamic stretches – 5 min"],
      main: [{ name: "400 m @ 2 km pace", reps: 6, rest: 15 }],
      mobility: [{ name: "Hip flexor stretch", duration: 60 }]
    },
    "Tuesday": {
      type: "Tempo Run",
      explain: "Sustained, comfortably hard pace to raise lactate threshold.",
      warmup: ["Easy jog – 10 min"],
      main: [
        { name: "Tempo run (20–25 min)", reps: 1, rest: 0 },
        { name: "100 m strides", reps: 3, rest: 60 }
      ],
      mobility: [{ name: "Hamstring stretch", duration: 60 }]
    },
    "Wednesday": {
      type: "Active Recovery",
      explain: "Easy run or mobility to aid recovery and maintain form.",
      warmup: ["Brisk walk – 5 min"],
      main: [{ name: "Easy run – 20 min", reps: 1, rest: 0 }],
      mobility: [{ name: "Full body stretch", duration: 900 }]
    },
    "Thursday": {
      type: "VO₂ Max Intervals",
      explain: "Longer intervals slightly faster than race pace to boost aerobic power.",
      warmup: ["Easy jog – 10 min"],
      main: [{ name: "500 m fast intervals", reps: 5, rest: 120 }],
      mobility: [{ name: "Quad stretch", duration: 60 }]
    },
    "Friday": {
      type: "Endurance + Strides",
      explain: "Aerobic base run followed by strides for mechanics and speed.",
      warmup: ["Easy jog – 5–10 min"],
      main: [
        { name: "Long easy run", reps: 1, rest: 0 },
        { name: "Strides", reps: 4, rest: 90 }
      ],
      mobility: [{ name: "Foam roll", duration: 600 }]
    },
    "Saturday": {
      type: "Race Simulation",
      explain: "Broken race-pace runs to rehearse pacing and fatigue control.",
      warmup: ["Easy jog – 10 min"],
      main: [
        { name: "1 km steady", reps: 1, rest: 120 },
        { name: "500 m goal pace", reps: 1, rest: 120 },
        { name: "400 m fast", reps: 2, rest: 120 }
      ],
      mobility: [{ name: "Hip flexor stretch", duration: 60 }]
    }
  };

  // ----------------------
  // DOM Elements
  // ----------------------
  const daySelect = document.getElementById("daySelect");
  const dayTitle = document.getElementById("dayTitle");
  const warmupList = document.getElementById("warmupList");
  const mainBlock = document.getElementById("mainBlock");
  const mobilityList = document.getElementById("mobilityList");
  const dayCard = document.getElementById("dayCard");

  // ----------------------
  // Populate Day Selector
  // ----------------------
  daySelect.innerHTML = "";
  Object.keys(workouts).forEach(day => {
    const opt = document.createElement("option");
    opt.value = day;
    opt.textContent = day;
    daySelect.appendChild(opt);
  });

  // ----------------------
  // Weekly Feedback
  // ----------------------
  function getWeeklyFeedback() {
    const recent = savedData.history.slice(-10);
    if (!recent.length) return "Complete a few sessions to unlock feedback.";
    const hits = recent.filter(x => x.hit).length / recent.length;
    if (hits > 0.8) return "You’re consistently hitting targets and progressing well.";
    if (hits > 0.5) return "Mixed results this week — focus on consistent pacing.";
    return "Recent sessions suggest fatigue. Paces have been adjusted for safety.";
  }

  // ----------------------
  // Render a Day
  // ----------------------
  function renderDay(day) {

    const w = workouts[day];
    dayTitle.textContent = day;

    // Remove old intro / feedback
    dayCard.querySelectorAll(".infoCard").forEach(c => c.remove());

    // Weekly Feedback Card
    const feedbackCard = document.createElement("div");
    feedbackCard.className = "card infoCard";
    feedbackCard.innerHTML = `
      <div class="cardTitle">Weekly Feedback</div>
      <div class="muted">${getWeeklyFeedback()}</div>
    `;
    dayCard.insertBefore(feedbackCard, warmupList.parentElement);

    // Workout Explanation Card
    const explainCard = document.createElement("div");
    explainCard.className = "card infoCard";
    explainCard.innerHTML = `
      <div class="cardTitle">${w.type}</div>
      <div class="muted">${w.explain}</div>
    `;
    dayCard.insertBefore(explainCard, warmupList.parentElement);

    // Warm-up
    warmupList.innerHTML = "";
    w.warmup.forEach(u => {
      const li = document.createElement("li");
      li.textContent = u;
      warmupList.appendChild(li);
    });

    // Main Sets
    mainBlock.innerHTML = "";
    w.main.forEach((set, idx) => {
      const row = document.createElement("div");
      row.className = "setRow";
      row.innerHTML = `
        <div class="setNum">${idx + 1}</div>
        <div>${set.name}</div>
        <div>${set.reps}</div>
        <div>${set.rest ? formatTime(set.rest) : "—"}</div>
        <div></div>
        <div class="restBox">${set.rest ? formatTime(set.rest) : "00:00"}</div>
        <div class="doneWrap"><input type="checkbox" class="done"></div>
      `;
      mainBlock.appendChild(row);

      const checkbox = row.querySelector(".done");
      checkbox.addEventListener("change", () => {
        if (!checkbox.checked) return;
        const hit = confirm("Did you hit target pace?");
        savedData.history.push({ day, set: set.name, hit });
        saveData();
        beep.play();
      });
    });

    // Mobility
    mobilityList.innerHTML = "";
    w.mobility.forEach(m => {
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

  // ----------------------
  // Time Formatter
  // ----------------------
  function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  // ----------------------
  // Init
  // ----------------------
  renderDay(Object.keys(workouts)[0]);
  daySelect.addEventListener("change", e => renderDay(e.target.value));

});
