
"use strict";

// =====================================================
// CROPSENSE AI — MAIN WEBSITE APPLICATION
// Existing ESP32 + Firebase + Scanner functionality
// New: India-wide location, seasons and manual soil pH
// =====================================================

const $ = id => document.getElementById(id);

// -----------------------------------------------------
// 1. INITIAL SENSOR DATA
// -----------------------------------------------------

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
let selectedSoilType = "Not selected";
let selectedSeason = "";
let selectedState = "";
let soilPH = null;
let pHPhotoURL = null;

// -----------------------------------------------------
// 2. INDIAN STATES AND UNION TERRITORIES
// District and village are entered manually so that
// every Indian district and village can be supported.
// -----------------------------------------------------

const indiaLocations = {
  "Andhra Pradesh": [
    "Andhra Pradesh"
  ],
  "Arunachal Pradesh": [
    "Arunachal Pradesh"
  ],
  "Assam": ["Assam"],
  "Bihar": ["Bihar"],
  "Chhattisgarh": ["Chhattisgarh"],
  "Goa": ["Goa"],
  "Gujarat": ["Gujarat"],
  "Haryana": ["Haryana"],
  "Himachal Pradesh": ["Himachal Pradesh"],
  "Jharkhand": ["Jharkhand"],
  "Karnataka": ["Karnataka"],
  "Kerala": ["Kerala"],
  "Madhya Pradesh": ["Madhya Pradesh"],
  "Maharashtra": ["Maharashtra"],
  "Manipur": ["Manipur"],
  "Meghalaya": ["Meghalaya"],
  "Mizoram": ["Mizoram"],
  "Nagaland": ["Nagaland"],
  "Odisha": ["Odisha"],
  "Punjab": ["Punjab"],
  "Rajasthan": ["Rajasthan"],
  "Sikkim": ["Sikkim"],
  "Tamil Nadu": ["Tamil Nadu"],
  "Telangana": ["Telangana"],
  "Tripura": ["Tripura"],
  "Uttar Pradesh": ["Uttar Pradesh"],
  "Uttarakhand": ["Uttarakhand"],
  "West Bengal": ["West Bengal"],
  "Andaman and Nicobar Islands": [
    "Andaman and Nicobar Islands"
  ],
  "Chandigarh": ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": [
    "Dadra and Nagar Haveli and Daman and Diu"
  ],
  "Delhi": ["Delhi"],
  "Jammu and Kashmir": ["Jammu and Kashmir"],
  "Ladakh": ["Ladakh"],
  "Lakshadweep": ["Lakshadweep"],
  "Puducherry": ["Puducherry"]
};

// -----------------------------------------------------
// 3. INDIAN SOIL TYPES
// -----------------------------------------------------

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

// -----------------------------------------------------
// 4. INDIAN AGRICULTURAL SEASONS
// These are broad typical periods. Actual crop calendars
// vary by state, district and local farming conditions.
// -----------------------------------------------------

const seasonDatabase = {
  "Kharif": {
    months: "June – October",
    description: "Generally associated with the monsoon season.",
    crops: "Rice, maize, soybean, cotton, millets and pulses"
  },
  "Rabi": {
    months: "October – March",
    description: "Generally associated with the winter season.",
    crops: "Wheat, chickpea, mustard, peas and lentils"
  },
  "Zaid": {
    months: "March – June",
    description: "Generally associated with the summer season.",
    crops: "Watermelon, cucumber and selected summer vegetables"
  }
};

// -----------------------------------------------------
// 5. CROP DATABASE
// Target values are experimental prototype values.
// -----------------------------------------------------

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

// -----------------------------------------------------
// 6. CROP-SOIL GUIDANCE
// Broad associations, not guaranteed suitability.
// -----------------------------------------------------

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

// -----------------------------------------------------
// 7. CROP CATEGORIES
// -----------------------------------------------------

