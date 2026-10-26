
"use strict";

// ==========================================
// 1. DOM HELPERS AND INITIAL SENSOR DATA
// ==========================================

const $ = id => document.getElementById(id);

const demo = {
  moisture_raw: 2470,
  moisture_percent: 35,
  temperature: 27.8,
  humidity: 54.2,
  point: "A"
};

let current = { ...demo };

let points = [
  { name: "A", moisture: 35, temp: 27.8, saved: true },
  { name: "B", moisture: 42, temp: 28.4, saved: true },
  { name: "C", moisture: 29, temp: 29.1, saved: true },
  { name: "D", moisture: null, temp: null, saved: false }
];

// ==========================================
// 2. MOISTURE STATUS
// ==========================================

function moistureStatus(value) {
  if (!Number.isFinite(value)) {
    return ["Unavailable", "No valid soil moisture reading."];
  }

  if (value < 25) {
    return [
      "Low",
      "Soil may be dry. Check root-zone moisture and crop needs before watering."
    ];
  }

  if (value < 45) {
    return [
      "Moderate-low",
      "Compare readings at other points and check crop water needs."
    ];
  }

  if (value <= 75) {
    return [
      "Moderate",
      "Middle range for this prototype; actual crop requirements vary."
    ];
  }

  return [
    "High",
    "Check drainage; suitable moisture levels vary by crop."
  ];
}

// ==========================================
// 3. CROP DATABASE
// Target values are provisional prototype values,
// not scientifically validated crop requirements.
// ==========================================

