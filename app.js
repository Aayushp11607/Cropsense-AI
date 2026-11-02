"use strict";

// ==========================================
// 1. INITIAL DATA
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
  { name: "A", moisture: null, temp: null, saved: false },
  { name: "B", moisture: null, temp: null, saved: false },
  { name: "C", moisture: null, temp: null, saved: false },
  { name: "D", moisture: null, temp: null, saved: false }
];

let scanComplete = false;


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
// Targets are illustrative prototype values.
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

  // Fruits and plantation crops
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
// 4. PROTOTYPE MATCH SCORE
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
// 5. CROP CATEGORIES
// ==========================================

const cropCategories = {
  "Cereals & Millets": ["Cereal", "Millet"],
  "Pulses & Legumes": ["Pulse", "Oilseed/Pulse"],
  "Oilseeds": ["Oilseed"],
  "Cash & Fibre Crops": ["Cash crop", "Fibre crop"],
  "Vegetables": ["Vegetable", "Root crop"],
  "Fruits & Plantation Crops": ["Fruit", "Plantation crop"],
  "Spices & Condiments": ["Spice"]
};


// ==========================================
// 5A. INDIAN SOIL-TYPE GUIDANCE
// Broad associations, not field-level guarantees.
// ==========================================

const indianSoilTypes = [
  "Black soil",
  "Red and yellow soil",
  "Alluvial soil",
  "Laterite soil",
  "Arid / desert soil",
  "Mountain / forest soil",
  "Saline / alkaline soil",
  "Peaty / marshy soil"
];

let selectedSoilType = "Not selected";

const cropSoilGuide = {
  "Rice": ["Alluvial soil", "Peaty / marshy soil"],
  "Wheat": ["Alluvial soil", "Black soil"],
  "Maize": ["Alluvial soil", "Red and yellow soil", "Black soil"],
  "Pearl Millet (Bajra)": ["Arid / desert soil", "Red and yellow soil"],
  "Sorghum (Jowar)": ["Black soil", "Red and yellow soil"],
  "Finger Millet (Ragi)": ["Red and yellow soil", "Laterite soil"],
  "Chickpea (Chana)": ["Black soil", "Alluvial soil"],
  "Pigeon Pea (Tur)": ["Black soil", "Red and yellow soil"],
  "Green Gram (Moong)": ["Alluvial soil", "Red and yellow soil", "Arid / desert soil"],
  "Black Gram (Urad)": ["Black soil", "Alluvial soil"],
  "Soybean": ["Black soil", "Red and yellow soil"],
  "Groundnut": ["Red and yellow soil", "Alluvial soil", "Black soil"],
  "Mustard": ["Alluvial soil", "Arid / desert soil"],
  "Sesame (Til)": ["Red and yellow soil", "Arid / desert soil"],
  "Safflower (Kusum)": ["Black soil", "Red and yellow soil"],
  "Cotton": ["Black soil", "Alluvial soil"],
  "Sugarcane": ["Alluvial soil", "Black soil"],
  "Jute": ["Alluvial soil"],
  "Tobacco": ["Alluvial soil", "Black soil"],
  "Tomato": ["Alluvial soil", "Red and yellow soil", "Black soil"],
  "Potato": ["Alluvial soil", "Mountain / forest soil"],
  "Onion": ["Alluvial soil", "Black soil", "Red and yellow soil"],
  "Garlic": ["Alluvial soil", "Black soil"],
  "Green Chilli": ["Alluvial soil", "Black soil", "Red and yellow soil"],
  "Brinjal (Eggplant)": ["Alluvial soil", "Black soil", "Red and yellow soil"],
  "Okra (Bhindi)": ["Alluvial soil", "Black soil", "Red and yellow soil"],
  "Cabbage": ["Alluvial soil", "Mountain / forest soil"],
  "Cauliflower": ["Alluvial soil", "Mountain / forest soil"],
  "Spinach": ["Alluvial soil", "Black soil"],
  "Cucumber": ["Alluvial soil", "Red and yellow soil"],
  "Pumpkin": ["Alluvial soil", "Red and yellow soil"],
  "Bitter Gourd": ["Alluvial soil", "Red and yellow soil"],
  "Bottle Gourd": ["Alluvial soil", "Black soil"],
  "Carrot": ["Alluvial soil", "Mountain / forest soil"],
  "Radish": ["Alluvial soil", "Red and yellow soil"],
  "Beetroot": ["Alluvial soil", "Black soil"],
  "Sweet Potato": ["Red and yellow soil", "Laterite soil"],
  "Tapioca (Cassava)": ["Red and yellow soil", "Laterite soil"],
  "Banana": ["Alluvial soil", "Black soil", "Laterite soil"],
  "Mango": ["Red and yellow soil", "Laterite soil", "Alluvial soil"],
  "Sweet Orange": ["Black soil", "Alluvial soil"],
  "Lemon": ["Alluvial soil", "Red and yellow soil"],
  "Guava": ["Alluvial soil", "Red and yellow soil"],
  "Papaya": ["Alluvial soil", "Red and yellow soil"],
  "Pomegranate": ["Black soil", "Red and yellow soil"],
  "Grapes": ["Black soil", "Alluvial soil"],
  "Watermelon": ["Alluvial soil", "Arid / desert soil"],
  "Muskmelon": ["Alluvial soil", "Arid / desert soil"],
  "Apple": ["Mountain / forest soil"],
  "Coconut": ["Laterite soil", "Alluvial soil"],
  "Turmeric": ["Red and yellow soil", "Laterite soil", "Alluvial soil"],
  "Ginger": ["Laterite soil", "Red and yellow soil"],
  "Coriander": ["Alluvial soil", "Black soil"],
  "Cumin (Jeera)": ["Arid / desert soil", "Alluvial soil"],
  "Fennel (Saunf)": ["Alluvial soil", "Arid / desert soil"],
  "Fenugreek (Methi)": ["Alluvial soil", "Black soil"],
  "Black Pepper": ["Laterite soil"]
};


