"use strict";

/* =========================================
   CROPSENSE AI - SIMPLIFIED APP.JS
   ========================================= */

const $ = id => document.getElementById(id);

let current = {
  moisture_percent: 35,
  temperature: 27.8,
  humidity: 54.2,
  point: "A"
};

let points = ["A", "B", "C", "D"].map(name => ({
  name, moisture: null, temp: null, saved: false
}));

let scanComplete = false;
let selectedSeason = "";
let selectedSoilType = "";
let soilPH = null;
let photoURL = null;
window.cropSenseLocation = null;

const soilTypes = [
  "Black soil", "Red and yellow soil", "Alluvial soil",
  "Laterite soil", "Arid / desert soil",
  "Mountain / forest soil", "Saline / alkaline soil",
  "Peaty / marshy soil"
];

const seasons = {
  Kharif: "June – October",
  Rabi: "October – March",
  Zaid: "March – June",
  Perennial: "Year-round"
};

/* Crop data:
   name | emoji | target moisture | target temperature | category
*/

const cropRows = `
Rice|🌾|75|28|Cereal
Wheat|🌾|40|22|Cereal
Maize|🌽|48|30|Cereal
Pearl Millet (Bajra)|🌾|30|31|Millet
Sorghum (Jowar)|🌾|32|30|Millet
Finger Millet (Ragi)|🌾|40|25|Millet
Foxtail Millet|🌾|30|28|Millet
Little Millet|🌾|30|27|Millet
Kodo Millet|🌾|30|28|Millet
Proso Millet|🌾|28|27|Millet
Barnyard Millet|🌾|35|25|Millet
Barley|🌾|35|20|Cereal
Oats|🌾|45|18|Cereal
Chickpea (Chana)|🫘|30|23|Pulse
Pigeon Pea (Tur)|🫘|35|29|Pulse
Green Gram (Moong)|🫘|35|29|Pulse
Black Gram (Urad)|🫘|40|28|Pulse
Lentil (Masoor)|🫘|35|20|Pulse
Field Pea|🫛|40|18|Pulse
Cowpea (Lobia)|🫘|35|29|Pulse
Horse Gram|🫘|30|27|Pulse
Moth Bean|🫘|25|30|Pulse
Soybean|🫘|52|27|Oilseed
Groundnut|🥜|40|29|Oilseed
Mustard|🌼|35|20|Oilseed
Sunflower|🌻|40|25|Oilseed
Sesame (Til)|🌱|30|29|Oilseed
Safflower (Kusum)|🌼|30|23|Oilseed
Linseed (Flax)|🌱|35|20|Oilseed
Castor|🌿|30|29|Oilseed
Cotton|🌼|35|30|Cash crop
Sugarcane|🎋|70|28|Cash crop
Jute|🌿|70|28|Fibre crop
Tobacco|🌿|35|25|Cash crop
Tomato|🍅|50|24|Vegetable
Potato|🥔|50|18|Vegetable
Onion|🧅|40|24|Vegetable
Garlic|🧄|35|18|Vegetable
Green Chilli|🌶️|45|27|Vegetable
Brinjal (Eggplant)|🍆|50|27|Vegetable
Okra (Bhindi)|🌿|40|28|Vegetable
Cabbage|🥬|50|18|Vegetable
Cauliflower|🥦|50|18|Vegetable
Spinach|🥬|50|18|Vegetable
Cucumber|🥒|55|27|Vegetable
Pumpkin|🎃|45|26|Vegetable
Bitter Gourd|🌿|45|27|Vegetable
Bottle Gourd|🌿|50|27|Vegetable
Carrot|🥕|45|18|Vegetable
Radish|🌱|40|18|Vegetable
Beetroot|🌱|40|18|Vegetable
Sweet Potato|🍠|45|25|Vegetable
Tapioca (Cassava)|🌱|35|27|Root crop
Banana|🍌|65|27|Fruit
Mango|🥭|35|28|Fruit
Sweet Orange|🍊|45|25|Fruit
Lemon|🍋|40|25|Fruit
Guava|🍈|40|26|Fruit
Papaya|🍈|55|27|Fruit
Pomegranate|🍎|30|26|Fruit
Grapes|🍇|35|24|Fruit
Watermelon|🍉|40|28|Fruit
Muskmelon|🍈|35|27|Fruit
Apple|🍎|45|15|Fruit
Coconut|🥥|65|27|Plantation crop
Turmeric|🌿|65|27|Spice
Ginger|🌿|65|25|Spice
Coriander|🌿|35|20|Spice
Cumin (Jeera)|🌿|25|22|Spice
Fennel (Saunf)|🌿|35|22|Spice
Fenugreek (Methi)|🌿|35|20|Spice
Black Pepper|🌿|70|27|Spice
`.trim().split("\n").map(row => {
  const [name, emoji, moisture, temperature, category] = row.split("|");
  return {
    name, emoji,
    targetM: Number(moisture),
    targetT: Number(temperature),
    category
  };
});