const cropDatabase = [
  // Cereals and millets
  {name:"Rice",emoji:"🌾",targetM:75,targetT:28,category:"Cereal"},
  {name:"Wheat",emoji:"🌾",targetM:40,targetT:22,category:"Cereal"},
  {name:"Maize",emoji:"🌽",targetM:48,targetT:30,category:"Cereal"},
  {name:"Pearl Millet (Bajra)",emoji:"🌾",targetM:30,targetT:31,category:"Millet"},
  {name:"Sorghum (Jowar)",emoji:"🌾",targetM:32,targetT:30,category:"Millet"},
  {name:"Finger Millet (Ragi)",emoji:"🌾",targetM:40,targetT:25,category:"Millet"},
  {name:"Foxtail Millet",emoji:"🌾",targetM:30,targetT:28,category:"Millet"},
  {name:"Little Millet",emoji:"🌾",targetM:30,targetT:27,category:"Millet"},
  {name:"Kodo Millet",emoji:"🌾",targetM:30,targetT:28,category:"Millet"},
  {name:"Proso Millet",emoji:"🌾",targetM:28,targetT:27,category:"Millet"},
  {name:"Barnyard Millet",emoji:"🌾",targetM:35,targetT:25,category:"Millet"},
  {name:"Barley",emoji:"🌾",targetM:35,targetT:20,category:"Cereal"},
  {name:"Oats",emoji:"🌾",targetM:45,targetT:18,category:"Cereal"},

  // Pulses and legumes
  {name:"Chickpea (Chana)",emoji:"🫘",targetM:30,targetT:23,category:"Pulse"},
  {name:"Pigeon Pea (Tur)",emoji:"🫘",targetM:35,targetT:29,category:"Pulse"},
  {name:"Green Gram (Moong)",emoji:"🫘",targetM:35,targetT:29,category:"Pulse"},
  {name:"Black Gram (Urad)",emoji:"🫘",targetM:40,targetT:28,category:"Pulse"},
  {name:"Lentil (Masoor)",emoji:"🫘",targetM:35,targetT:20,category:"Pulse"},
  {name:"Field Pea",emoji:"🫛",targetM:40,targetT:18,category:"Pulse"},
  {name:"Cowpea (Lobia)",emoji:"🫘",targetM:35,targetT:29,category:"Pulse"},
  {name:"Horse Gram",emoji:"🫘",targetM:30,targetT:27,category:"Pulse"},
  {name:"Moth Bean",emoji:"🫘",targetM:25,targetT:30,category:"Pulse"},
  {name:"Soybean",emoji:"🫘",targetM:52,targetT:27,category:"Oilseed/Pulse"},

  // Oilseeds
  {name:"Groundnut",emoji:"🥜",targetM:40,targetT:29,category:"Oilseed"},
  {name:"Mustard",emoji:"🌼",targetM:35,targetT:20,category:"Oilseed"},
  {name:"Sunflower",emoji:"🌻",targetM:40,targetT:25,category:"Oilseed"},
  {name:"Sesame (Til)",emoji:"🌱",targetM:30,targetT:29,category:"Oilseed"},
  {name:"Safflower (Kusum)",emoji:"🌼",targetM:30,targetT:23,category:"Oilseed"},
  {name:"Linseed (Flax)",emoji:"🌱",targetM:35,targetT:20,category:"Oilseed"},
  {name:"Castor",emoji:"🌿",targetM:30,targetT:29,category:"Oilseed"},

  // Commercial and fibre crops
  {name:"Cotton",emoji:"🌼",targetM:35,targetT:30,category:"Cash crop"},
  {name:"Sugarcane",emoji:"🎋",targetM:70,targetT:28,category:"Cash crop"},
  {name:"Jute",emoji:"🌿",targetM:70,targetT:28,category:"Fibre crop"},
  {name:"Tobacco",emoji:"🌿",targetM:35,targetT:25,category:"Cash crop"},

  // Vegetables
  {name:"Tomato",emoji:"🍅",targetM:50,targetT:24,category:"Vegetable"},
  {name:"Potato",emoji:"🥔",targetM:50,targetT:18,category:"Vegetable"},
  {name:"Onion",emoji:"🧅",targetM:40,targetT:24,category:"Vegetable"},
  {name:"Garlic",emoji:"🧄",targetM:35,targetT:18,category:"Vegetable"},
  {name:"Green Chilli",emoji:"🌶️",targetM:45,targetT:27,category:"Vegetable"},
  {name:"Brinjal (Eggplant)",emoji:"🍆",targetM:50,targetT:27,category:"Vegetable"},
  {name:"Okra (Bhindi)",emoji:"🌿",targetM:40,targetT:28,category:"Vegetable"},
  {name:"Cabbage",emoji:"🥬",targetM:50,targetT:18,category:"Vegetable"},
  {name:"Cauliflower",emoji:"🥦",targetM:50,targetT:18,category:"Vegetable"},
  {name:"Spinach",emoji:"🥬",targetM:50,targetT:18,category:"Vegetable"},
  {name:"Cucumber",emoji:"🥒",targetM:55,targetT:27,category:"Vegetable"},
  {name:"Pumpkin",emoji:"🎃",targetM:45,targetT:26,category:"Vegetable"},
  {name:"Bitter Gourd",emoji:"🌿",targetM:45,targetT:27,category:"Vegetable"},
  {name:"Bottle Gourd",emoji:"🌿",targetM:50,targetT:27,category:"Vegetable"},
  {name:"Carrot",emoji:"🥕",targetM:45,targetT:18,category:"Vegetable"},
  {name:"Radish",emoji:"🌱",targetM:40,targetT:18,category:"Vegetable"},
  {name:"Beetroot",emoji:"🌱",targetM:40,targetT:18,category:"Vegetable"},
  {name:"Sweet Potato",emoji:"🍠",targetM:45,targetT:25,category:"Vegetable"},
  {name:"Tapioca (Cassava)",emoji:"🌱",targetM:35,targetT:27,category:"Root crop"},

  // Fruits
  {name:"Banana",emoji:"🍌",targetM:65,targetT:27,category:"Fruit"},
  {name:"Mango",emoji:"🥭",targetM:35,targetT:28,category:"Fruit"},
  {name:"Sweet Orange",emoji:"🍊",targetM:45,targetT:25,category:"Fruit"},
  {name:"Lemon",emoji:"🍋",targetM:40,targetT:25,category:"Fruit"},
  {name:"Guava",emoji:"🍈",targetM:40,targetT:26,category:"Fruit"},
  {name:"Papaya",emoji:"🍈",targetM:55,targetT:27,category:"Fruit"},
  {name:"Pomegranate",emoji:"🍎",targetM:30,targetT:26,category:"Fruit"},
  {name:"Grapes",emoji:"🍇",targetM:35,targetT:24,category:"Fruit"},
  {name:"Watermelon",emoji:"🍉",targetM:40,targetT:28,category:"Fruit"},
  {name:"Muskmelon",emoji:"🍈",targetM:35,targetT:27,category:"Fruit"},
  {name:"Apple",emoji:"🍎",targetM:45,targetT:15,category:"Fruit"},
  {name:"Coconut",emoji:"🥥",targetM:65,targetT:27,category:"Plantation crop"},

  // Spices and condiments
  {name:"Turmeric",emoji:"🌿",targetM:65,targetT:27,category:"Spice"},
  {name:"Ginger",emoji:"🌿",targetM:65,targetT:25,category:"Spice"},
  {name:"Coriander",emoji:"🌿",targetM:35,targetT:20,category:"Spice"},
  {name:"Cumin (Jeera)",emoji:"🌿",targetM:25,targetT:22,category:"Spice"},
  {name:"Fennel (Saunf)",emoji:"🌿",targetM:35,targetT:22,category:"Spice"},
  {name:"Fenugreek (Methi)",emoji:"🌿",targetM:35,targetT:20,category:"Spice"},
  {name:"Black Pepper",emoji:"🌿",targetM:70,targetT:27,category:"Spice"}
];

