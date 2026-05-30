// 🌤️ Dynamic Background + Clouds
const setDynamicBackground = () => {
  const hour = new Date().getHours();
  const bg = document.querySelector(".bg-fixed");
  const body = document.body;
  const clouds = document.querySelector(".clouds");

  if (!bg) return;

  bg.className = "bg-fixed";
  body.classList.remove("night-mode");

  if (clouds) clouds.style.display = "none";

  if (hour >= 5 && hour < 11) {
    bg.classList.add("bg-morning");
    if (clouds) clouds.style.display = "block";
  } else if (hour >= 11 && hour < 16) {
    bg.classList.add("bg-afternoon");
  } else if (hour >= 16 && hour < 19) {
    bg.classList.add("bg-evening");
    if (clouds) {
      clouds.style.display = "block";
      clouds.style.opacity = "0.2";
    }
  } else {
    bg.classList.add("bg-night");
    body.classList.add("night-mode");
  }
};

//  Rain
let lightningInterval;

const createRain = (count = 100) => {
  const rain = document.querySelector(".rain");
  if (!rain) return;

  rain.innerHTML = "";

  for (let i = 0; i < count; i++) {
    const drop = document.createElement("div");
    drop.className = "drop";
    drop.style.left = Math.random() * 100 + "vw";
    drop.style.animationDuration = 0.5 + Math.random() + "s";
    rain.appendChild(drop);
  }
};

const stopRain = () => {
  const rain = document.querySelector(".rain");
  if (rain) rain.innerHTML = "";

  clearInterval(lightningInterval);
};

//  Lightning
const createLightning = () => {
  const container = document.querySelector(".lightning");
  if (!container) return;

  const flash = document.createElement("div");
  flash.className = "flash";
  container.appendChild(flash);

  setTimeout(() => flash.remove(), 200);
};

//  Weather API
const getWeatherByCoords = async (lat, lon, cityName) => {
  try {
    setDynamicBackground();

    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m&daily=temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`,
    );

    const data = await res.json();
    

  const rainCodes = [51, 53, 55, 61, 63, 65, 80, 81, 82];

  const isRaining = rainCodes.includes(data.current_weather.weathercode);

    //  ab isRaining use kar
    if (isRaining) {
      createRain(120);

      clearInterval(lightningInterval);
      lightningInterval = setInterval(() => {
        if (Math.random() < 0.4) createLightning();
      }, 3000);
    } else {
      stopRain();
    }
    if (map && marker) {
      map.setView([lat, lon], 8);

      marker
        .setLatLng([lat, lon])
        .bindPopup(
          `
       ${cityName} <br>
       ${data.current_weather.temperature}°C
    `,
        )
        .openPopup();
    }

    // UI update
    document.getElementById("cityName").innerHTML =
      `<i class="bi bi-geo-alt-fill"></i> ${cityName}`;

    document.getElementById("temp").innerText =
      data.current_weather.temperature + " °C";

    document.getElementById("min_temp").innerText =
      data.daily.temperature_2m_min[0] + " °C";

    document.getElementById("max_temp").innerText =
      data.daily.temperature_2m_max[0] + " °C";
    document.getElementById("detailWind").innerText =
      data.current_weather.windspeed;
    // compass update
    updateWindUI(data.current_weather.winddirection);
    console.log("Wind Degree:", data.current_weather.winddirection);

    const currentTime = new Date(data.current_weather.time);

    // find closest time index
    let closestIndex = 0;
    let minDiff = Infinity;

    data.hourly.time.forEach((t, index) => {
      const diff = Math.abs(new Date(t) - currentTime);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = index;
      }
    });

    document.getElementById("humidity").innerText =
      data.hourly.relativehumidity_2m[closestIndex] + " %";

    //  REAL UV INDEX
    const uv = data.daily.uv_index_max[0];

    document.getElementById("uvIndex").innerText = uv;

    let uvText = "Low";
    let uvAdvice = "Safe to go outside.";

    if (uv >= 3 && uv < 6) {
      uvText = "Moderate";
      uvAdvice = "Use sunglasses and sunscreen outdoors.";
    } else if (uv >= 6 && uv < 8) {
      uvText = "High";
      uvAdvice = "Reduce direct sun exposure.";
    } else if (uv >= 8) {
      uvText = "Extreme";
      uvAdvice = "Avoid going outside during peak hours.";
    }

    document.getElementById("uvLevel").innerText = uvText;

    document.getElementById("uvAdvice").innerText = uvAdvice;

    //  DETAILS SECTION UPDATE

    document.getElementById("detailTemp").innerText =
      data.current_weather.temperature + "°";

    document.getElementById("detailFeels").innerText =
      data.current_weather.temperature + 4 + "°";

    document.getElementById("detailActual").innerText =
      data.current_weather.temperature + "°";

    document.getElementById("detailHumidity").innerText =
      data.hourly.relativehumidity_2m[closestIndex] + "%";

    const weatherCode = data.current_weather.weathercode;

    if (weatherCode <= 3) {
      document.getElementById("cloudText").innerText = "Sunny";
    } else {
      document.getElementById("cloudText").innerText = "Cloudy";
    }

    document.getElementById("errorMsg").innerText = "";
  } catch {
    document.getElementById("errorMsg").innerText = "⚠️ Weather error";
  }
};

//  City search
const getWeather = async (city) => {
  try {
    const geo = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}`,
    );
    const data = await geo.json();

    if (!data.results) return alert("City not found");

    const place = data.results[0];

    localStorage.setItem("lastCity", place.name);

    //  ADD THIS (MAP SYNC)
    if (typeof map !== "undefined" && typeof marker !== "undefined") {
      map.flyTo([place.latitude, place.longitude], 8, {
        animate: true,
        duration: 1.5,
      });

      marker.setLatLng([place.latitude, place.longitude]);
    }

    // existing call
    getWeatherByCoords(place.latitude, place.longitude, place.name);
  } catch {
    alert("Search error");
  }
};