const categories = [
  ["Cereals & Millets", ["Cereal", "Millet"]],
  ["Pulses & Legumes", ["Pulse"]],
  ["Oilseeds", ["Oilseed"]],
  ["Cash & Fibre Crops", ["Cash crop", "Fibre crop"]],
  ["Vegetables", ["Vegetable", "Root crop"]],
  ["Fruits & Plantation Crops", ["Fruit", "Plantation crop"]],
  ["Spices & Condiments", ["Spice"]]
];

const seasonCrops = {
  Kharif: [
    "Rice", "Maize", "Pearl Millet (Bajra)", "Sorghum (Jowar)",
    "Finger Millet (Ragi)", "Foxtail Millet", "Little Millet",
    "Kodo Millet", "Proso Millet", "Barnyard Millet",
    "Pigeon Pea (Tur)", "Green Gram (Moong)", "Black Gram (Urad)",
    "Cowpea (Lobia)", "Moth Bean", "Soybean", "Groundnut",
    "Sesame (Til)", "Castor", "Cotton", "Jute", "Tobacco",
    "Okra (Bhindi)", "Brinjal (Eggplant)", "Green Chilli",
    "Pumpkin", "Bitter Gourd", "Bottle Gourd", "Cucumber",
    "Sweet Potato", "Tapioca (Cassava)", "Banana", "Papaya",
    "Turmeric", "Ginger", "Black Pepper"
  ],
  Rabi: [
    "Wheat", "Barley", "Oats", "Chickpea (Chana)",
    "Lentil (Masoor)", "Field Pea", "Mustard", "Safflower (Kusum)",
    "Linseed (Flax)", "Potato", "Onion", "Garlic", "Cabbage",
    "Cauliflower", "Spinach", "Carrot", "Radish", "Beetroot",
    "Coriander", "Cumin (Jeera)", "Fennel (Saunf)",
    "Fenugreek (Methi)"
  ],
  Zaid: [
    "Green Gram (Moong)", "Cowpea (Lobia)", "Watermelon",
    "Muskmelon", "Cucumber", "Pumpkin", "Bitter Gourd",
    "Bottle Gourd", "Okra (Bhindi)"
  ],
  Perennial: [
    "Sugarcane", "Banana", "Mango", "Sweet Orange", "Lemon",
    "Guava", "Papaya", "Pomegranate", "Grapes", "Coconut",
    "Black Pepper"
  ]
};

const cropSoils = {
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
  "Cotton": ["Black soil", "Alluvial soil"],
  "Sugarcane": ["Alluvial soil", "Black soil"],
  "Jute": ["Alluvial soil"],
  "Tomato": ["Alluvial soil", "Red and yellow soil", "Black soil"],
  "Potato": ["Alluvial soil", "Mountain / forest soil"],
  "Onion": ["Alluvial soil", "Black soil", "Red and yellow soil"],
  "Banana": ["Alluvial soil", "Black soil", "Laterite soil"],
  "Mango": ["Red and yellow soil", "Laterite soil", "Alluvial soil"],
  "Apple": ["Mountain / forest soil"],
  "Coconut": ["Laterite soil", "Alluvial soil"],
  "Turmeric": ["Red and yellow soil", "Laterite soil", "Alluvial soil"],
  "Ginger": ["Laterite soil", "Red and yellow soil"],
  "Black Pepper": ["Laterite soil"]
};

