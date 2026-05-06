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
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`,
    );

    const data = await res.json();

    const rainCodes = [51, 53, 55, 61, 63, 65, 80, 81, 82];

    if (rainCodes.includes(data.current_weather.weathercode)) {
      createRain(120);

      clearInterval(lightningInterval);
      lightningInterval = setInterval(() => {
        if (Math.random() < 0.4) createLightning();
      }, 3000);
    } else {
      stopRain();
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

    document.getElementById("wind").innerText =
      data.current_weather.windspeed + " km/h";

    document.getElementById("wind_dir").innerText =
      data.current_weather.winddirection + "°";

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