// Add soil selector above crop cards.
function ensureSoilSelector() {
  if ($("soilTypeSelect")) return;

  const cropsContainer = $("crops");
  if (!cropsContainer) return;

  const wrapper = document.createElement("div");
  wrapper.className = "soil-type-filter";
  wrapper.style.cssText =
    "margin:12px 0 16px;padding:12px;border:1px solid #d8e6dc;border-radius:12px;background:#f5faf6;";

  const label = document.createElement("label");
  label.htmlFor = "soilTypeSelect";
  label.textContent =
    "Select your Indian soil type (farmer-selected):";
  label.style.cssText =
    "display:block;font-weight:600;margin-bottom:7px;";

  const select = document.createElement("select");
  select.id = "soilTypeSelect";
  select.style.cssText =
    "width:100%;max-width:100%;padding:10px;border:1px solid #b8cdbd;border-radius:8px;background:white;";

  const first = document.createElement("option");
  first.value = "Not selected";
  first.textContent = "Choose soil type";
  select.appendChild(first);

  indianSoilTypes.forEach(type => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    select.appendChild(option);
  });

  select.value = selectedSoilType;

  select.addEventListener("change", () => {
    selectedSoilType = select.value;
    render();
  });

  const note = document.createElement("p");
  note.textContent =
    "This is a manual selection, not a sensor measurement. Soil type alone cannot decide the best crop.";
  note.style.cssText =
    "font-size:0.85em;margin:8px 0 0;color:#52665a;";

  wrapper.append(label, select, note);
  cropsContainer.parentNode.insertBefore(wrapper, cropsContainer);
}


// ==========================================
// 6. MAIN DASHBOARD
// ==========================================

function render() {
  ensureSoilSelector();

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


  // ==========================================
  // CROP DISPLAY AND FOUR-POINT AVERAGES
  // ==========================================

  const allPointsSaved = points.every(p =>
    p.saved &&
    Number.isFinite(p.moisture) &&
    Number.isFinite(p.temp)
  );

  const showScores = scanComplete && allPointsSaved;

  const averageMoisture = showScores
    ? points.reduce((sum, p) => sum + p.moisture, 0) / 4
    : NaN;

  const averageTemperature = showScores
    ? points.reduce((sum, p) => sum + p.temp, 0) / 4
    : NaN;

  const cropData = cropDatabase
    .map(c => ({
      ...c,
      score: showScores
        ? score(
            averageMoisture,
            averageTemperature,
            c.targetM,
            c.targetT
          )
        : null
    }))
    .sort((a, b) => {
      if (!showScores) {
        return a.name.localeCompare(b.name);
      }

      return b.score - a.score;
    });

  // Display up to 10 crops in each horizontal category.
  $("crops").innerHTML = Object.entries(cropCategories)
    .map(([title, types]) => {
      const items = cropData
        .filter(c => types.includes(c.category))
        .slice(0, 10);

      if (!items.length) return "";

      return `
        <section class="crop-category">
          <h3>${title}</h3>

          <div class="crop-row">
            ${items.map(c => {
              const suitableSoils = cropSoilGuide[c.name] || [];
              const matchesSelectedSoil =
                suitableSoils.includes(selectedSoilType);

              return `
                <article class="crop crop-card">
                  <div class="cropicon">${c.emoji}</div>

                  <b>${c.name}</b>

                  <span class="crop-type">${c.category}</span>

                  <small class="soil-suitability"
                    style="display:block;margin-top:6px;color:#52665a;">
                    <b>Often suitable soil:</b>
                    ${suitableSoils.length
                      ? suitableSoils.join(", ")
                      : "Varies; check local soil conditions"}
                  </small>

                  ${selectedSoilType !== "Not selected" ? `
                    <small style="
                      display:block;
                      margin-top:4px;
                      font-weight:600;
                      color:${matchesSelectedSoil ? "#247344" : "#8a5a16"};
                    ">
                      ${matchesSelectedSoil
                        ? "✓ Listed for selected soil"
                        : "Not listed for selected soil"}
                    </small>
                  ` : ""}

                  ${showScores ? `
                    <div class="score">
                      ${c.score}%
                      <small>Prototype match</small>
                    </div>
                  ` : ""}
                </article>
              `;
            }).join("")}
          </div>
        </section>
      `;
    })
    .join("");


  // ==========================================
  // FIELD SUMMARY
  // ==========================================

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

  renderPoints();
}