const cropPH = {
  "Rice": [5, 7],
  "Wheat": [6, 7.5],
  "Pearl Millet (Bajra)": [5.5, 8],
  "Sorghum (Jowar)": [5.5, 8],
  "Chickpea (Chana)": [6, 8],
  "Cotton": [5.5, 8],
  "Sugarcane": [6, 7.5],
  "Potato": [5, 6.5],
  "Groundnut": [5.5, 7],
  "Apple": [5.5, 7],
  "Coconut": [5, 8]
};

function safeText(id, value) {
  const el = $(id);
  if (el) el.textContent = value;
}

function moistureStatus(value) {
  if (!Number.isFinite(value)) return "Unavailable";
  if (value < 25) return "Low";
  if (value < 45) return "Moderate-low";
  if (value <= 75) return "Moderate";
  return "High";
}

function cropScore(m, t, targetM, targetT) {
  if (!Number.isFinite(m) || !Number.isFinite(t)) return 0;
  const moistureScore = Math.max(0, 100 - Math.abs(m - targetM) * 1.5);
  const temperatureScore = Math.max(0, 100 - Math.abs(t - targetT) * 9);
  return Math.round(moistureScore * .65 + temperatureScore * .35);
}

/* =========================================
   FARM INPUTS
   ========================================= */

function ensureFarmInputs() {
  if ($("farmInputs")) return;

  const crops = $("crops");
  if (!crops || !crops.parentNode) return;

  const panel = document.createElement("section");
  panel.id = "farmInputs";
  panel.style.cssText =
    "margin:16px 0;padding:16px;border:1px solid #d8e6dc;border-radius:14px;background:#f7faf7;color:#203328";

  panel.innerHTML = `
    <h3>🌱 Farm Details</h3>

    <label for="farmSeason">Cropping season</label>
    <select id="farmSeason" style="width:100%;padding:11px;margin:8px 0">
      <option value="">Select season</option>
      <option value="Kharif">Kharif</option>
      <option value="Rabi">Rabi</option>
      <option value="Zaid">Zaid</option>
      <option value="Perennial">Perennial</option>
    </select>
    <div id="seasonInfo"></div>

    <hr>

    <h3>🧪 Soil pH Test</h3>
    <label for="soilPHInput">Enter pH value (0–14)</label>
    <input id="soilPHInput" type="number" min="0" max="14" step=".1"
      placeholder="Example: 6.5" style="width:100%;padding:10px">

    <label for="phPhoto">Upload pH strip photograph (optional)</label>
    <input id="phPhoto" type="file" accept="image/*"
      style="width:100%;padding:8px">
    <div id="phPhotoPreview"></div>
    <div id="phResult"></div>

    <hr>

    <h3>🌍 Soil Type</h3>
    <select id="soilTypeSelect" style="width:100%;padding:11px">
      <option value="">Select soil type</option>
      ${soilTypes.map(s => `<option value="${s}">${s}</option>`).join("")}
    </select>
    <div id="suitabilityProgress" style="margin-top:10px"></div>

    <hr>

    <h3>🌱 Soil Health & Treatment Advisor</h3>

    <label for="soilECInput">Soil EC (dS/m)</label>
    <input id="soilECInput" type="number" min="0" step=".01"
      placeholder="Optional laboratory value" style="width:100%;padding:10px">

    <label for="soilECMethod">EC test method</label>
    <select id="soilECMethod" style="width:100%;padding:10px">
      <option value="unknown">Not sure</option>
      <option value="ECe">Saturated-paste extract (ECe)</option>
      <option value="1:2">Soil-water 1:2</option>
      <option value="1:5">Soil-water 1:5</option>
    </select>

    <label for="soilESPInput">ESP (%)</label>
    <input id="soilESPInput" type="number" min="0" step=".1"
      placeholder="Optional laboratory value" style="width:100%;padding:10px">

    <label for="gypsumRequirement">Laboratory gypsum requirement (t/ha)</label>
    <input id="gypsumRequirement" type="number" min="0" step=".1"
      placeholder="Optional laboratory recommendation" style="width:100%;padding:10px">

    <div id="soilTreatmentResult" style="margin-top:12px;padding:12px;background:#edf4ee;border-radius:8px"></div>

    <hr>

    <h3>🌦️ Live Weather & 7-Day Forecast</h3>
    <button id="refreshWeather" type="button">Refresh Weather</button>
    <div id="weatherStatus" style="margin-top:10px"></div>
    <div id="weatherCurrent"></div>
    <div id="weatherForecast"></div>
  `;

  crops.parentNode.insertBefore(panel, crops);

  $("farmSeason").addEventListener("change", () => {
    selectedSeason = $("farmSeason").value;
    render();
  });

  $("soilTypeSelect").addEventListener("change", () => {
    selectedSoilType = $("soilTypeSelect").value;
    render();
  });

  $("soilPHInput").addEventListener("input", () => {
    const v = $("soilPHInput").value.trim();
    soilPH = v === "" ? null : Number(v);
    if (!Number.isFinite(soilPH) || soilPH < 0 || soilPH > 14) soilPH = null;
    render();
  });

  $("phPhoto").addEventListener("change", handlePHPhoto);

  ["soilECInput", "soilECMethod", "soilESPInput", "gypsumRequirement"]
    .forEach(id => $(id).addEventListener("input", renderSoilAdvice));

  $("refreshWeather").addEventListener("click", () => {
    fetchWeather(window.cropSenseLocation);
  });

  renderSoilAdvice();
}

