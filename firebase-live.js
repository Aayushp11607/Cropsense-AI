
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import {
  getAuth,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Replace these placeholders with values from Firebase Console.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

signInAnonymously(auth)
  .then(() => {
    console.log("CropSense AI Firebase connected.");

    onValue(ref(db, "cropsense/latest"), (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        console.log("Waiting for ESP32 sensor readings...");
        return;
      }

      console.log("Live sensor data:", data);

      // We'll connect these values to the dashboard next.
      window.dispatchEvent(
        new CustomEvent("cropsense-live-data", { detail: data })
      );
    });
  })
  .catch((error) => {
    console.error("Firebase connection failed:", error);
  });
