
"use strict";

// CropSense AI - GPS Location Detection
// This identifies an approximate address from GPS coordinates.
// It does NOT verify official village boundaries.

(function () {
  const style = document.createElement("style");
  style.textContent = `
    #gpsLocationBox {
      padding: 16px;
      margin: 18px 0;
      border: 1px solid #d8e3d8;
      border-radius: 12px;
      background: #f8fcf8;
    }
    #gpsDetectButton {
      padding: 11px 16px;
      border: 0;
      border-radius: 8px;
      background: #237a45;
      color: white;
      font-weight: 600;
      cursor: pointer;
    }
    #gpsDetectButton:disabled {
      opacity: .6;
      cursor: wait;
    }
    #gpsLocationResult {
      margin-top: 12px;
      line-height: 1.7;
      overflow-wrap: anywhere;
    }
    #gpsLocationResult .gps-note {
      color: #666;
      font-size: 12px;
    }
  `;
  document.head.appendChild(style);

  function createLocationBox() {
    if (document.getElementById("gpsLocationBox")) return;

    const box = document.createElement("section");
    box.id = "gpsLocationBox";

    box.innerHTML = `
      <h3>📍 Farm Location</h3>
      <p>Detect your approximate location using your phone's GPS.</p>
      <button id="gpsDetectButton" type="button">
        Detect My Location
      </button>
      <div id="gpsLocationResult" aria-live="polite">
        Location not detected yet.
      </div>
    `;

    const cropSection = document.getElementById("crops");
    if (cropSection && cropSection.parentNode) {
      cropSection.parentNode.insertBefore(box, cropSection);
    } else {
      document.body.appendChild(box);
    }

    document
      .getElementById("gpsDetectButton")
      .addEventListener("click", detectLocation);
  }

  function showMessage(message) {
    document.getElementById("gpsLocationResult").textContent = message;
  }

  async function detectLocation() {
    const button = document.getElementById("gpsDetectButton");
    button.disabled = true;
    button.textContent = "Detecting location...";

    try {
      if (!("geolocation" in navigator)) {
        throw new Error("GPS location is not supported by this browser.");
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 60000
          }
        );
      });

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const accuracy = Math.round(position.coords.accuracy);

      showMessage("GPS received. Finding the approximate address...");

      const url = new URL(
        "https://api.bigdatacloud.net/data/reverse-geocode-client"
      );

      url.searchParams.set("latitude", latitude);
      url.searchParams.set("longitude", longitude);
      url.searchParams.set("localityLanguage", "en");

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error("The location service could not respond.");
      }

      const data = await response.json();

      const location = {
        latitude,
        longitude,
        accuracy_meters: accuracy,
        village_or_locality:
          data.locality || data.localityInfo?.informative?.[0]?.name || "",
        city_or_town:
          data.city || data.locality || "",
        district:
          data.city || data.localityInfo?.administrative?.find(
            item => /district/i.test(item.description || "")
          )?.name || "",
        state: data.principalSubdivision || "",
        state_code: data.principalSubdivisionCode || "",
        country: data.countryName || "",
        source: "Reverse-geocoded GPS estimate",
        boundary_verified: false
      };

      window.cropSenseLocation = location;

      const result = document.getElementById("gpsLocationResult");
      result.replaceChildren();

      const rows = [
        ["Village / Locality", location.village_or_locality],
        ["Town / City", location.city_or_town],
        ["District", location.district],
        ["State", location.state],
        ["Country", location.country],
        ["GPS accuracy", `About ${accuracy} metres`]
      ];

      rows.forEach(([label, value]) => {
        const line = document.createElement("div");
        const strong = document.createElement("strong");
        strong.textContent = label + ": ";
        line.append(strong, document.createTextNode(value || "Not available"));
        result.appendChild(line);
      });

      const note = document.createElement("p");
      note.className = "gps-note";
      note.textContent =
        "Approximate location from a location service. " +
        "Village boundaries and LGD codes have not been verified.";
      result.appendChild(note);

      document.dispatchEvent(
        new CustomEvent("cropsense-location-detected", {
          detail: location
        })
      );

    } catch (error) {
      let message = error.message;

      if (error.code === 1) {
        message = "Location permission denied. Please allow location access.";
      } else if (error.code === 2) {
        message = "Your current location could not be determined.";
      } else if (error.code === 3) {
        message = "GPS request timed out. Please try again outdoors.";
      }

      showMessage(message);
    } finally {
      button.disabled = false;
      button.textContent = "Detect My Location";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createLocationBox);
  } else {
    createLocationBox();
  }
})();