/* =========================================
   PH TEST
   ========================================= */

function phGuidance(ph) {
  if (ph < 5.5) return ["Acidic", "Laboratory lime-requirement testing may be needed."];
  if (ph < 6.5) return ["Moderately acidic", "Check crop requirements and obtain a lime-requirement test."];
  if (ph <= 7.5) return ["Near neutral", "This range is commonly suitable for many crops."];
  if (ph <= 8.5) return ["Alkaline", "Further laboratory testing is needed. pH alone cannot confirm sodicity."];
  return ["Strongly alkaline", "Ask a laboratory to test pH, EC and sodicity indicators."];
}

function renderPH() {
  const box = $("phResult");
  if (!box) return;

  if (soilPH === null) {
    box.textContent = "Enter a valid pH value from your test kit.";
    return;
  }

  const [label, message] = phGuidance(soilPH);
  box.innerHTML = `
    <div style="padding:12px;margin-top:10px;background:white;border-radius:8px">
      <b>Soil pH: ${soilPH.toFixed(1)}</b>
      <p><b>${label}</b></p>
      <p>${message}</p>
    </div>
  `;
}

function handlePHPhoto(event) {
  const file = event.target.files?.[0];
  const box = $("phPhotoPreview");
  if (!file || !box) return;

  if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
    box.textContent = "Choose an image smaller than 5 MB.";
    event.target.value = "";
    return;
  }

  if (photoURL) URL.revokeObjectURL(photoURL);
  photoURL = URL.createObjectURL(file);

  box.innerHTML = `
    <p>Photo preview only. Read the pH value using your kit colour chart.</p>
    <img src="${photoURL}" alt="Soil pH strip"
      style="max-width:100%;max-height:200px">
  `;
}

/* =========================================
   SOIL HEALTH ADVISOR
   ========================================= */

