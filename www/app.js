
const API_BASE = "https://YOUR-SERVER-DOMAIN.example";

const $ = (id) => document.getElementById(id);

let connected = false;
let runs = 0;
let historyItems = [];

async function connectServer() {
  connected = false;
  $("sampleBtn").disabled = true;
  $("serverText").textContent = "Connecting...";
  $("serverDetail").textContent = "Checking remote server";
  $("serverBar").style.width = "30%";
  $("connection").className = "connection";
  $("connection").innerHTML = '<span class="dot"></span> CONNECTING';

  if (!navigator.onLine) {
    showOffline();
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/health`, {
      method: "GET",
      cache: "no-store"
    });

    if (!response.ok) throw new Error("Server error");

    const data = await response.json();

    if (data.status !== "ok") throw new Error("Not ready");

    connected = true;
    $("serverText").textContent = "Server Connected";
    $("serverDetail").textContent = "Remote service is responding";
    $("serverBar").style.width = "100%";
    $("connection").className = "connection online";
    $("connection").innerHTML = '<span class="dot"></span> ONLINE';
    $("sampleBtn").disabled = false;
    $("session").textContent = "ACTIVE";
    $("offlineScreen").classList.add("hidden");
  } catch (error) {
    showOffline();
  }
}

function showOffline() {
  connected = false;
  $("sampleBtn").disabled = true;
  $("serverText").textContent = "Server Unavailable";
  $("serverDetail").textContent = "Check your internet or server";
  $("serverBar").style.width = "0%";
  $("connection").className = "connection offline";
  $("connection").innerHTML = '<span class="dot"></span> OFFLINE';
  $("session").textContent = "LOCKED";
  $("offlineScreen").classList.remove("hidden");
}

async function generateSample() {
  if (!connected || !navigator.onLine) {
    showOffline();
    return;
  }

  $("sampleBtn").disabled = true;
  $("sampleBtn").textContent = "GENERATING...";

  try {
    // Demo-only sample; not a forecast.
    const response = await fetch(`${API_BASE}/demo/sample`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ mode: "demo" })
    });

    if (!response.ok) throw new Error("Sample endpoint failed");

    const data = await response.json();

    if (typeof data.value !== "number") {
      throw new Error("Invalid sample");
    }

    runs++;
    $("sampleValue").textContent = data.value;
    $("sampleTag").textContent = "SAMPLE GENERATED";
    $("sampleInfo").textContent = "Random demo sample only.";

    $("runs").textContent = runs;

    historyItems.unshift({
      value: data.value,
      time: new Date().toLocaleTimeString()
    });

    historyItems = historyItems.slice(0, 15);
    renderHistory();
  } catch (error) {
    showOffline();
  }

  $("sampleBtn").disabled = !connected;
  $("sampleBtn").textContent = "GENERATE SAMPLE";
}

function renderHistory() {
  const history = $("history");

  if (!historyItems.length) {
    history.innerHTML = '<div class="empty">No activity available</div>';
    return;
  }

  history.innerHTML = historyItems.map(item => `
    <div class="history-row">
      <div>
        <strong>Sample ${item.value}</strong>
        <small>Generated</small>
      </div>
      <small>${item.time}</small>
    </div>
  `).join("");
}

function clearHistory() {
  historyItems = [];
  runs = 0;
  $("runs").textContent = "0";
  $("sampleValue").textContent = "--";
  $("sampleTag").textContent = "READY";
  $("sampleInfo").textContent = "Connected users can run a demo sample.";
  renderHistory();
}

$("sampleBtn").addEventListener("click", generateSample);
$("clearBtn").addEventListener("click", clearHistory);
$("retryBtn").addEventListener("click", connectServer);
$("offlineRetry").addEventListener("click", connectServer);

window.addEventListener("online", connectServer);
window.addEventListener("offline", showOffline);

connectServer();
setInterval(connectServer, 60000);
