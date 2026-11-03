
"use strict";

// =====================================================
// CROPSENSE AI — MAIN WEBSITE APPLICATION
// Team Digital Aura
// Better Choice, Greener Tomorrow.
// =====================================================

const $ = id => document.getElementById(id);

// -----------------------------------------------------
// 1. SENSOR DATA
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
let selectedSoilType = "";
let selectedSeason = "";
let selectedState = "";
let soilPH = null;
let pHPhotoURL = null;

// -----------------------------------------------------
// 2. INDIAN STATES AND UNION TERRITORIES
// -----------------------------------------------------

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
];

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
// 4. AGRICULTURAL SEASONS
// -----------------------------------------------------

const seasonDatabase = {
  Kharif: {
    months: "June – October",
    description: "Generally associated with the monsoon season.",
    crops: "Rice, maize, soybean, cotton, millets and pulses"
  },
  Rabi: {
    months: "October – March",
    description: "Generally associated with the winter season.",
    crops: "Wheat, chickpea, mustard, peas and lentils"
  },
  Zaid: {
    months: "March – June",
    description: "Generally associated with the summer season.",
    crops: "Watermelon, cucumber and selected summer vegetables"
  },
  Perennial: {
    months: "Year-round crop cycle",
    description: "For crops that remain in the field for multiple seasons.",
    crops: "Examples include sugarcane, banana and plantation crops"
  }
};

// -----------------------------------------------------
// 5. CROP DATABASE
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
// These are broad prototype associations.
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
// 7. CROP SEASON GUIDANCE
// Broad prototype screening rules.
// -----------------------------------------------------