const cropCategories = {
  "Cereals & Millets": ["Cereal", "Millet"],
  "Pulses & Legumes": ["Pulse", "Oilseed/Pulse"],
  "Oilseeds": ["Oilseed"],
  "Cash & Fibre Crops": ["Cash crop", "Fibre crop"],
  "Vegetables": ["Vegetable", "Root crop"],
  "Fruits & Plantation Crops": ["Fruit", "Plantation crop"],
  "Spices & Condiments": ["Spice"]
};

// -----------------------------------------------------
// 8. MOISTURE STATUS
// -----------------------------------------------------

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

// -----------------------------------------------------
// 9. CROP SCORE
// -----------------------------------------------------

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

// -----------------------------------------------------
// 10. CREATE FARMER INPUT PANEL
// -----------------------------------------------------

function ensureFarmInputs() {
  if ($("farmInputs")) return;

  const cropsContainer = $("crops");
  if (!cropsContainer || !cropsContainer.parentNode) return;

  const panel = document.createElement("section");
  panel.id = "farmInputs";

  panel.style.cssText = `
    margin:16px 0;
    padding:16px;
    border:1px solid #d8e6dc;
    border-radius:14px;
    background:#f7faf7;
    color:#203328;
    box-sizing:border-box;
  `;

  panel.innerHTML = `
    <h3 style="margin:0 0 12px;">🌱 Your Farm Details</h3>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;">

      <div>
        <label for="farmState" style="display:block;font-weight:600;margin-bottom:5px;">
          State / Union Territory
        </label>
        <select id="farmState" style="width:100%;padding:11px;border:1px solid #b8cdbd;border-radius:8px;background:white;">
          <option value="">Select state / UT</option>
          ${Object.keys(indiaLocations).map(state =>
            `<option value="${state}">${state}</option>`
          ).join("")}
        </select>
      </div>

      <div>
        <label for="farmDistrict" style="display:block;font-weight:600;margin-bottom:5px;">
          District
        </label>
        <input id="farmDistrict" type="text" maxlength="80"
          placeholder="Enter your district"
          style="width:100%;padding:11px;border:1px solid #b8cdbd;border-radius:8px;box-sizing:border-box;">
      </div>

      <div>
        <label for="farmVillage" style="display:block;font-weight:600;margin-bottom:5px;">
          Village / Town
        </label>
        <input id="farmVillage" type="text" maxlength="100"
          placeholder="Enter village or town"
          style="width:100%;padding:11px;border:1px solid #b8cdbd;border-radius:8px;box-sizing:border-box;">
      </div>

      <div>
        <label for="farmSeason" style="display:block;font-weight:600;margin-bottom:5px;">
          Cropping season
        </label>
        <select id="farmSeason" style="width:100%;padding:11px;border:1px solid #b8cdbd;border-radius:8px;background:white;">
          <option value="">Select season</option>
          <option value="Kharif">Kharif</option>
          <option value="Rabi">Rabi</option>
          <option value="Zaid">Zaid</option>
          <option value="Perennial">Perennial / Year-round</option>
        </select>
      </div>

    </div>

    <div id="seasonInfo" style="margin-top:10px;font-size:0.9em;color:#52665a;"></div>

    <hr style="border:0;border-top:1px solid #d8e6dc;margin:18px 0;">

    <h3 style="margin:0 0 12px;">🧪 Soil pH Test</h3>

    <p style="font-size:0.9em;margin:0 0 12px;color:#52665a;">
      Test your soil using the CropSense pH strip kit, then enter the value shown by the colour chart.
    </p>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;">

      <div>
        <label for="soilPHInput" style="display:block;font-weight:600;margin-bottom:5px;">
          Enter soil pH (0–14)
        </label>
        <input id="soilPHInput" type="number" min="0" max="14" step="0.1"
          placeholder="Example: 6.5"
          inputmode="decimal"
          style="width:100%;padding:11px;border:1px solid #b8cdbd;border-radius:8px;box-sizing:border-box;">
      </div>

      <div>
        <label for="phPhoto" style="display:block;font-weight:600;margin-bottom:5px;">
          Upload pH strip photograph (optional)
        </label>
        <input id="phPhoto" type="file" accept="image/*"
          style="width:100%;padding:8px;border:1px solid #b8cdbd;border-radius:8px;background:white;box-sizing:border-box;">
      </div>

    </div>

    <div id="phPhotoPreview" style="margin-top:10px;"></div>
    <div id="phResult" aria-live="polite" style="margin-top:12px;"></div>

    <div style="margin-top:12px;padding:10px;background:#edf4ee;border-radius:8px;font-size:0.85em;color:#435448;">
      Follow the instructions supplied with your pH kit. A strip photograph is not automatically analysed by this website. For soil treatment decisions, confirm the result with a soil-testing laboratory.
    </div>

    <hr style="border:0;border-top:1px solid #d8e6dc;margin:18px 0;">

    <h3 style="margin:0 0 10px;">🌍 Indian Soil Type</h3>

    <label for="soilTypeSelect" style="display:block;font-weight:600;margin-bottom:6px;">
      Select your soil type
    </label>

    <select id="soilTypeSelect" style="width:100%;padding:11px;border:1px solid #b8cdbd;border-radius:8px;background:white;">
      <option value="Not selected">Choose soil type</option>
      ${indianSoilTypes.map(type =>
        `<option value="${type}">${type}</option>`
      ).join("")}
    </select>

    <p style="font-size:0.85em;margin:8px 0 0;color:#52665a;">
      Select the soil type based on your knowledge or local soil information. This is a farmer input, not a sensor measurement.
    </p>
  `;

  cropsContainer.parentNode.insertBefore(panel, cropsContainer);

  $("farmState").addEventListener("change", () => {
    selectedState = $("farmState").value;
  });

  $("farmSeason").addEventListener("change", () => {
    selectedSeason = $("farmSeason").value;
    renderSeasonInfo();
  });

  $("soilTypeSelect").addEventListener("change", () => {
    selectedSoilType = $("soilTypeSelect").value;
    render();
  });

  $("soilPHInput").addEventListener("input", () => {
    const value = $("soilPHInput").value.trim();

    if (value === "") {
      soilPH = null;
    } else {
      const parsed = Number(value);
      soilPH = Number.isFinite(parsed) && parsed >= 0 && parsed <= 14
        ? parsed
        : null;
    }

    renderPHResult();
    renderSummary();
  });

  $("phPhoto").addEventListener("change", handlePHPhoto);
}

