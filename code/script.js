// In the code, there are two API calls. The first one fetches the geographic coordinates of the user-entered city. These coordinates are then used in the second API call to retrieve the weather forecast, which is displayed on the page. The code also includes a feature that asks for user location permission and, once granted, makes the second API call to fetch the weather forecast based on the user’s current location.

/*Total three free API's are use in this code:
1. 5 day weather forecast
2. Geocoding API
3. Reverse geocoding
*/

const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "722c46864a03808103310409ef0c407d"; // API key for OpenWeatherMap API


//By providing geographic coordinates to a weather API, you can fetch detailed weather data for a specific location over a 5-day period, with information available for every 3-hour interval during those days. This data can enhance the user experience on your website or app by offering up-to-date weather information.


//1. Purpose: This function is responsible for generating the HTML structure for individual weather cards that display weather information for a specific date.
const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) { // HTML for the main weather card
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>${weatherItem.weather[0].description}</h6>
                </div>`;
    } else { // HTML for the other five day forecast card
        return `<li class="card">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </li>`;
    }
}

//2. Purpose: This function is responsible for fetching weather forecast data from the OpenWeatherMap API, processing it, and displaying it on a web page.
const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;


    fetch(WEATHER_API_URL).then(response => response.json()).then(data => {
        // Filter the forecasts to get only one forecast per day
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });
        // Clearing previous weather data
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";
        // Creating weather cards and adding them to the DOM
        fiveDaysForecast.forEach((weatherItem, index) => {
            const html = createWeatherCard(cityName, weatherItem, index);
            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", html);
            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", html);
            }
        });
    }).catch(() => {
        alert("An error occurred while fetching the weather forecast!");
    });
}


//createWeatherCard is a utility function for generating HTML weather card templates, while getWeatherDetails is the main function responsible for fetching, processing, and displaying weather forecast data on the web page. getWeatherDetails uses createWeatherCard to create the actual weather cards that are displayed to the user. The two functions work together to provide a complete weather forecasting application.

// 3. Purpose: This function is responsible for fetching the geographic coordinates (latitude and longitude) of a city based on the user's input (city name) using the OpenWeatherMap GeoCoding API.
const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (cityName === "") return;
    const API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    // Get entered city coordinates (latitude, longitude, and name) from the API response
    fetch(API_URL).then(response => response.json()).then(data => {
        if (!data.length) return alert(`No coordinates found for ${cityName}`);
        const { lat, lon, name } = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("An error occurred while fetching the coordinates!");
    });
}

//4. Purpose: This function is responsible for obtaining the user's geographic coordinates (latitude and longitude) through the browser's geolocation API.
// Outcome: It retrieves the user's coordinates and then calls the OpenWeatherMap Reverse Geocoding API to obtain the corresponding city name. Finally, it calls the getWeatherDetails function to fetch and display weather data for the user's location.
const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            // Get coordinates of user location
            // Get city name from coordinates using reverse geocoding API.
            // Reverse Geocoding: Imagine you have the GPS coordinates (latitude and longitude) of a place, but you don't know its name. Reverse geocoding is like magic that helps you figure out the name of that place.
            const API_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(API_URL).then(response => response.json()).then(data => {
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);
            }).catch(() => {
                alert("An error occurred while fetching the city name!");
            });
        },
        error => { // Show alert if user denied the location permission
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            } else {
                alert("Geolocation request error. Please reset location permission.");
            }
        });
}

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());



