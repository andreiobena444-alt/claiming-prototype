const EVENT_PREFIX = "sample_event_";
const todayKey = EVENT_PREFIX + new Date().toISOString().split("T")[0];

const colors = ["#e74c3c","#3498db","#2ecc71","#f1c40f","#9b59b6"]; // animated colors
let colorIndex = 0;
let colorInterval;

const statusEl = document.getElementById("status");
const infoEl = document.getElementById("info");
const claimBtn = document.getElementById("claimBtn");
const exportBtn = document.getElementById("exportBtn");

claimBtn.addEventListener("click", claimSample);
exportBtn.addEventListener("click", exportCSV);

function claimSample() {
  if (localStorage.getItem(todayKey)) {
    showAlreadyClaimed();
    return;
  }

  const now = new Date();
  const claimData = {
    date: now.toISOString().split("T")[0],
    time: now.toISOString(),
    hour: now.getHours()
  };

  localStorage.setItem(todayKey, JSON.stringify(claimData));
  showConfirmation(claimData);
}

function loadPage() {
  const data = localStorage.getItem(todayKey);
  if (data) {
    showConfirmation(JSON.parse(data));
  }
}

function showConfirmation(data) {
  claimBtn.style.display = "none";
  exportBtn.style.display = "inline-block";

  infoEl.innerHTML = `
    Date: ${data.date}<br>
    Time: ${new Date(data.time).toLocaleTimeString()}<br>
    Valid hour: ${data.hour}:00 – ${data.hour + 1}:00<br>
    <small>Screenshots not accepted</small>
  `;

  statusEl.textContent = "✅ SAMPLE CLAIMED";

  // Start animated hour color
  colorIndex = data.hour % colors.length;
  statusEl.style.color = colors[colorIndex];
  if (colorInterval) clearInterval(colorInterval);

  colorInterval = setInterval(() => {
    colorIndex = (colorIndex + 1) % colors.length;
    statusEl.style.color = colors[colorIndex];
  }, 1000); // changes every second for staff verification
}

function showAlreadyClaimed() {
  claimBtn.style.display = "none";
  exportBtn.style.display = "inline-block";

  statusEl.textContent = "❌ Already claimed";
  infoEl.innerHTML = "One sample per device per day";
  if (colorInterval) clearInterval(colorInterval);
}

function exportCSV() {
  let rows = [["date","time","hour"]];
  for (let key in localStorage) {
    if (key.startsWith(EVENT_PREFIX)) {
      const data = JSON.parse(localStorage.getItem(key));
      rows.push([data.date, data.time, data.hour]);
    }
  }

  let csv = rows.map(r => r.join(",")).join("\n");
  let blob = new Blob([csv], { type: "text/csv" });
  let url = URL.createObjectURL(blob);

  let a = document.createElement("a");
  a.href = url;
  a.download = "sample_claims.csv";
  a.click();
}

window.addEventListener("load", loadPage);