// ==========================================
// 7. FOUR-POINT FIELD SCANNER
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

  const savedCount = points.filter(p => p.saved).length;

  const allPointsSaved = points.every(p =>
    p.saved &&
    Number.isFinite(p.moisture) &&
    Number.isFinite(p.temp)
  );

  $("scanCount").textContent = `${savedCount}/4 points`;

  $("doneScan").disabled = !allPointsSaved;

  $("doneScan").textContent =
    scanComplete ? "Completed ✓" : "Done";

  $("savePoint").disabled = savedCount === 4;
}


// Save a reading to the next unscanned point.
$("savePoint").addEventListener("click", () => {
  const p = points.find(point => !point.saved);

  if (!p) {
    $("scanMessage").textContent =
      "All four points have readings. Reset points to scan again.";
    return;
  }

  const m = Number(current.moisture_percent);
  const t = Number(current.temperature);

  if (
    !Number.isFinite(m) ||
    !Number.isFinite(t) ||
    current.moisture_percent === null ||
    current.temperature === null
  ) {
    $("scanMessage").textContent =
      "Cannot save this point because the sensor reading is invalid.";
    return;
  }

  p.moisture = Math.round(m);
  p.temp = t;
  p.saved = true;

  scanComplete = false;
  current.point = p.name;

  render();

  $("scanMessage").textContent =
    `Saved current reading at Point ${p.name}. Move the probe to the next point.`;
});


// ==========================================
// DONE BUTTON
// ==========================================

$("doneScan").addEventListener("click", () => {
  const allPointsSaved = points.every(p =>
    p.saved &&
    Number.isFinite(p.moisture) &&
    Number.isFinite(p.temp)
  );

  if (!allPointsSaved) {
    $("scanMessage").textContent =
      "Save valid readings at Points A, B, C and D before clicking Done.";
    return;
  }

  scanComplete = true;

  render();

  $("scanMessage").textContent =
    "Field scan complete. Crop match percentages now use the average of all four samples.";
});


// ==========================================
// RESET THE SCANNER
// ==========================================

$("resetPoints").addEventListener("click", () => {
  scanComplete = false;

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
// 8. DEMO MODE
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
// 9. DIRECT ESP32 CONNECTION
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

    const response = await fetch(url, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const d = await response.json();

    const moistureValue = d.moisture_percent ?? d.moisture;
    const tValue = d.temperature;
    const hValue = d.humidity;

    const m = Number(moistureValue);
    const t = Number(tValue);
    const h = Number(hValue);

    if (
      moistureValue == null || tValue == null || hValue == null ||
      ![m, t, h].every(Number.isFinite)
    ) {
      throw new Error(
        "JSON must include numeric moisture (or moisture_percent), temperature and humidity"
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
// 10. FIELD NAME
// ==========================================

$("fieldName").addEventListener("change", () => {
  const name = $("fieldName").value.trim() || "My Field";

  $("fieldName").value = name;
  document.title = `CropSense AI | ${name}`;
});


// ==========================================
// 11. FIREBASE LIVE SENSOR LISTENER
// ==========================================

window.addEventListener("cropsense-live-data", event => {
  const d = event.detail;

  if (!d) return;

  const moistureValue = d.moisture_percent ?? d.moisture;
  const tValue = d.temperature;
  const hValue = d.humidity;

  const m = Number(moistureValue);
  const t = Number(tValue);
  const h = Number(hValue);

  if (
    moistureValue == null || tValue == null || hValue == null ||
    ![m, t, h].every(Number.isFinite)
  ) {
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
// 12. INITIAL DASHBOARD DISPLAY
// ==========================================

render();