// ==========================================
// 4. CROP MATCH SCORE
// This is a prototype score, not a real-world
// prediction of crop suitability.
// ==========================================

function score(m, t, targetM, targetT) {
  if (!Number.isFinite(m) || !Number.isFinite(t)) {
    return 0;
  }

  const moistureScore = Math.max(
    0,
    100 - Math.abs(m - targetM) * 1.5
  );

  const temperatureScore = Math.max(
    0,
    100 - Math.abs(t - targetT) * 9
  );

  return Math.round(
    moistureScore * 0.65 +
    temperatureScore * 0.35
  );
}

// ==========================================
// 5. MAIN DASHBOARD RENDER FUNCTION
// ==========================================

function render() {
  const m = Number(current.moisture_percent);
  const t = Number(current.temperature);
  const h = Number(current.humidity);

  // Sensor cards
  $("moisture").textContent =
    Number.isFinite(m) ? Math.round(m) : "--";

  $("temp").textContent =
    Number.isFinite(t) ? t.toFixed(1) : "--";

  $("humidity").textContent =
    Number.isFinite(h) ? h.toFixed(1) : "--";

  $("moistureNote").textContent =
    Number.isFinite(m) ? moistureStatus(m)[0] : "Unavailable";

  $("moistureBar").style.width =
    `${Math.max(0, Math.min(100, Number.isFinite(m) ? m : 0))}%`;

  $("tempBar").style.width =
    `${Math.max(0, Math.min(100, Number.isFinite(t) ? t * 2 : 0))}%`;

  $("humidityBar").style.width =
    `${Math.max(0, Math.min(100, Number.isFinite(h) ? h : 0))}%`;

  // Calculate and rank all crops
  const cropData = cropDatabase
    .map(c => ({
      ...c,
      score: score(m, t, c.targetM, c.targetT)
    }))
    .sort((a, b) => b.score - a.score);

  // Display all crop suggestions
  $("crops").innerHTML = cropData.map(c => `
    <div class="crop">
      <div class="cropicon">${c.emoji}</div>
      <div>
        <b>${c.name}</b>
        <p>${c.category} — preliminary match based on moisture
        and temperature only. Check local growing conditions.</p>
      </div>
      <div class="score">
        ${c.score}%
        <small>prototype match</small>
      </div>
    </div>
  `).join("");

  // Summary cards
  const summary = [
    [
      "💧",
      "Soil moisture",
      Number.isFinite(m)
        ? `${moistureStatus(m)[0]} (${Math.round(m)}% on the sensor's calibrated scale). ${moistureStatus(m)[1]}`
        : "Waiting for a valid reading."
    ],
    [
      "🌡️",
      "Temperature",
      Number.isFinite(t)
        ? `${t.toFixed(1)}°C air temperature. Compare with local seasonal guidance.`
        : "Waiting for a valid reading."
    ],
    [
      "☁️",
      "Air humidity",
      Number.isFinite(h)
        ? `${h.toFixed(1)}% relative humidity; this is not soil moisture.`
        : "Waiting for a valid reading."
    ],
    [
      "🧪",
      "Soil pH",
      "Not measured. A compatible pH sensor or laboratory soil test is needed."
    ]
  ];

  $("summary").innerHTML = summary.map(item => `
    <div class="summary">
      <span>${item[0]}</span>
      <div>
        <b>${item[1]}</b>
        <p>${item[2]}</p>
      </div>
    </div>
  `).join("");

  // Refresh field scanning display
  renderPoints();
}

// ==========================================
// 6. FOUR-POINT FIELD SCANNER
// ==========================================

