document.addEventListener("DOMContentLoaded", () => {
  const daySelect = document.getElementById("daySelect");
  const dayTitle = document.getElementById("dayTitle");

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  days.forEach(d => {
    const o = document.createElement("option");
    o.textContent = d;
    daySelect.appendChild(o);
  });

  dayTitle.textContent = days[0];

  console.log("APP JS LOADED CORRECTLY");
});