//  Common cities
const loadCommonPlaces = async () => {
  const cities = ["Delhi", "Mumbai", "Kolkata", "Chennai", "Bangalore"];
  const table = document.getElementById("commonWeather");

  table.innerHTML = "";

  for (let city of cities) {
    try {
      const geo = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}`,
      );
      const g = await geo.json();

      if (!g.results) continue;

      const { latitude, longitude, name } = g.results[0];

      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`,
      );
      const d = await res.json();

      table.innerHTML += `
        <tr>
          <td>${name}</td>
          <td>${d.current_weather.temperature}</td>
          <td>${d.current_weather.windspeed}</td>
        </tr>`;
    } catch {}
  }
};

//  LOAD
window.addEventListener("load", () => {
  setDynamicBackground();
  loadCommonPlaces();

  const popup = document.getElementById("locationPopup");
  popup?.classList.add("show");

  document.getElementById("allowLocation").onclick = async () => {
    popup?.classList.remove("show");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        let cityName = " Your Location";

        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
          );

          const data = await res.json();

          cityName =
            data.city ||
            data.locality ||
            data.principalSubdivision ||
            data.localityInfo?.administrative?.[2]?.name ||
            " Your Location";
        } catch (err) {
          console.log("City fetch error");
        }

        getWeatherByCoords(lat, lon, cityName);
      },
      () => getWeather("Delhi"),
    );
  };

  document.getElementById("denyLocation").onclick = () => {
    popup?.classList.remove("show");
    getWeather(localStorage.getItem("lastCity") || "Delhi");
  };
});

//  Search
document.getElementById("searchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const city = document.getElementById("city").value.trim();
  if (city) getWeather(city);
});

//  Navbar shrink
window.addEventListener("scroll", () => {
  document
    .querySelector(".navbar")
    ?.classList.toggle("shrink", window.scrollY > 50);
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.location.reload(); // 🔥 auto reload on update
  });
}

function getWindDirection(deg) {
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  return directions[Math.round(deg / 22.5) % 16];
}

function updateWindUI(degree) {
  const arrow = document.getElementById("miniArrow");
  const text = document.getElementById("windDirectionText");

  if (!arrow || !text) return;

  // rotate arrow
  arrow.style.transform = `translateX(-50%) rotate(${degree}deg)`;

  // direction text
  const dir = getWindDirection(degree);

  text.innerText = `Direction: ${dir} (${degree}°)`;
}

