
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

    <!-- SOIL HEALTH AND TREATMENT ADVISOR -->
    <section id="soilHealthAdvisor">

      <h3 style="margin:0 0 10px;">🌱 Soil Health & Treatment Advisor</h3>

      <p style="font-size:0.9em;color:#52665a;">
        Enter additional laboratory soil-test results to understand
        soil problems and possible corrective measures.
      </p>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">

        <div>
          <label for="soilECInput" style="display:block;font-weight:600;margin-bottom:5px;">
            Soil EC (dS/m)
          </label>
          <input id="soilECInput" type="number" min="0" step="0.01"
            placeholder="Optional laboratory value"
            style="width:100%;padding:11px;border:1px solid #b8cdbd;border-radius:8px;box-sizing:border-box;">
        </div>

        <div>
          <label for="soilESPInput" style="display:block;font-weight:600;margin-bottom:5px;">
            ESP (%)
          </label>
          <input id="soilESPInput" type="number" min="0" step="0.1"
            placeholder="Optional laboratory value"
            style="width:100%;padding:11px;border:1px solid #b8cdbd;border-radius:8px;box-sizing:border-box;">
        </div>

        <div>
          <label for="gypsumRequirement" style="display:block;font-weight:600;margin-bottom:5px;">
            Gypsum requirement (t/ha)
          </label>
          <input id="gypsumRequirement" type="number" min="0" step="0.1"
            placeholder="Laboratory-recommended value"
            style="width:100%;padding:11px;border:1px solid #b8cdbd;border-radius:8px;box-sizing:border-box;">
        </div>

      </div>

      <div id="soilTreatmentResult" aria-live="polite"
        style="margin-top:14px;padding:12px;background:#edf4ee;border-radius:8px;">
        Enter soil pH and laboratory results to receive preliminary soil treatment guidance.
      </div>

      <p style="font-size:0.82em;color:#52665a;">
        Important: pH alone cannot determine gypsum or sulphur dosage.
        Follow laboratory recommendations before applying soil amendments.
      </p>

    </section>

    <hr style="border:0;border-top:1px solid #d8e6dc;margin:18px 0;">

    <!-- WEATHER ADVISOR -->
    <section id="weatherAdvisor">

      <h3 style="margin:0 0 10px;">🌦️ Live Weather & Climate Advisor</h3>

      <p style="font-size:0.9em;color:#52665a;">
        Check current weather and upcoming conditions at your farm location.
      </p>

      <div id="weatherStatus" aria-live="polite"
        style="padding:12px;background:#edf4ee;border-radius:8px;">
        Waiting for farm location...
      </div>

      <div id="weatherCurrent" style="margin-top:12px;"></div>

      <div id="weatherForecast" style="margin-top:12px;"></div>

      <p style="font-size:0.82em;color:#52665a;">
        Forecasts can change. Always check local weather alerts before
        irrigation, spraying and other farm operations.
      </p>

    </section>
  `;

  cropsContainer.parentNode.insertBefore(panel, cropsContainer);

  $("farmState").addEventListener("change", () => {
    selectedState = $("farmState").value;
    renderSummary();
  });

  $("farmDistrict").addEventListener("input", renderSummary);
  $("farmVillage").addEventListener("input", renderSummary);

  $("farmSeason").addEventListener("change", () => {
    selectedSeason = $("farmSeason").value;
    renderSeasonInfo();
    render();
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

    render();
  });
}
  $("phPhoto").addEventListener("change", handlePHPhoto);

  // If GPS location was already detected, fill the farm fields.
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
// 14. GPS LOCATION INTEGRATION
// -----------------------------------------------------

function applyGPSLocation(location) {
  if (!location) return;

  const stateInput = $("farmState");
  const districtInput = $("farmDistrict");
  const villageInput = $("farmVillage");

  if (stateInput && location.state) {
    const match = indianStates.find(
      state => state.toLowerCase() === location.state.toLowerCase()
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

  renderSummary();
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

                  ${showScores ? `
                    <div class="score">${c.score}%</div>
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
// 20. FIELD SUMMARY
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
      selectedSoilType || "Soil type not selected."
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
// 21. MAIN DASHBOARD
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
// 30. INITIAL DISPLAY
// -----------------------------------------------------

render();
watchGPSPanel();