// -----------------------------------------------------
// 11. SEASON INFORMATION
// -----------------------------------------------------

function renderSeasonInfo() {
  const box = $("seasonInfo");
  if (!box) return;

  const season = seasonDatabase[selectedSeason];

  if (season) {
    box.innerHTML = `
      <b>${selectedSeason}</b> · Typical period: ${season.months}<br>
      ${season.description}<br>
      <span>Examples: ${season.crops}</span>
    `;
  } else if (selectedSeason === "Perennial") {
    box.textContent =
      "For perennial crops, consider local climate, water availability and the crop's growth cycle.";
  } else {
    box.textContent = "";
  }
}

// -----------------------------------------------------
// 12. SOIL pH INTERPRETATION
// This is general guidance, not a fertilizer prescription.
// -----------------------------------------------------

function getPHGuidance(value) {
  if (!Number.isFinite(value)) return null;

  if (value < 5.5) {
    return {
      label: "Strongly acidic",
      message:
        "A soil laboratory test can determine whether liming is needed. Agricultural lime may be considered; dolomite may be appropriate if magnesium is also deficient. Do not apply a dose based on pH alone."
    };
  }

  if (value < 6.5) {
    return {
      label: "Moderately acidic",
      message:
        "Check crop requirements and obtain a lime-requirement test before considering agricultural lime. Some crops tolerate mildly acidic soil."
    };
  }

  if (value <= 7.5) {
    return {
      label: "Near-neutral",
      message:
        "pH is in a commonly suitable range for many crops. Do not apply a pH-correcting amendment unless a soil test identifies a need."
    };
  }

  if (value <= 8.5) {
    return {
      label: "Alkaline",
      message:
        "Further soil testing is needed to identify the cause. pH alone cannot confirm sodicity. Do not apply gypsum or sulphur without a suitable soil test and local expert advice."
    };
  }

  return {
    label: "Strongly alkaline",
    message:
      "Seek a laboratory soil test for pH, electrical conductivity and sodicity indicators. A local agricultural expert should determine the appropriate treatment."
  };
}