function renderPoints() {
  $("points").innerHTML = points.map(p => `
    <div class="point ${p.name === current.point ? "active" : ""}">
      <b>${p.name}</b>
      <div>${p.saved ? `${p.moisture}% moisture` : "Not scanned"}</div>
      <small>
        ${p.saved && Number.isFinite(p.temp)
          ? `${p.temp.toFixed(1)}°C`
          : "Move probe here"}
      </small>
    </div>
  `).join("");

  $("scanCount").textContent =
    `${points.filter(p => p.saved).length}/4 points`;
}

// Save a reading to the next unscanned point
$("savePoint").addEventListener("click", () => {
  const p = points.find(point => !point.saved);

  if (!p) {
    $("scanMessage").textContent =
      "All four points have readings. Reset points to scan again.";
    return;
  }

  p.moisture = Number.isFinite(Number(current.moisture_percent))
    ? Math.round(Number(current.moisture_percent))
    : null;

  p.temp = Number.isFinite(Number(current.temperature))
    ? Number(current.temperature)
    : null;

  p.saved = p.moisture !== null && p.temp !== null;

  if (!p.saved) {
    $("scanMessage").textContent =
      "Cannot save this point because the sensor reading is invalid.";
    return;
  }

  current.point = p.name;
  render();

  $("scanMessage").textContent =
    `Saved current reading at Point ${p.name}. Move the probe to the next point.`;
});

// Reset the field scanner
$("resetPoints").addEventListener("click", () => {
  points = points.map(p => ({
    name: p.name,
    moisture: null,
    temp: null,
    saved: false
  }));

  current.point = "A";
  render();

  $("scanMessage").textContent =
    "Scan reset. Take new readings at Points A, B, C and D.";
});

// ==========================================
// 7. DEMO MODE
// ==========================================

$("demo").addEventListener("click", () => {
  current = { ...demo };

  $("status").textContent = "Demo data";
  $("status").classList.remove("live");

  $("deviceMessage").textContent =
    "Using sample data. This is not a live sensor connection.";

  render();
});

// ==========================================
// 8. DIRECT ESP32 CONNECTION
// ==========================================

$("connect").addEventListener("click", async () => {
  const url = $("deviceUrl").value.trim();

  if (!url) {
    $("deviceMessage").textContent =
      "Enter the ESP32 data URL first.";
    return;
  }

  try {
    $("deviceMessage").textContent = "Requesting readings…";

    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const d = await response.json();

    const m = Number(d.moisture_percent);
    const t = Number(d.temperature);
    const h = Number(d.humidity);

    if (![m, t, h].every(Number.isFinite)) {
      throw new Error(
        "JSON must include numeric moisture_percent, temperature and humidity"
      );
    }

    current = {
      moisture_raw: Number.isFinite(Number(d.moisture_raw))
        ? Number(d.moisture_raw)
        : null,
      moisture_percent: m,
      temperature: t,
      humidity: h,
      point: String(d.point || "A")
    };

    $("status").textContent = "ESP32 connected";
    $("status").classList.add("live");

    $("deviceMessage").textContent =
      "Readings received from ESP32. Click Connect again to refresh them.";

    render();

  } catch (error) {
    $("status").textContent = "Not connected";
    $("status").classList.remove("live");

    $("deviceMessage").textContent =
      `Could not read ESP32: ${error.message}. Check Wi-Fi, URL, firmware endpoint and browser CORS settings.`;
  }
});

// ==========================================
// 9. FIELD NAME
// ==========================================

$("fieldName").addEventListener("change", () => {
  const name = $("fieldName").value.trim() || "My Field";

  $("fieldName").value = name;
  document.title = `CropSense AI | ${name}`;
});

// ==========================================
// 10. FIREBASE LIVE SENSOR LISTENER
// ==========================================

window.addEventListener("cropsense-live-data", event => {
  const d = event.detail;

  if (!d) return;

  const m = Number(d.moisture_percent);
  const t = Number(d.temperature);
  const h = Number(d.humidity);

  if (![m, t, h].every(Number.isFinite)) {
    console.warn("Invalid Firebase sensor data:", d);
    return;
  }

  current = {
    moisture_raw: Number.isFinite(Number(d.moisture_raw))
      ? Number(d.moisture_raw)
      : null,
    moisture_percent: m,
    temperature: t,
    humidity: h,
    point: String(d.point || "A")
  };

  $("status").textContent = "Live Firebase";
  $("status").classList.add("live");

  $("deviceMessage").textContent =
    "Live sensor readings are updating from Firebase.";

  render();

  console.log("CropSense dashboard updated:", current);
});

// ==========================================
// 11. INITIAL DASHBOARD DISPLAY
// ==========================================

render();


