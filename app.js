const $=id=>document.getElementById(id);
const demo={moisture_raw:2470,moisture_percent:35,temperature:27.8,humidity:54.2,point:"A"};
let current={...demo};
let points=[{name:"A",moisture:35,temp:27.8,saved:true},{name:"B",moisture:42,temp:28.4,saved:true},{name:"C",moisture:29,temp:29.1,saved:true},{name:"D",moisture:null,temp:null,saved:false}];
function moistureStatus(v){if(v<25)return["Low","Soil may be dry. Check root-zone moisture and crop needs before watering."];if(v<45)return["Moderate-low","Compare readings at other points and check crop water needs."];if(v<=75)return["Moderate","Middle range for this prototype; crop requirements vary."];return["High","Check drainage; different crops need different moisture levels."];}
function render(){
 const m=Number(current.moisture_percent),t=Number(current.temperature),h=Number(current.humidity);
 $("moisture").textContent=Number.isFinite(m)?Math.round(m):"--";$("temp").textContent=Number.isFinite(t)?t.toFixed(1):"--";$("humidity").textContent=Number.isFinite(h)?h.toFixed(1):"--";
 $("moistureNote").textContent=Number.isFinite(m)?moistureStatus(m)[0]:"Unavailable";
 $("moistureBar").style.width=Math.max(0,Math.min(100,m||0))+"%";$("tempBar").style.width=Math.max(0,Math.min(100,(t||0)*2))+"%";$("humidityBar").style.width=Math.max(0,Math.min(100,h||0))+"%";
 const cropData=[{name:"Maize",emoji:"🌽",targetM:48,targetT:30,why:"Compare with local season, variety and water availability."},{name:"Pearl millet",emoji:"🌾",targetM:30,targetT:31,why:"May be worth considering in some drier regions and seasons."},{name:"Soybean",emoji:"🫘",targetM:52,targetT:27,why:"Check season, soil type, drainage and local variety guidance."}].map(c=>({...c,score:score(m,t,c.targetM,c.targetT)})).sort((a,b)=>b.score-a.score);
 $("crops").innerHTML=cropData.map(c=>`<div class="crop"><div class="cropicon">${c.emoji}</div><div><b>${c.name}</b><p>${c.why}</p></div><div class="score">${c.score}%<small>demo match</small></div></div>`).join("");
 const summary=[["💧","Soil moisture",Number.isFinite(m)?`${moistureStatus(m)[0]} (${Math.round(m)}% on the sensor's calibrated scale). ${moistureStatus(m)[1]}`:"Waiting for reading."],["🌡️","Temperature",Number.isFinite(t)?`${t.toFixed(1)}°C air temperature. Compare with local seasonal guidance.`:"Waiting for reading."],["☁️","Air humidity",Number.isFinite(h)?`${h.toFixed(1)}% relative humidity; this is not soil moisture.`:"Waiting for reading."],["🧪","Soil pH","Not measured: a compatible pH sensor or laboratory soil test is needed."]];
 $("summary").innerHTML=summary.map(x=>`<div class="summary"><span>${x[0]}</span><div><b>${x[1]}</b><p>${x[2]}</p></div></div>`).join("");
 renderPoints();
}
function score(m,t,targetM,targetT){if(!Number.isFinite(m)||!Number.isFinite(t))return 0;return Math.round(Math.max(0,100-Math.abs(m-targetM)*1.5)*.65+Math.max(0,100-Math.abs(t-targetT)*9)*.35);}
function renderPoints(){
 $("points").innerHTML=points.map(p=>`<div class="point ${p.name===current.point?"active":""}"><b>${p.name}</b><div>${p.saved?p.moisture+"% moisture":"Not scanned"}</div><small>${p.saved&&Number.isFinite(p.temp)?p.temp.toFixed(1)+"°C":"Move probe here"}</small></div>`).join("");
 $("scanCount").textContent=points.filter(p=>p.saved).length+"/4 points";
}
$("savePoint").addEventListener("click",()=>{const p=points.find(p=>!p.saved);if(!p){$("scanMessage").textContent="All four points have readings. Reset points to scan again.";return;}p.moisture=Math.round(Number(current.moisture_percent));p.temp=Number(current.temperature);p.saved=true;current.point=p.name;render();$("scanMessage").textContent=`Saved current reading at Point ${p.name}. Move the probe to the next point.`;});
$("resetPoints").addEventListener("click",()=>{points=points.map(p=>({name:p.name,moisture:null,temp:null,saved:false}));points[0]={name:"A",moisture:Math.round(Number(current.moisture_percent)),temp:Number(current.temperature),saved:true};current.point="A";render();$("scanMessage").textContent="Scan reset. Point A contains the current reading; continue to B, C and D.";});
$("demo").addEventListener("click",()=>{current={...demo};$("status").textContent="Demo data";$("status").classList.remove("live");$("deviceMessage").textContent="Using sample data. This is not a live sensor connection.";render();});
$("connect").addEventListener("click",async()=>{const url=$("deviceUrl").value.trim();if(!url){$("deviceMessage").textContent="Enter the ESP32 data URL. The Wi-Fi JSON endpoint must be configured in the firmware first.";return;}try{$("deviceMessage").textContent="Requesting readings…";const r=await fetch(url,{cache:"no-store"});if(!r.ok)throw Error("HTTP "+r.status);const d=await r.json();const m=Number(d.moisture_percent),t=Number(d.temperature),h=Number(d.humidity);if(![m,t,h].every(Number.isFinite))throw Error("JSON must include numeric moisture_percent, temperature and humidity");current={moisture_raw:Number(d.moisture_raw),moisture_percent:m,temperature:t,humidity:h,point:String(d.point||"A")};$("status").textContent="ESP32 connected";$("status").classList.add("live");$("deviceMessage").textContent="Live readings received. Refresh again to request updated readings.";render();}catch(e){$("status").textContent="Not connected";$("status").classList.remove("live");$("deviceMessage").textContent="Could not read ESP32: "+e.message+". Check Wi-Fi, URL, firmware endpoint and browser CORS settings."; }});
$("fieldName").addEventListener("change",()=>{const n=$("fieldName").value.trim()||"My Field";$("fieldName").value=n;document.title="CropSense AI | "+n;});

window.addEventListener("cropsense-live-data", (event) => {
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
    moisture_raw: Number(d.moisture_raw),
    moisture_percent: m,
    temperature: t,
    humidity: h,
    point: "A"
  };

  $("status").textContent = "Live Firebase";
  $("status").classList.add("live");
  $("deviceMessage").textContent =
    "Live sensor readings are updating from Firebase.";

  render();
  console.log("CropSense dashboard updated:", current);
});

render();