const cropSeasonGuide = {
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

// -----------------------------------------------------
// 8. pH SCREENING RANGES
// Broad prototype ranges only.
// -----------------------------------------------------

const defaultPHRange = [5.5, 7.5];

const cropPHGuide = {
  "Rice": [5.0, 7.0],
  "Wheat": [6.0, 7.5],
  "Pearl Millet (Bajra)": [5.5, 8.0],
  "Sorghum (Jowar)": [5.5, 8.0],
  "Chickpea (Chana)": [6.0, 8.0],
  "Cotton": [5.5, 8.0],
  "Sugarcane": [6.0, 7.5],
  "Potato": [5.0, 6.5],
  "Groundnut": [5.5, 7.0],
  "Tea": [4.5, 5.5],
  "Apple": [5.5, 7.0],
  "Coconut": [5.0, 8.0]
};

// -----------------------------------------------------
// 9. CROP CATEGORIES
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
// 10. MOISTURE STATUS
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
// 11. CROP SCORE
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
// 12. FARM INPUT PANEL
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
    <div id="farmLocationSlot"></div>

    <h3 style="margin:0 0 12px;">🌱 Your Farm Details</h3>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;">

      <div>
        <label for="farmState" style="display:block;font-weight:600;margin-bottom:5px;">
          State / Union Territory
        </label>
        <select id="farmState" style="width:100%;padding:11px;border:1px solid #b8cdbd;border-radius:8px;background:white;">
          <option value="">Select state / UT</option>
          ${indianStates.map(state =>
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

    <p style="font-size:0.88em;color:#435448;margin:10px 0 0;">
      Each crop will be marked <b>Suitable</b> or <b>Unsuitable</b> using these three inputs:
      soil pH, soil type and cropping season. The 7-day weather outlook is shown separately
      and also contributes to the preliminary crop ranking.
    </p>

    <div id="suitabilityProgress" aria-live="polite"
      style="margin-top:14px;padding:11px;background:#edf4ee;border-radius:8px;font-size:0.9em;">
      Complete the pH test, cropping season and soil type to check crop suitability.
    </div>

    <hr style="border:0;border-top:1px solid #d8e6dc;margin:18px 0;">

    <!-- SOIL PH TEST -->
    <h3 style="margin:0 0 12px;">🧪 Soil pH Test</h3>

    <p style="font-size:0.9em;margin:0 0 12px;color:#52665a;">
      Test your soil using a pH strip kit, then enter the value shown by its colour chart.
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
      The photograph is only previewed; it is not automatically analysed. Confirm soil treatment decisions with a soil-testing laboratory.
    </div>

    <hr style="border:0;border-top:1px solid #d8e6dc;margin:18px 0;">

    <!-- SOIL TYPE -->
    <h3 style="margin:0 0 10px;">🌍 Indian Soil Type</h3>

    <label for="soilTypeSelect" style="display:block;font-weight:600;margin-bottom:6px;">
      Select your soil type
    </label>

    <select id="soilTypeSelect" style="width:100%;padding:11px;border:1px solid #b8cdbd;border-radius:8px;background:white;">
      <option value="">Choose soil type</option>
      ${indianSoilTypes.map(type =>
        `<option value="${type}">${type}</option>`
      ).join("")}
    </select>

    <p style="font-size:0.85em;margin:8px 0 0;color:#52665a;">
      Select the soil type based on your knowledge or local soil information. This is a farmer input, not a sensor measurement.
    </p>
<hr style="border:0;border-top:1px solid #d8e6dc;margin:18px 0;">

    <hr style="border:0;border-top:1px solid #d8e6dc;margin:18px 0;">

    <!-- WEATHER ADVISOR -->
    <section id="weatherAdvisor">

      <h3 style="margin:0 0 10px;">🌦️ Live Weather & Climate Advisor</h3>

      <p style="font-size:0.9em;color:#52665a;">
        Check current weather and upcoming conditions at your farm location.
      </p>

      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:10px 0;">
        <button id="refreshWeather" type="button"
          style="padding:9px 14px;border:0;border-radius:8px;background:#247344;color:white;cursor:pointer;">
          ↻ Refresh Weather
        </button>
        <small style="color:#52665a;">Weather is fetched automatically after GPS location is detected.</small>
      </div>

      <div id="weatherStatus" aria-live="polite"
        style="padding:12px;background:#edf4ee;border-radius:8px;">
        Waiting for GPS location...
      </div>

      <div id="weatherCurrent" style="margin-top:12px;"></div>

      <div id="weatherForecast" style="margin-top:12px;"></div>
      <div id="weatherCropImpact" aria-live="polite"
        style="margin-top:12px;padding:11px;border:1px solid #d8e6dc;border-radius:9px;background:white;font-size:0.88em;color:#435448;">
        Weather-based crop screening will appear after the farm location forecast loads.
      </div>

      <p style="font-size:0.82em;color:#52665a;">
        Forecasts can change. Always check local weather alerts before
        irrigation, spraying and other farm operations.
      </p>

    </section>
  `;

  cropsContainer.parentNode.insertBefore(panel, cropsContainer);

  $("farmState").addEventListener("change", () => {
    selectedState = $("farmState").value;
    renderFieldSummary();
  });
  $("farmDistrict").addEventListener("input", renderFieldSummary);
  $("farmVillage").addEventListener("input", renderFieldSummary);


  $("farmSeason").addEventListener("change", () => {
    selectedSeason = $("farmSeason").value;
    renderSeasonInfo();
    render();
    renderFieldSummary();
  });

  $("soilTypeSelect").addEventListener("change", () => {
    selectedSoilType = $("soilTypeSelect").value;
    render();
    renderFieldSummary();
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

    render();
    renderFieldSummary();
  });
  $("phPhoto").addEventListener("change", handlePHPhoto);
  $("refreshWeather")?.addEventListener("click", () => {
    if (window.cropSenseLocation) {
      loadFarmWeather(window.cropSenseLocation);
    } else {
      setWeatherStatus("Please detect your farm location first.");
    }
  });

  // If GPS was detected before this panel was created, use it now.
  if (window.cropSenseLocation) {
    applyGPSLocation(window.cropSenseLocation);
  }
}

// -----------------------------------------------------
// 13. SECTION ORDER
// GPS LOCATION → FARM DETAILS → pH → SOIL TYPE
// -----------------------------------------------------

function arrangeFarmSections() {
  const gpsBox = $("gpsLocationBox");
  const locationSlot = $("farmLocationSlot");

  if (!gpsBox || !locationSlot) return;

  // Keep Farm Location at the top of the Farm Inputs panel.
  if (gpsBox.parentNode !== locationSlot) {
    locationSlot.appendChild(gpsBox);
  }
}

function watchGPSPanel() {
  arrangeFarmSections();

  const observer = new MutationObserver(() => {
    arrangeFarmSections();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Stop observing after the GPS panel has been positioned.
  const check = () => {
    if ($("gpsLocationBox") && $("farmInputs")) {
      arrangeFarmSections();
      observer.disconnect();
    }
  };

  check();
}

// -----------------------------------------------------
// 14. GPS LOCATION + LIVE WEATHER INTEGRATION
// -----------------------------------------------------

let weatherRequestId = 0;
let cropWeatherOutlook = null;

function getCoordinates(location) {
  if (!location) return null;

  const latitude = Number(
    location.latitude ?? location.lat ?? location.coords?.latitude
  );
  const longitude = Number(
    location.longitude ?? location.lon ?? location.lng ?? location.coords?.longitude
  );

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 || latitude > 90 ||
    longitude < -180 || longitude > 180
  ) {
    return null;
  }

  return { latitude, longitude };
}

function setWeatherStatus(message, isError = false) {
  const box = $("weatherStatus");
  if (!box) return;
  box.textContent = message;
  box.style.background = isError ? "#fff0ed" : "#edf4ee";
  box.style.color = isError ? "#9b3525" : "#435448";
}

function weatherDescription(code) {
  const descriptions = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Freezing drizzle",
    57: "Heavy freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snowfall",
    73: "Moderate snowfall",
    75: "Heavy snowfall",
    77: "Snow grains",
    80: "Rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Severe thunderstorm with hail"
  };
  return descriptions[Number(code)] || "Weather conditions unavailable";
}

function weatherIcon(code) {
  code = Number(code);
  if (code === 0) return "☀️";
  if ([1, 2].includes(code)) return "🌤️";
  if ([3, 45, 48].includes(code)) return "☁️";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "🌧️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌦️";
}

function showWeatherRankingNote() {
  return "The next 7 days of forecast temperature and rainfall contribute a short-term weather factor to crop ranking when the four-point field scan is complete. This is not a full-season prediction.";
}

async function loadFarmWeather(location) {
  const coords = getCoordinates(location);

  if (!coords) {
    setWeatherStatus(
      "GPS location was detected, but its latitude/longitude is missing. Check that gps-location.js sends coordinates.",
      true
    );
    return;
  }

  const requestId = ++weatherRequestId;
  setWeatherStatus("Fetching current weather and 7-day forecast for your detected location...");

  cropWeatherOutlook = null;
  renderCrops();

  const currentBox = $("weatherCurrent");
  const forecastBox = $("weatherForecast");
  if (currentBox) currentBox.innerHTML = "";
  if (forecastBox) forecastBox.innerHTML = "";

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({
    latitude: String(coords.latitude),
    longitude: String(coords.longitude),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_probability_max,precipitation_sum",
    timezone: "auto",
    forecast_days: "7"
  }).toString();

  try {
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`Weather service returned ${response.status}`);
    const data = await response.json();

    // Ignore an older response if the user has detected a new location.
    if (requestId !== weatherRequestId) return;

    if (!data.current || !data.daily) {
      throw new Error("Weather information was incomplete.");
    }

    const now = data.current;

    // Seven-day outlook used as a short-term weather factor in crop ranking.
    // This is not a full-season climate suitability assessment.
    const dailyMeanTemps = (data.daily.temperature_2m_mean || []).filter(Number.isFinite);
    const dailyRainTotals = (data.daily.precipitation_sum || []).filter(Number.isFinite);
    cropWeatherOutlook = {
      meanTemperature: dailyMeanTemps.length
        ? dailyMeanTemps.reduce((sum, value) => sum + value, 0) / dailyMeanTemps.length
        : null,
      totalRainfall: dailyRainTotals.length
        ? dailyRainTotals.reduce((sum, value) => sum + value, 0)
        : null,
      rainProbability: (data.daily.precipitation_probability_max || [])
        .filter(Number.isFinite)
        .reduce((sum, value, _, arr) => sum + value / arr.length, 0),
      days: data.daily.time.length,
      fetchedAt: Date.now()
    };

    const nowCode = Number(now.weather_code);
    const currentCode = Number(now.weather_code);
    if (currentBox) {
      currentBox.innerHTML = `
        <div style="padding:14px;border:1px solid #d8e6dc;border-radius:12px;background:white;">
          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
            <div style="font-size:2.2em;">${weatherIcon(currentCode)}</div>
            <div>
              <div style="font-size:1.5em;font-weight:800;color:#203328;">${Number(now.temperature_2m).toFixed(1)}°C</div>
              <b>${weatherDescription(currentCode)}</b>
              <div style="font-size:0.82em;color:#64756a;">Feels like ${Number(now.apparent_temperature).toFixed(1)}°C</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(125px,1fr));gap:9px;margin-top:14px;">
            <div style="padding:10px;background:#f3f7f3;border-radius:8px;">💧 <b>${now.relative_humidity_2m}%</b><br><small>Humidity</small></div>
            <div style="padding:10px;background:#f3f7f3;border-radius:8px;">🌧️ <b>${Number(now.precipitation).toFixed(1)} mm</b><br><small>Precipitation</small></div>
            <div style="padding:10px;background:#f3f7f3;border-radius:8px;">💨 <b>${Number(now.wind_speed_10m).toFixed(1)} km/h</b><br><small>Wind speed</small></div>
          </div>
          <small style="display:block;margin-top:10px;color:#64756a;">Updated: ${now.time.replace("T", " ")}</small>
        </div>
      `;
    }

    if (forecastBox) {
      const days = data.daily.time.map((date, index) => ({
        date,
        code: data.daily.weather_code[index],
        max: data.daily.temperature_2m_max[index],
        min: data.daily.temperature_2m_min[index],
        rain: data.daily.precipitation_probability_max[index]
      }));

      forecastBox.innerHTML = `
        <h4 style="margin:14px 0 8px;">📅 7-Day Weather Forecast</h4>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:8px;">
          ${days.map(day => `
            <div style="padding:11px;border:1px solid #d8e6dc;border-radius:10px;background:white;text-align:center;">
              <b>${new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}</b>
              <div style="font-size:1.6em;margin:5px 0;">${weatherIcon(day.code)}</div>
              <small>${weatherDescription(day.code)}</small>
              <div style="margin-top:6px;font-weight:700;">${Number(day.max).toFixed(0)}° / ${Number(day.min).toFixed(0)}°C</div>
              <small>🌧️ Rain chance: ${day.rain == null ? "—" : `${day.rain}%`}</small>
            </div>
          `).join("")}
        </div>
      `;
    }

    const place = [
      location.village_or_locality,
      location.district,
      location.state
    ].filter(Boolean).join(", ");

    setWeatherStatus(
      `Weather loaded for ${place || "your GPS coordinates"} · ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`
    );

    // Refresh crop ordering so the latest forecast is considered.
    renderCrops();

    const impactBox = $("weatherCropImpact");
    if (impactBox && cropWeatherOutlook) {
      const rainText = cropWeatherOutlook.totalRainfall === null
        ? "rainfall total unavailable"
        : `${cropWeatherOutlook.totalRainfall.toFixed(1)} mm expected over ${cropWeatherOutlook.days} days`;
      const tempText = cropWeatherOutlook.meanTemperature === null
        ? "temperature average unavailable"
        : `${cropWeatherOutlook.meanTemperature.toFixed(1)}°C average daily temperature`;
      impactBox.innerHTML = `<b>🌱 Weather impact on crop screening</b><br>
        Forecast input: ${tempText}; ${rainText}.<br>
        ${showWeatherRankingNote()}`;
    }
  } catch (error) {
    if (requestId !== weatherRequestId) return;
    console.error("CropSense weather error:", error);
    cropWeatherOutlook = null;
    renderCrops();
    setWeatherStatus(
      "Unable to load weather. Check your internet connection and try Refresh Weather.",
      true
    );
  }
}

function applyGPSLocation(location) {
  if (!location) return;

  window.cropSenseLocation = location;

  const stateInput = $("farmState");
  const districtInput = $("farmDistrict");
  const villageInput = $("farmVillage");

  if (stateInput && location.state) {
    const match = indianStates.find(
      state => state.toLowerCase() === String(location.state).toLowerCase()
    );
    if (match) {
      stateInput.value = match;
      selectedState = match;
    }
  }

  if (districtInput && location.district) {
    districtInput.value = location.district;
  }

  if (villageInput && location.village_or_locality) {
    villageInput.value = location.village_or_locality;
  }

  renderFieldSummary();
  loadFarmWeather(location);
}

window.addEventListener("cropsense-location-detected", event => {
  applyGPSLocation(event.detail);
});

// -----------------------------------------------------
// 15. SEASON INFORMATION
// -----------------------------------------------------

function renderSeasonInfo() {
  const box = $("seasonInfo");
  if (!box) return;

  const season = seasonDatabase[selectedSeason];

  if (!season) {
    box.textContent = "";
    return;
  }

  box.innerHTML = `
    <b>${selectedSeason}</b> · Typical period: ${season.months}<br>
    ${season.description}<br>
    <span>Examples: ${season.crops}</span>
  `;
}

// -----------------------------------------------------
// 16. SOIL pH INTERPRETATION
// -----------------------------------------------------

function getPHGuidance(value) {
  if (!Number.isFinite(value)) return null;

  if (value < 5.5) {
    return {
      label: "Strongly acidic",
      message:
        "A soil laboratory test can determine whether liming is needed. Do not apply a dose based on pH alone."
    };
  }

  if (value < 6.5) {
    return {
      label: "Moderately acidic",
      message:
        "Check crop requirements and obtain a lime-requirement test before considering agricultural lime."
    };
  }

  if (value <= 7.5) {
    return {
      label: "Near-neutral",
      message:
        "This pH range is commonly suitable for many crops. Do not apply a pH-correcting amendment unless a soil test identifies a need."
    };
  }

  if (value <= 8.5) {
    return {
      label: "Alkaline",
      message:
        "Further testing is needed. pH alone cannot confirm sodicity. Do not apply gypsum or sulphur without suitable soil test results."
    };
  }

  return {
    label: "Strongly alkaline",
    message:
      "Seek laboratory testing for pH, electrical conductivity and sodicity indicators."
  };
}

function renderPHResult() {
  const box = $("phResult");
  if (!box) return;

  if (soilPH === null) {
    box.textContent = "No valid pH value entered yet.";
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
// 17. pH PHOTO PREVIEW
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
        Read the value using the kit colour chart and enter it manually.
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
// 18. SUITABILITY REQUIREMENTS
// All three farmer inputs are mandatory.
// -----------------------------------------------------

function hasAllSuitabilityInputs() {
  const phInput = $("soilPHInput");
  const seasonInput = $("farmSeason");
  const soilInput = $("soilTypeSelect");

  const phText = phInput ? phInput.value.trim() : "";
  const parsedPH = phText === "" ? NaN : Number(phText);

  soilPH = Number.isFinite(parsedPH) && parsedPH >= 0 && parsedPH <= 14
    ? parsedPH
    : null;

  selectedSeason = seasonInput ? seasonInput.value : "";
  selectedSoilType = soilInput ? soilInput.value : "";

  return (
    soilPH !== null &&
    selectedSeason !== "" &&
    selectedSoilType !== ""
  );
}

function getCropSuitability(crop) {
  if (!hasAllSuitabilityInputs()) {
    return {
      status: "pending",
      label: "Awaiting inputs"
    };
  }

  const soilList = cropSoilGuide[crop.name];
  const seasonList = cropSeasonGuide[selectedSeason];

  // Missing information is not the same as unsuitable.
  if (!soilList || !seasonList) {
    return {
      status: "unknown",
      label: "Insufficient data"
    };
  }

  const soilMatches = soilList.includes(selectedSoilType);
  const seasonMatches = seasonList.includes(crop.name);

  const phRange = cropPHGuide[crop.name] || defaultPHRange;
  const phMatches = soilPH >= phRange[0] && soilPH <= phRange[1];

  if (soilMatches && seasonMatches && phMatches) {
    return {
      status: "suitable",
      label: "Suitable"
    };
  }

  return {
    status: "unsuitable",
    label: "Unsuitable"
  };
}

function renderSuitabilityProgress() {
  const box = $("suitabilityProgress");
  if (!box) return;

  const complete = hasAllSuitabilityInputs();

  if (!complete) {
    const missing = [];

    if (soilPH === null) missing.push("pH test result");
    if (!selectedSeason) missing.push("cropping season");
    if (!selectedSoilType) missing.push("Indian soil type");

    box.style.background = "#edf4ee";
    box.textContent =
      `Complete all 3 inputs. Still required: ${missing.join(", ")}.`;
    return;
  }

  box.style.background = "#e5f4e9";
  box.textContent =
    "All 3 inputs completed. Preliminary crop suitability results are displayed.";
}

// -----------------------------------------------------
// WEATHER-BASED CROP SCREENING
// Uses the next 7 days only; not a full-season prediction.
// Rainfall bands are broad category-level screening ranges.
 // -----------------------------------------------------

const shortRangeRainBands = {
  "Cereal": [5, 45],
  "Millet": [0, 30],
  "Pulse": [3, 35],
  "Oilseed/Pulse": [3, 35],
  "Oilseed": [3, 35],
  "Cash crop": [10, 60],
  "Fibre crop": [10, 60],
  "Vegetable": [8, 50],
  "Root crop": [5, 40],
  "Fruit": [8, 55],
  "Plantation crop": [12, 65],
  "Spice": [10, 55]
};

function getWeatherFit(crop) {
  if (
    !cropWeatherOutlook ||
    !Number.isFinite(cropWeatherOutlook.meanTemperature) ||
    !Number.isFinite(cropWeatherOutlook.totalRainfall)
  ) return null;

  const tempDifference = Math.abs(
    cropWeatherOutlook.meanTemperature - crop.targetT
  );
  const temperatureFit = Math.max(0, 100 - tempDifference * 7);

  const band = shortRangeRainBands[crop.category] || [5, 50];
  const rain = cropWeatherOutlook.totalRainfall;
  let rainfallFit = 100;

  if (rain < band[0]) {
    rainfallFit = Math.max(0, 100 - (band[0] - rain) * 2);
  } else if (rain > band[1]) {
    rainfallFit = Math.max(0, 100 - (rain - band[1]) * 1.5);
  }

  return Math.round(temperatureFit * 0.65 + rainfallFit * 0.35);
}

function getWeatherOutlookLabel(fit) {
  if (fit === null) return "Weather forecast not available";
  if (fit >= 80) return "Near-term weather looks favourable";
  if (fit >= 60) return "Review upcoming weather conditions";
  return "Near-term weather may be challenging";
}

// -----------------------------------------------------
// 19. CROP RECOMMENDATION DISPLAY
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
    .map(c => {
      const fieldScore = showScores
        ? score(averageMoisture, averageTemperature, c.targetM, c.targetT)
        : null;
      const weatherFit = getWeatherFit(c);

      // Weather contributes 25% of the combined ranking only when
      // the four-point field scan and location forecast are both available.
      const combinedScore = showScores && weatherFit !== null
        ? Math.round(fieldScore * 0.75 + weatherFit * 0.25)
        : fieldScore;

      return {
        ...c,
        fieldScore,
        weatherFit,
        score: combinedScore
      };
    })
    .sort((a, b) => {
      if (!showScores) return a.name.localeCompare(b.name);
      return b.score - a.score;
    });

  $("crops").innerHTML = Object.entries(cropCategories)
    .map(([title, types]) => {
      const items = cropData.filter(c =>
        types.includes(c.category)
      ).slice(0, 10);

      if (!items.length) return "";

      return `
        <section class="crop-category">
          <h3>${title}</h3>
          <div class="crop-row">
            ${items.map(c => {
              const result = getCropSuitability(c);

              let statusHTML = "";

              if (result.status === "suitable") {
                statusHTML = `
                  <small style="display:block;margin-top:7px;font-weight:700;color:#247344;">
                    Suitable
                  </small>
                `;
              } else if (result.status === "unsuitable") {
                statusHTML = `
                  <small style="display:block;margin-top:7px;font-weight:700;color:#b34b35;">
                    Unsuitable
                  </small>
                `;
              } else if (result.status === "unknown") {
                statusHTML = `
                  <small style="display:block;margin-top:7px;font-weight:600;color:#8a651c;">
                    Insufficient data
                  </small>
                `;
              } else {
                statusHTML = `
                  <small style="display:block;margin-top:7px;color:#64756a;">
                    Complete all 3 inputs
                  </small>
                `;
              }

              return `
                <article class="crop crop-card">
                  <div class="cropicon">${c.emoji}</div>
                  <b>${c.name}</b>
                  <span class="crop-type">${c.category}</span>

                  ${statusHTML}

                  ${c.weatherFit !== null ? `
                    <small style="display:block;margin-top:5px;color:#52665a;">
                      🌦️ Weather outlook: ${getWeatherOutlookLabel(c.weatherFit)}
                    </small>
                  ` : `
                    <small style="display:block;margin-top:5px;color:#7a7465;">
                      🌦️ Weather outlook: Waiting for 7-day forecast
                    </small>
                  `}

                  ${showScores ? `
                    <div class="score">${c.score}%</div>
                    <small style="display:block;margin-top:4px;color:#52665a;">
                      ${c.weatherFit === null
                        ? "Field-condition score"
                        : `Combined field + weather score · Weather fit ${c.weatherFit}%`}
                    </small>
                  ` : (c.weatherFit !== null ? `
                    <small style="display:block;margin-top:5px;color:#52665a;">
                      ${getWeatherOutlookLabel(c.weatherFit)}
                    </small>
                  ` : "")}
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
// FIELD SUMMARY
// -----------------------------------------------------

function renderFieldSummary() {
  const box = $("summary");
  if (!box) return;

  const moisture = Number(current.moisture_percent);
  const temperature = Number(current.temperature);
  const humidity = Number(current.humidity);
  const savedPoints = points.filter(point => point.saved).length;
  const locationParts = [
    $("farmVillage")?.value.trim(),
    $("farmDistrict")?.value.trim(),
    selectedState
  ].filter(Boolean);

  const items = [
    ["💧", "Soil moisture", Number.isFinite(moisture) ? `${moisture.toFixed(0)}%` : "Waiting for sensor"],
    ["🌡️", "Air temperature", Number.isFinite(temperature) ? `${temperature.toFixed(1)} °C` : "Waiting for sensor"],
    ["☁️", "Air humidity", Number.isFinite(humidity) ? `${humidity.toFixed(1)}%` : "Waiting for sensor"],
    ["🧪", "Soil pH", soilPH !== null ? soilPH.toFixed(1) : "Not entered"],
    ["🌍", "Soil type", selectedSoilType || "Not selected"],
    ["🌱", "Cropping season", selectedSeason || "Not selected"],
    ["📍", "Farm location", locationParts.length ? locationParts.join(", ") : "Awaiting GPS / manual entry"],
    ["📡", "Field scan", `${savedPoints}/4 points recorded${scanComplete ? " · Complete" : ""}`]
  ];

  box.innerHTML = items.map(([icon, label, value]) => `
    <div style="display:flex;gap:10px;align-items:flex-start;padding:12px;border:1px solid #d8e6dc;border-radius:10px;background:white;min-width:0;">
      <span style="font-size:1.35em;">${icon}</span>
      <div style="min-width:0;">
        <b style="display:block;color:#203328;font-size:0.9em;">${label}</b>
        <span style="display:block;color:#52665a;font-size:0.88em;overflow-wrap:anywhere;">${value}</span>
      </div>
    </div>
  `).join("");
}

// -----------------------------------------------------
// 20. MAIN DASHBOARD
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
  renderPoints();
  renderFieldSummary();
  renderPHResult();
  renderSeasonInfo();
  renderSuitabilityProgress();
}

// -----------------------------------------------------
// 22. FOUR-POINT FIELD SCANNER
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
// 23. SAVE SCANNER POINT
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
// 24. COMPLETE SCAN
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
    "Field scan complete. Crop percentages use the average of all four samples.";
});

// -----------------------------------------------------
// 25. RESET SCANNER
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
// 26. DEMO MODE
// -----------------------------------------------------

$("demo").addEventListener("click", () => {
  current = { ...demo };

  $("status").textContent = "Demo data";
  $("status").classList.remove("live");

  if ($("deviceMessage")) {
    $("deviceMessage").textContent =
      "Using sample data. This is not a live sensor connection.";
  }

  render();
});

// -----------------------------------------------------
// 27. DIRECT ESP32 CONNECTION REMOVED
// Sensor readings are received through Firebase.
// -----------------------------------------------------

// -----------------------------------------------------
// 28. FIELD NAME
// -----------------------------------------------------

$("fieldName").addEventListener("change", () => {
  const name = $("fieldName").value.trim() || "My Field";

  $("fieldName").value = name;
  document.title = `CropSense AI | ${name}`;
});

// -----------------------------------------------------
// 29. FIREBASE LIVE SENSOR LISTENER
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

  if ($("deviceMessage")) {
    $("deviceMessage").textContent =
      "Live sensor readings are updating from Firebase.";
  }

  render();

  console.log("CropSense dashboard updated:", current);
});


// -----------------------------------------------------
// PROJECT INFORMATION — placed after the Contributions section
// -----------------------------------------------------

function addCropSenseProjectInformation() {
  if ($("cropSenseProjectInfo")) return;

  const section = document.createElement("section");
  section.id = "cropSenseProjectInfo";
  section.style.cssText = `
    margin:28px 0 18px;
    padding:24px;
    border:1px solid #d8e6dc;
    border-radius:16px;
    background:linear-gradient(135deg,#f5faf5,#edf5ef);
    color:#203328;
    line-height:1.65;
    box-sizing:border-box;
  `;

  section.innerHTML = `
    <div style="max-width:1000px;margin:auto;">
      <div style="font-size:0.82em;font-weight:800;letter-spacing:1.5px;color:#247344;text-transform:uppercase;">
        About Our Innovation
      </div>
      <h2 style="margin:6px 0 10px;font-size:1.65em;">🌱 CropSense AI — Better Choice, Greener Tomorrow.</h2>
      <p>
        <b>CropSense AI</b> is a smart agriculture prototype developed by <b>Team Digital Aura</b>.
        It is designed to help farmers and new landowners make more informed crop-selection
        decisions by bringing field observations, soil information and local weather together
        in one easy-to-use website.
      </p>

      <h3 style="margin:18px 0 6px;">The problem we want to solve</h3>
      <p>
        Choosing a crop only from habit or guesswork can create avoidable risks. A field's
        soil type, moisture condition, pH, temperature, season and water availability all
        influence which crops may be worth considering. CropSense AI aims to make these
        factors easier to view before a farmer makes a decision.
      </p>

      <h3 style="margin:18px 0 6px;">How CropSense AI works</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;margin-top:10px;">
        <div style="padding:13px;background:white;border:1px solid #dce8de;border-radius:10px;">
          <b>1. Field sensing</b><br>
          An ESP32-based prototype collects soil-moisture sensor readings and DHT22 air temperature and humidity.
        </div>
        <div style="padding:13px;background:white;border:1px solid #dce8de;border-radius:10px;">
          <b>2. Live data transfer</b><br>
          Sensor readings are sent to Firebase Realtime Database and displayed on the website.
        </div>
        <div style="padding:13px;background:white;border:1px solid #dce8de;border-radius:10px;">
          <b>3. Farm information</b><br>
          The user can enter soil type, manually measured pH and cropping season, and allow GPS to identify the location.
        </div>
        <div style="padding:13px;background:white;border:1px solid #dce8de;border-radius:10px;">
          <b>4. Weather and crop guidance</b><br>
          Local weather forecasts and preliminary crop-screening results help users compare field conditions.
        </div>
      </div>

      <h3 style="margin:18px 0 6px;">What makes the project useful?</h3>
      <ul style="padding-left:22px;margin:6px 0;">
        <li>Combines field sensor readings with farmer-provided soil and season information.</li>
        <li>Uses a four-point scan to compare readings from different spots in the field.</li>
        <li>Displays live weather and a seven-day forecast after location detection.</li>
        <li>Presents crop options in a simple, accessible dashboard.</li>
        <li>Encourages data-informed farming decisions rather than relying only on guesswork.</li>
      </ul>

      <h3 style="margin:18px 0 6px;">Our vision</h3>
      <p>
        Our vision is to make practical agricultural technology easier to understand and
        accessible to more farmers. We hope to develop CropSense AI further with better
        field validation, more reliable crop data and guidance suited to local agricultural
        conditions.
      </p>

      <div style="margin-top:16px;padding:12px 14px;border-left:4px solid #247344;background:white;border-radius:8px;">
        <b>Team Digital Aura</b><br>
        <span style="color:#247344;font-weight:700;">Better Choice, Greener Tomorrow.</span>
      </div>
    </div>
  `;

  const contribution = document.querySelector(
    '[id*="contribution" i], [class*="contribution" i], #contributors, .contributors'
  );
  const footer = document.querySelector("footer");

  if (contribution) {
    contribution.insertAdjacentElement("afterend", section);
  } else if (footer && footer.parentNode) {
    footer.parentNode.insertBefore(section, footer);
  } else {
    document.body.appendChild(section);
  }
}

// -----------------------------------------------------
// 30. INITIAL DISPLAY
// -----------------------------------------------------

render();
watchGPSPanel();
addCropSenseProjectInformation();

if (window.cropSenseLocation) {
  applyGPSLocation(window.cropSenseLocation);
}
