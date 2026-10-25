# CropSense AI Farmer App v2

## Run it
1. Unzip the folder on your Mac.
2. Double-click `index.html` to open it in a modern browser.
3. The app starts with sample/demo data.

## Features
- Mobile-friendly farmer dashboard
- Soil moisture, air temperature and humidity cards
- Manual multi-point log for A, B, C and D
- Illustrative crop suggestion ranking
- Field summary, plant-care tips and soil pH warning
- URL field prepared for future ESP32 JSON endpoint

## Important limitations
- Current readings are demo data unless connected to a compatible live endpoint.
- The sensor sketch currently prints to Serial Monitor; Wi-Fi JSON server code is the next step.
- The app expects JSON fields `moisture_percent`, `temperature`, and `humidity`; optional fields are `moisture_raw` and `point`.
- Browser requests can be blocked by CORS or by opening the app directly as a local file. For live mode, we may need to serve the app over HTTP and configure the ESP32 endpoint.
- Crop ranking is a demonstration heuristic, not a validated agronomic model. Do not make planting, irrigation, or fertilizer decisions from it alone.
- Soil pH is not measured because no pH sensor is available. Confirm crop choices with local agriculture experts and use soil testing for pH/nutrients.
- Calibrate the soil moisture sensor using your own sensor and soil before interpreting its percentage.

## Next step
Add ESP32 Wi-Fi and `/data` JSON endpoint firmware, then test live readings.