function renderSoilAdvice() {
  const box = $("soilTreatmentResult");
  if (!box) return;

  const ecText = $("soilECInput")?.value.trim() || "";
  const espText = $("soilESPInput")?.value.trim() || "";
  const gypsumText = $("gypsumRequirement")?.value.trim() || "";
  const method = $("soilECMethod")?.value || "unknown";

  const ec = ecText === "" ? null : Number(ecText);
  const esp = espText === "" ? null : Number(espText);
  const gypsum = gypsumText === "" ? null : Number(gypsumText);

  let messages = [];

  if (soilPH !== null) {
    const [label, message] = phGuidance(soilPH);
    messages.push(`<b>pH: ${label}</b><br>${message}`);
  }

  if (ec !== null && Number.isFinite(ec) && ec >= 0) {
    if (method === "ECe") {
      messages.push(ec >= 4
        ? "ECe is at or above the conventional 4 dS/m salinity screening threshold. Crop sensitivity varies."
        : "ECe is below the conventional 4 dS/m screening threshold.");
    } else {
      messages.push(`EC is ${ec} dS/m using the ${method} method. Do not compare this directly with the ECe threshold.`);
    }
  }

  if (esp !== null && Number.isFinite(esp) && esp >= 0) {
    messages.push(esp >= 15
      ? "ESP is at or above the commonly used 15% sodicity screening level. Confirm with a laboratory."
      : "ESP is below the commonly used 15% screening level.");
  }

  if (gypsum !== null && Number.isFinite(gypsum) && gypsum > 0) {
    messages.push(`Laboratory gypsum recommendation entered: ${gypsum} tonnes per hectare.`);
  } else if (esp !== null && esp >= 15) {
    messages.push("Ask your soil laboratory for a gypsum requirement test. This tool does not calculate a dose.");
  }

  if (!messages.length) {
    box.textContent = "Enter soil test results for preliminary guidance.";
  } else {
    box.innerHTML = messages.map(m => `<p>${m}</p>`).join("");
  }
}

/* =========================================
   CROP SUITABILITY
   ========================================= */

function suitability(crop) {
  if (!selectedSeason || !selectedSoilType || soilPH === null) {
    return "Complete season, soil type and pH inputs";
  }

  const seasonOK = !seasonCrops[selectedSeason] ||
    seasonCrops[selectedSeason].includes(crop.name);

  const soilList = cropSoils[crop.name];
  const soilOK = !soilList || soilList.includes(selectedSoilType);

  const phRange = cropPH[crop.name] || [5.5, 7.5];
  const phOK = soilPH >= phRange[0] && soilPH <= phRange[1];

  return seasonOK && soilOK && phOK ? "Suitable" : "Not suitable";
}

/* =========================================
   CROP DISPLAY
   ========================================= */

function renderCrops() {
  const box = $("crops");
  if (!box) return;

  const saved = points.every(p => p.saved);
  const avgM = saved ? points.reduce((s, p) => s + p.moisture, 0) / 4 : NaN;
  const avgT = saved ? points.reduce((s, p) => s + p.temp, 0) / 4 : NaN;

  let html = "";

  categories.forEach(([title, types]) => {
    const list = cropRows.filter(c => types.includes(c.category));

    html += `<section class="crop-category"><h3>${title}</h3><div class="crop-row">`;

    list.forEach(crop => {
      const result = suitability(crop);
      const value = saved ? cropScore(avgM, avgT, crop.targetM, crop.targetT) : null;

      html += `
        <article class="crop crop-card">
          <div class="cropicon">${crop.emoji}</div>
          <b>${crop.name}</b>
          <span class="crop-type">${crop.category}</span>
          <small>${result}</small>
          ${value !== null ? `<div class="score">${value}%</div>` : ""}
        </article>
      `;
    });

    html += "</div></section>";
  });

  box.innerHTML = html;
}

/* =========================================
   FOUR-POINT SOIL SCAN
   ========================================= */