//  MAP INIT
let map;
let marker;
let lightLayer;
let darkLayer;

window.addEventListener("load", () => {
  //  INIT MAP
  map = L.map("map").setView([28.61, 77.23], 5);

  setTimeout(() => {
    map.invalidateSize();
  }, 200);

  lightLayer = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    {
      attribution: "&copy; OpenStreetMap &copy; CARTO",
      subdomains: "abcd",
      maxZoom: 20,
    },
  );

  darkLayer = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
    {
      attribution: "&copy; OpenStreetMap &copy; CARTO",
      subdomains: "abcd",
      maxZoom: 20,
    },
  );
  const labels = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png",
    {
      attribution: "&copy; CARTO",
      subdomains: "abcd",
    },
  );

  //  default layer
  lightLayer.addTo(map);

  //  NIGHT MODE CHECK
  if (document.body.classList.contains("night-mode")) {
    map.removeLayer(lightLayer);

    darkLayer.addTo(map);

    labels.addTo(map);
  }

  //  MARKER
  marker = L.marker([28.61, 77.23])
    .addTo(map)
    .bindPopup(" Click map to get weather");

  //  CLICK EVENT (INSIDE LOAD)
  map.on("click", async function (e) {
    const lat = e.latlng.lat;
    const lon = e.latlng.lng;

    //  marker move
    marker.setLatLng([lat, lon]);

    //  camera smooth move
    map.flyTo([lat, lon], 8, {
      animate: window.innerWidth > 768,
      duration: 1,
    });

    //  existing weather UI update bhi chalega
    getWeatherByCoords(lat, lon, "Selected Location");

    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`,
      );
      const data = await res.json();

      const temp = data.current_weather.temperature;
      const wind = data.current_weather.windspeed;

      //  POPUP
      marker
        .bindPopup(
          `
    <div style="text-align:center;">
      <h6> Selected Location</h6>
      <p> Temp: ${temp} °C</p>
      <p> Wind: ${wind} km/h</p>
    </div>
  `,
        )
        .openPopup();
    } catch (err) {
      console.log("Map weather error");
    }
  });
});









// ================= FLOATING AI =================

const openAI = document.getElementById("openAI");

const closeAI = document.getElementById("closeAI");

const aiPopup = document.getElementById("aiPopup");

const askAI = document.getElementById("askAI");

const chatBox = document.getElementById("chatBox");

// OPEN
openAI.addEventListener("click", () => {

  aiPopup.classList.add("show");

});

// CLOSE
closeAI.addEventListener("click", () => {

  aiPopup.classList.remove("show");

});

// SEND MESSAGE
askAI.addEventListener("click", sendMessage);

// ENTER SUPPORT
document
.getElementById("userQuestion")
.addEventListener("keypress", function(e){

  if(e.key === "Enter"){
    sendMessage();
  }

});

// FUNCTION
function sendMessage(){

  const input =
    document.getElementById("userQuestion");

  const question =
    input.value.trim();

  if(!question) return;

  // USER MESSAGE
  chatBox.innerHTML += `
    <div class="user-msg">
      ${question}
    </div>
  `;

  // AUTO SCROLL
  chatBox.scrollTop =
    chatBox.scrollHeight;

  input.value = "";

  // BOT THINKING
  setTimeout(() => {

    let reply = "";

    const q =
      question.toLowerCase();

    if(q.includes("rain")){

      reply =
      " There may be rain today.";

    }

    else if(q.includes("temperature")){

      reply =
      " Temperature looks moderate today.";

    }

    else if(q.includes("humidity")){

      reply =
      " Humidity is currently normal.";

    }

    else if(q.includes("wind")){

      reply =
      " Wind speed is looking stable.";

    }

    else if(q.includes("uv")){

      reply =
      " UV rays are strong today. Wear sunscreen.";

    }

    else if(q.includes("wear")){

      reply =
      " Comfortable light clothes are recommended.";

    }

    else{

      reply =
      " Ask me weather or climate related questions.";
    }

    // BOT MESSAGE
    chatBox.innerHTML += `
      <div class="bot-msg">
        ${reply}
      </div>
    `;

    chatBox.scrollTop =
      chatBox.scrollHeight;

  }, 700);

}
