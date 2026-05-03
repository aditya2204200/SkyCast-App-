// 🌤️ Dynamic Background
const setDynamicBackground = () => {
  const hour = new Date().getHours();
  const bg = document.querySelector(".bg-fixed");
  const body = document.body;

  if (!bg) return;

  bg.className = "bg-fixed";
  body.classList.remove("night-mode");

  if (hour >= 5 && hour < 11) {
    bg.classList.add("bg-morning");
  } else if (hour >= 11 && hour < 16) {
    bg.classList.add("bg-afternoon");
  } else if (hour >= 16 && hour < 19) {
    bg.classList.add("bg-evening");
  } else {
    bg.classList.add("bg-night");
    body.classList.add("night-mode");
  }
};

// 🌧️ Rain Effect
const createRain = (count = 100) => {
  const rainContainer = document.querySelector(".rain");
  if (!rainContainer) return;

  rainContainer.innerHTML = "";

  for (let i = 0; i < count; i++) {
    const drop = document.createElement("div");
    drop.classList.add("drop");

    drop.style.left = Math.random() * 100 + "vw";
    drop.style.animationDuration = 0.5 + Math.random() * 1 + "s";
    drop.style.opacity = Math.random();

    rainContainer.appendChild(drop);
  }
};

// 🌍 WEATHER BY COORDS
const getWeatherByCoords = async (lat, lon, cityName) => {
  try {
    setDynamicBackground();

    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m`,
    );

    const data = await res.json();

    const weatherCode = data.current_weather.weathercode;

    // 🌧️ Accurate rain codes
    const rainCodes = [51, 53, 55, 61, 63, 65, 80, 81, 82];

    if (rainCodes.includes(weatherCode)) {
      createRain(120);

      setInterval(() => {
        if (Math.random() < 0.4) {
          createLightning();
        }
      }, 3000);
    } else {
      document.querySelector(".rain").innerHTML = "";
    }

    // UI update
    document.getElementById("cityName").innerText = cityName;
    document.getElementById("temp").innerText =
      data.current_weather.temperature + " °C";

    document.getElementById("wind").innerText =
      data.current_weather.windspeed + " km/h";

    document.getElementById("wind_dir").innerText =
      data.current_weather.winddirection + "°";

    // humidity
    const timeIndex = data.hourly.time.indexOf(data.current_weather.time);
    let humidity = "--";

    if (timeIndex !== -1) {
      humidity = data.hourly.relativehumidity_2m[timeIndex];
    }

    document.getElementById("humidity").innerText = humidity + " %";
    document.getElementById("errorMsg").innerText = "";
  } catch (err) {
    console.error(err);
    document.getElementById("errorMsg").innerText = "⚠️ Weather load error";
  }
};

// 🌍 CITY SEARCH
const getWeather = async (city) => {
  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}`,
    );

    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      document.getElementById("errorMsg").innerText = "❌ City not found";
      return;
    }

    const place = geoData.results[0];
    getWeatherByCoords(place.latitude, place.longitude, place.name);
  } catch (err) {
    console.error(err);
    document.getElementById("errorMsg").innerText = "⚠️ Search error";
  }
};

/*Weather of other place*/ 


const loadCommonPlaces = async () => {
  const cities = ["Delhi", "Mumbai", "Kolkata", "Chennai", "Bangalore"];

  const table = document.getElementById("commonWeather");
  table.innerHTML = "";

  for (let city of cities) {
    try {
      // 📍 get coordinates
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}`,
      );
      const geoData = await geoRes.json();

      if (!geoData.results) continue;

      const { latitude, longitude, name } = geoData.results[0];

      // 🌦️ weather
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`,
      );
      const data = await res.json();

      // 🖥️ row create
      const row = `
        <tr>
          <td>${name}</td>
          <td>${data.current_weather.temperature}</td>
          <td>${data.current_weather.windspeed}</td>
        </tr>
      `;

      table.innerHTML += row;
    } catch (err) {
      console.error(err);
    }
  }
};


// 🚀 AUTO LOCATION (POPUP TRIGGER)
window.addEventListener("load", () => {
  setDynamicBackground();
  loadCommonPlaces();

  const popup = document.getElementById("locationPopup");
  popup.classList.add("show");

  // ✅ Allow
  document.getElementById("allowLocation").onclick = () => {
    if (popup) popup.classList.remove("show");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          try {
            const geoRes = await fetch(
              `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}`,
            );

            const geoData = await geoRes.json();

            // ✅ SAFE CITY
           let city = "📍 Your Location";

           if (geoData.results && geoData.results.length > 0) {
             const place = geoData.results[0];

             // 🔥 smarter selection
             city = place.city || place.town || place.village || place.name;
           }

            // ✅ SAVE
            localStorage.setItem("lastCity", city);

            // 🔥 MOST IMPORTANT (ALWAYS CALL)
            getWeatherByCoords(lat, lon, city);
          } catch (err) {
            console.error("Geo error:", err);

            // 🔥 EVEN IF FAIL → STILL SHOW WEATHER
            getWeatherByCoords(lat, lon, "📍 Your Location");
          }
        },

        // ❌ user denied or error
        () => {
          getWeather("Delhi");
        },
      );
    }
  };

  // ❌ Deny
  document.getElementById("denyLocation").onclick = () => {
    popup.classList.remove("show");
    getWeather("Delhi"); // default city
  };
});

// 🔍 Search
document.getElementById("searchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const city = document.getElementById("city").value;
  getWeather(city);
});

// 📌 Navbar shrink
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");

  if (window.scrollY > 50) {
    navbar.classList.add("shrink");
  } else {
    navbar.classList.remove("shrink");
  }
});



const createLightning = () => {
  const container = document.querySelector(".lightning");
  if (!container) return;

  const flash = document.createElement("div");
  flash.classList.add("flash");

  container.appendChild(flash);

  setTimeout(() => {
    flash.remove();
  }, 200);
};



/*==============================for location */
