
// const url =
//   "https://weather-by-api-ninjas.p.rapidapi.com/v1/weather?city=Seattle";

// const options = {
//   method: "GET",
//   headers: {
//     "x-rapidapi-key": "YOUR_API_KEY",
//     "x-rapidapi-host": "weather-by-api-ninjas.p.rapidapi.com",
//   },
// };

// async function getWeather() {
//   try {
//     const response = await fetch(url, options);
//     const result = await response.json(); // better than text()
//     console.log(result);
//   } catch (error) {
//     console.error(error);
//   }
// }

// getWeather();

const url =
  "https://weather-by-api-ninjas.p.rapidapi.com/v1/weather?city=Bihar";
const options = {
  method: "GET",
  headers: {
    "x-rapidapi-key": "08123f37bbmshb9fc1144b975955p13b26fjsn68f6c86c2d8a",
    "x-rapidapi-host": "weather-by-api-ninjas.p.rapidapi.com",
    "Content-Type": "application/json",
  },
};

try {
  const response = await fetch(url, options);
  const result = await response.text();
  console.log(result);
} catch (error) {
  console.error(error);
}