function renderPHResult() {
  const box = $("phResult");
  if (!box) return;

  if (soilPH === null) {
    box.innerHTML = `
      <span style="color:#64756a;">No valid pH value entered yet.</span>
    `;
    return;
  }

  const guidance = getPHGuidance(soilPH);

  box.innerHTML = `
    <div style="padding:12px;border:1px solid #cbdccf;border-radius:10px;background:white;">
      <div style="font-size:1.1em;font-weight:700;">
        Soil pH: ${soilPH.toFixed(1)}
      </div>
      <div style="font-weight:700;color:#247344;margin-top:4px;">
        ${guidance.label}
      </div>
      <p style="margin:8px 0 0;font-size:0.9em;line-height:1.5;">
        ${guidance.message}
      </p>
    </div>
  `;
}

// -----------------------------------------------------
// 13. pH PHOTO PREVIEW
// The image is not automatically interpreted.
// -----------------------------------------------------

function handlePHPhoto(event) {
  const file = event.target.files && event.target.files[0];
  const preview = $("phPhotoPreview");

  if (!file || !preview) return;

  if (!file.type.startsWith("image/")) {
    preview.textContent = "Please select an image file.";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    preview.textContent = "Please choose an image smaller than 5 MB.";
    event.target.value = "";
    return;
  }

  if (pHPhotoURL) {
    URL.revokeObjectURL(pHPhotoURL);
  }

  pHPhotoURL = URL.createObjectURL(file);

  preview.innerHTML = `
    <div style="padding:10px;border:1px solid #d8e6dc;border-radius:10px;background:white;">
      <b>pH strip photograph selected</b>
      <p style="font-size:0.85em;color:#52665a;margin:5px 0;">
        Use the kit colour chart to read the result and enter the pH value manually.
      </p>
      <img
        src="${pHPhotoURL}"
        alt="Uploaded soil pH test strip"
        style="display:block;max-width:100%;max-height:220px;object-fit:contain;border-radius:8px;margin-top:8px;"
      >
    </div>
  `;
}

// -----------------------------------------------------
// 14. CROP RECOMMENDATION DISPLAY
// -----------------------------------------------------