function renderPoints() {
  const box = $("points");
  if (!box) return;

  box.innerHTML = points.map(p => `
    <div class="point ${p.name === current.point ? "active" : ""}">
      <b>${p.name}</b>
      <div>${p.saved ? p.moisture + "% moisture" : "Not scanned"}</div>
      <small>${p.saved ? p.temp.toFixed(1) + "°C" : "Move probe here"}</small>
    </div>
  `).join("");

  const count = points.filter(p => p.saved).length;
  const complete = count === 4;

  safeText("scanCount", `${count}/4 points`);

  if ($("doneScan")) {
    $("doneScan").disabled = !complete;
    $("doneScan").textContent = scanComplete ? "Completed ✓" : "Done";
  }

  if ($("savePoint")) $("savePoint").disabled = complete;
}

if ($("savePoint")) {
  $("savePoint").addEventListener("click", () => {
    const p = points.find(x => !x.saved);

    if (!p) return;

    const m = Number(current.moisture_percent);
    const t = Number(current.temperature);

    if (!Number.isFinite(m) || !Number.isFinite(t)) {
      safeText("scanMessage", "Invalid sensor reading.");
      return;
    }

    p.moisture = m;
    p.temp = t;
    p.saved = true;
    current.point = p.name;
    scanComplete = false;

    render();
    safeText("scanMessage", `Point ${p.name} saved. Move the probe to the next point.`);
  });
}

if ($("doneScan")) {
  $("doneScan").addEventListener("click", () => {
    if (!points.every(p => p.saved)) return;

    scanComplete = true;
    render();
    safeText("scanMessage", "Four-point scan completed. Scores use the average of four readings.");
  });
}

if ($("resetPoints")) {
  $("resetPoints").addEventListener("click", () => {
    points = ["A", "B", "C", "D"].map(name => ({
      name, moisture: null, temp: null, saved: false
    }));

    current.point = "A";
    scanComplete = false;
    render();
    safeText("scanMessage", "Scan reset. Start again at Point A.");
  });
}

/* =========================================
   SEASON INFORMATION
   ========================================= */

function renderSeason() {
  const box = $("seasonInfo");
  if (!box) return;

  box.textContent = selectedSeason
    ? `${selectedSeason}: ${seasons[selectedSeason] || ""}`
    : "Select your cropping season.";
}

/* =========================================
   MAIN RENDER
   ========================================= */

function render() {
  ensureFarmInputs();

  if (!$("moisture")) return;

  const m = Number(current.moisture_percent);
  const t = Number(current.temperature);
  const h = Number(current.humidity);

  safeText("moisture", Number.isFinite(m) ? Math.round(m) : "--");
  safeText("temp", Number.isFinite(t) ? t.toFixed(1) : "--");
  safeText("humidity", Number.isFinite(h) ? h.toFixed(1) : "--");
  safeText("moistureNote", moistureStatus(m));

  if ($("moistureBar")) $("moistureBar").style.width = `${Math.max(0, Math.min(100, m || 0))}%`;
  if ($("tempBar")) $("tempBar").style.width = `${Math.max(0, Math.min(100, (t || 0) * 2))}%`;
  if ($("humidityBar")) $("humidityBar").style.width = `${Math.max(0, Math.min(100, h || 0))}%`;

  renderCrops();
  renderPoints();
  renderPH();
  renderSoilAdvice();
  renderSeason();

  const progress = $("suitabilityProgress");
  if (progress) {
    progress.textContent =
      selectedSeason && selectedSoilType && soilPH !== null
        ? "Preliminary crop suitability results are displayed."
        : "Select season, soil type and enter pH to check suitability.";
  }
}

/* =========================================
   DEMO MODE
   ========================================= */

if ($("demo")) {
  $("demo").addEventListener("click", () => {
    current = {
      moisture_percent: 35,
      temperature: 27.8,
      humidity: 54.2,
      point: "A"
    };

    safeText("status", "Demo data");
    $("status")?.classList.remove("live");
    render();
  });
}

/* =========================================
   FIREBASE LIVE DATA
   ========================================= */

