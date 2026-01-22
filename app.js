document.addEventListener("DOMContentLoaded", () => {

  // -----------------------
  // 6-Day Training Plan
  // -----------------------
  const plan = {
    Monday: {
      title: "Intervals",
      explain: "Short, fast repetitions at 2 km pace to develop speed and running economy.",
      warmup: [
        "10 min easy jog",
        "Dynamic mobility (hips, calves, ankles)"
      ],
      main: [
        "6 × 400 m @ goal 2 km pace",
        "15–20 sec standing recovery between reps"
      ],
      mobility: [
        "Hip flexor stretch – 60 sec",
        "Calf stretch – 60 sec"
      ]
    },

    Tuesday: {
      title: "Tempo Run",
      explain: "Sustained controlled effort to improve lactate threshold and fatigue resistance.",
      warmup: [
        "10 min easy jog"
      ],
      main: [
        "20–25 min continuous tempo (comfortably hard)",
        "3 × 100 m relaxed strides"
      ],
      mobility: [
        "Hamstring stretch – 60 sec"
      ]
    },

    Wednesday: {
      title: "Recovery",
      explain: "Low intensity aerobic work to promote recovery and maintain form.",
      warmup: [
        "5 min brisk walk"
      ],
      main: [
        "20 min easy run or cross-training"
      ],
      mobility: [
        "Full body mobility flow – 10 min"
      ]
    },

    Thursday: {
      title: "VO₂ Max Intervals",
      explain: "Longer intervals slightly faster than race pace to increase aerobic capacity.",
      warmup: [
        "10 min easy jog",
        "Running drills"
      ],
      main: [
        "5 × 500 m slightly faster than goal pace",
        "2 min walking recovery"
      ],
      mobility: [
        "Quad stretch – 60 sec"
      ]
    },

    Friday: {
      title: "Endurance + Strides",
      explain: "Easy aerobic running with short speed exposure to improve mechanics.",
      warmup: [
        "5–10 min easy jog"
      ],
      main: [
        "30–40 min easy run",
        "4 × 100 m strides"
      ],
      mobility: [
        "Foam rolling – 10 min"
      ]
    },

    Saturday: {
      title: "Race Simulation",
      explain: "Broken race effort to practice pacing and finishing strong.",
      warmup: [
        "10 min easy jog"
      ],
      main: [
        "1 km slightly slower than goal pace",
        "2 min recovery",
        "500 m at goal pace",
        "2 × 400 m fast finish"
      ],
      mobility: [
        "Hip flexor stretch – 60 sec"
      ]
    }
  };

  // -----------------------
  // DOM Elements
  // -----------------------
  const daySelect = document.getElementById("daySelect");
  const dayTitle = document.getElementById("dayTitle");
  const warmupList = document.getElementById("warmupList");
  const mainBlock = document.getElementById("mainBlock");
  const mobilityList = document.getElementById("mobilityList");
  const dayCard = document.getElementById("dayCard");

  // -----------------------
  // Populate Day Selector
  // -----------------------
  daySelect.innerHTML = "";
  Object.keys(plan).forEach(day => {
    const opt = document.createElement("option");
    opt.value = day;
    opt.textContent = day;
    daySelect.appendChild(opt);
  });

  // -----------------------
  // Render Day
  // -----------------------
  function renderDay(day) {
    const data = plan[day];
    dayTitle.textContent = day;

    // Remove old explanation
    dayCard.querySelectorAll(".explainCard").forEach(e => e.remove());

    // Explanation card
    const explainCard = document.createElement("div");
    explainCard.className = "card explainCard";
    explainCard.innerHTML = `
      <div class="cardTitle">${data.title}</div>
      <div class="muted">${data.explain}</div>
    `;
    dayCard.insertBefore(explainCard, warmupList.parentElement);

    // Warm-up
    warmupList.innerHTML = "";
    data.warmup.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      warmupList.appendChild(li);
    });

    // Main workout
    mainBlock.innerHTML = "";
    data.main.forEach(step => {
      const p = document.createElement("p");
      p.textContent = step;
      mainBlock.appendChild(p);
    });

    // Mobility
    mobilityList.innerHTML = "";
    data.mobility.forEach(item => {
      const div = document.createElement("div");
      div.textContent = item;
      mobilityList.appendChild(div);
    });
  }

  // Init
  renderDay("Monday");
  daySelect.addEventListener("change", e => renderDay(e.target.value));

});