function renderCrops() {
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

                  ${selectedSoilType !== "Not selected" ? `
                    <small style="
                      display:block;
                      margin-top:7px;
                      font-weight:600;
                      color:${matchesSelectedSoil ? "#247344" : "#a15c16"};
                    ">
                      ${matchesSelectedSoil ? "Suitable" : "Unsuitable"}
                    </small>
                  ` : ""}

                  ${showScores ? `
                    <div class="score">
                      ${c.score}%
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
}

// -----------------------------------------------------
// 15. FIELD SUMMARY
// -----------------------------------------------------

function renderSummary() {
  const m = Number(current.moisture_percent);
  const t = Number(current.temperature);
  const h = Number(current.humidity);

  const locationParts = [
    $("farmVillage")?.value.trim(),
    $("farmDistrict")?.value.trim(),
    selectedState
  ].filter(Boolean);

  const summary = [
    [
      "💧",
      "Soil moisture",
      Number.isFinite(m)
        ? `${moistureStatus(m)[0]} (${Math.round(m)}% on the sensor's calibrated scale).`
        : "Waiting for a valid reading."
    ],
    [
      "🌡️",
      "Temperature",
      Number.isFinite(t)
        ? `${t.toFixed(1)}°C air temperature.`
        : "Waiting for a valid reading."
    ],
    [
      "☁️",
      "Air humidity",
      Number.isFinite(h)
        ? `${h.toFixed(1)}% relative humidity.`
        : "Waiting for a valid reading."
    ],
    [
      "🧪",
      "Soil pH",
      soilPH !== null
        ? `${soilPH.toFixed(1)} — ${getPHGuidance(soilPH).label}`
        : "Enter the result from your soil pH test kit."
    ],
    [
      "📍",
      "Farm location",
      locationParts.length
        ? locationParts.join(", ")
        : "Location not entered."
    ],
    [
      "🌦️",
      "Cropping season",
      selectedSeason || "Season not selected."
    ],
    [
      "🌱",
      "Selected soil type",
      selectedSoilType === "Not selected"
        ? "Soil type not selected."
        : selectedSoilType
    ]
  ];

  if (!$("summary")) return;

  $("summary").innerHTML = summary.map(item => `
    <div class="summary">
      <span>${item[0]}</span>
      <div>
        <b>${item[1]}</b>
        <p>${item[2]}</p>
      </div>
    </div>
  `).join("");
}

// -----------------------------------------------------
// 16. MAIN DASHBOARD
// -----------------------------------------------------

function render() {
  ensureFarmInputs();

  if (!$("moisture")) return;

  const m = Number(current.moisture_percent);
  const t = Number(current.temperature);
  const h = Number(current.humidity);

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

  renderCrops();
  renderSummary();
  renderPoints();
  renderPHResult();
  renderSeasonInfo();
}

// -----------------------------------------------------
// 17. FOUR-POINT FIELD SCANNER
// -----------------------------------------------------

function renderPoints() {
  if (!$("points")) return;

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
  $("doneScan").textContent = scanComplete ? "Completed ✓" : "Done";
  $("savePoint").disabled = savedCount === 4;
}

// -----------------------------------------------------
// 18. SAVE SCANNER POINT
// -----------------------------------------------------

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

// -----------------------------------------------------
// 19. COMPLETE SCAN
// -----------------------------------------------------

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
    "Field scan complete. Crop percentages now use the average of all four samples.";
});

// -----------------------------------------------------
// 20. RESET SCANNER
// -----------------------------------------------------

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

// -----------------------------------------------------
// 21. DEMO MODE
// -----------------------------------------------------

$("demo").addEventListener("click", () => {
  current = { ...demo };

  $("status").textContent = "Demo data";
  $("status").classList.remove("live");

  $("deviceMessage").textContent =
    "Using sample data. This is not a live sensor connection.";

  render();
});

// -----------------------------------------------------
// 22. DIRECT ESP32 CONNECTION
// -----------------------------------------------------

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
      moistureValue == null ||
      tValue == null ||
      hValue == null ||
      ![m, t, h].every(Number.isFinite)
    ) {
      throw new Error(
        "JSON must include numeric moisture, temperature and humidity"
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

// -----------------------------------------------------
// 23. FIELD NAME
// -----------------------------------------------------

$("fieldName").addEventListener("change", () => {
  const name = $("fieldName").value.trim() || "My Field";

  $("fieldName").value = name;
  document.title = `CropSense AI | ${name}`;
});

// -----------------------------------------------------
// 24. FIREBASE LIVE SENSOR LISTENER
// -----------------------------------------------------

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
    moistureValue == null ||
    tValue == null ||
    hValue == null ||
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

// -----------------------------------------------------
// 25. INITIAL DASHBOARD DISPLAY
// -----------------------------------------------------

render();