window.addEventListener("cropsense-live-data", event => {
  const d = event.detail;
  if (!d) return;

  const m = Number(d.moisture_percent ?? d.moisture);
  const t = Number(d.temperature);
  const h = Number(d.humidity);

  if (
    d.moisture_percent == null && d.moisture == null ||
    d.temperature == null ||
    d.humidity == null ||
    ![m, t, h].every(Number.isFinite)
  ) {
    console.warn("Invalid Firebase data", d);
    return;
  }

  current = {
    moisture_percent: m,
    temperature: t,
    humidity: h,
    point: String(d.point || "A")
  };

  safeText("status", "Live Firebase");
  $("status")?.classList.add("live");
  render();
});

/* =========================================
   GPS AND WEATHER
   ========================================= */

function getCoordinates(location) {
  if (!location) return null;

  const lat = Number(
    location.latitude ?? location.lat ?? location.coords?.latitude
  );

  const lon = Number(
    location.longitude ?? location.lon ??
    location.lng ?? location.coords?.longitude
  );

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    Math.abs(lat) > 90 ||
    Math.abs(lon) > 180
  ) return null;

  return { lat, lon };
}

const weatherCodes = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Rain showers",
  82: "Heavy showers",
  95: "Thunderstorm",
  96: "Thunderstorm",
  99: "Thunderstorm"
};

async function fetchWeather(location) {
  const status = $("weatherStatus");
  const currentBox = $("weatherCurrent");
  const forecastBox = $("weatherForecast");

  if (!status || !currentBox || !forecastBox) return;

  const coords = getCoordinates(location);

  if (!coords) {
    status.textContent = "Allow GPS location to view local weather.";
    return;
  }

  status.textContent = "Loading weather...";
  currentBox.innerHTML = "";
  forecastBox.innerHTML = "";

  try {
    const params = new URLSearchParams({
      latitude: coords.lat,
      longitude: coords.lon,
      current: "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max",
      timezone: "auto",
      forecast_days: "7"
    });

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?${params}`
    );

    if (!response.ok) throw new Error("Weather request failed");

    const data = await response.json();
    const c = data.current;
    const d = data.daily;

    status.textContent = `Weather for ${coords.lat.toFixed(3)}, ${coords.lon.toFixed(3)}`;

    currentBox.innerHTML = `
      <div style="padding:12px;margin-top:10px;border:1px solid #ddd;border-radius:10px">
        <h4>Current weather</h4>
        <h2>${c.temperature_2m}°C</h2>
        <p>${weatherCodes[c.weather_code] || "Weather information"}</p>
        <p>Humidity: ${c.relative_humidity_2m}%</p>
        <p>Feels like: ${c.apparent_temperature}°C</p>
        <p>Rain: ${c.rain} mm</p>
        <p>Wind: ${c.wind_speed_10m} km/h</p>
      </div>
    `;

    forecastBox.innerHTML = `
      <h4>7-day forecast</h4>
      <div style="display:flex;gap:10px;overflow-x:auto">
        ${d.time.map((date, i) => `
          <div style="min-width:125px;padding:10px;border:1px solid #ddd;border-radius:9px">
            <b>${date}</b>
            <p>${weatherCodes[d.weather_code[i]] || "Weather"}</p>
            <p>Max: ${d.temperature_2m_max[i]}°C</p>
            <p>Min: ${d.temperature_2m_min[i]}°C</p>
            <p>Rain: ${d.precipitation_sum[i]} mm</p>
            <p>Rain chance: ${d.precipitation_probability_max[i] ?? "--"}%</p>
          </div>
        `).join("")}
      </div>
    `;

  } catch (error) {
    console.error("Weather error:", error);
    status.textContent = "Weather unavailable. Check your internet connection.";
  }
}

function applyGPSLocation(location) {
  if (!location) return;

  window.cropSenseLocation = location;
  fetchWeather(location);
}

window.addEventListener("cropsense-location-detected", event => {
  applyGPSLocation(event.detail);
});

if (window.cropSenseLocation) {
  applyGPSLocation(window.cropSenseLocation);
}

/* =========================================
   START APPLICATION
   ========================================= */

render();
