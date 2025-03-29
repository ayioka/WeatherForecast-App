document.addEventListener('DOMContentLoaded', function() {
    // API Configuration
    const apiKey = 'b867c919004749e1b62152711252603';
    const baseUrl = 'http://api.weatherapi.com/v1';
    
    // DOM Elements
    const searchInput = document.getElementById('location-input');
    const searchBtn = document.getElementById('search-btn');
    const locationElement = document.getElementById('location');
    const temperatureElement = document.getElementById('temperature');
    const conditionElement = document.getElementById('condition');
    const weatherIcon = document.getElementById('weather-icon');
    const feelsLikeElement = document.getElementById('feels-like');
    const humidityElement = document.getElementById('humidity');
    const windElement = document.getElementById('wind');
    const pressureElement = document.getElementById('pressure');
    const forecastContainer = document.getElementById('forecast-container');
    
    // Default location (Nairobi)
    let currentLocation = 'Nairobi';
    
    // Initialize app with Nairobi weather
    fetchWeather(currentLocation);
    
    // Event listeners
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Functions
    function handleSearch() {
        const location = searchInput.value.trim();
        if (location) {
            currentLocation = location;
            fetchWeather(location);
            searchInput.value = '';
        } else {
            alert('Please enter a location');
        }
    }
    
    async function fetchWeather(location) {
        try {
            // Show loading state
            locationElement.textContent = 'Loading...';
            temperatureElement.textContent = '--°C';
            conditionElement.textContent = '--';
            
            // Fetch current weather data for Nairobi
            const currentResponse = await fetch(`${baseUrl}/current.json?key=${apiKey}&q=${location}&aqi=no`);
            
            if (!currentResponse.ok) {
                throw new Error('Location not found');
            }
            
            const currentData = await currentResponse.json();
            
            // Fetch 3-day forecast data
            const forecastResponse = await fetch(`${baseUrl}/forecast.json?key=${apiKey}&q=${location}&days=3&aqi=no&alerts=no`);
            const forecastData = await forecastResponse.json();
            
            // Update UI with the fetched data
            updateCurrentWeather(currentData);
            updateForecast(forecastData);
            
        } catch (error) {
            console.error('Error fetching weather data:', error);
            locationElement.textContent = 'Error: ' + error.message;
            temperatureElement.textContent = '--°C';
            forecastContainer.innerHTML = '<div class="forecast-day">Failed to load forecast</div>';
        }
    }
    
    function updateCurrentWeather(data) {
        const { location, current } = data;
        
        // Update location
        locationElement.textContent = `${location.name}, ${location.country}`;
        
        // Update temperature and condition
        temperatureElement.textContent = `${Math.round(current.temp_c)}°C`;
        conditionElement.textContent = current.condition.text;
        
        // Update weather icon
        weatherIcon.src = current.condition.icon.startsWith('http') ? 
            current.condition.icon : 
            `https:${current.condition.icon}`;
        weatherIcon.alt = current.condition.text;
        
        // Update weather details
        feelsLikeElement.textContent = `${Math.round(current.feelslike_c)}°C`;
        humidityElement.textContent = `${current.humidity}%`;
        windElement.textContent = `${Math.round(current.wind_kph)} km/h`;
        pressureElement.textContent = `${current.pressure_mb} mb`;
    }
    
    function updateForecast(data) {
        // Clear previous forecast
        forecastContainer.innerHTML = '';
        
        // Skip today (we already show current weather)
        const forecastDays = data.forecast.forecastday.slice(1);
        
        forecastDays.forEach(day => {
            const forecastDayElement = document.createElement('div');
            forecastDayElement.className = 'forecast-day';
            
            const date = new Date(day.date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            
            forecastDayElement.innerHTML = `
                <div class="forecast-date">${dayName}</div>
                <img class="weather-icon" src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
                <div class="temp">${Math.round(day.day.avgtemp_c)}°C</div>
                <div>${day.day.condition.text}</div>
                <div class="forecast-details">
                    <div>H: ${Math.round(day.day.maxtemp_c)}°</div>
                    <div>L: ${Math.round(day.day.mintemp_c)}°</div>
                </div>
            `;
            
            forecastContainer.appendChild(forecastDayElement);
        });
    }
});