class WeatherApp {
  constructor() {
    this.currentUnit = 'c';
    this.lastWeatherData = null;
    this.init();
  }

  async init() {
    this.cacheElements();
    this.setupEventListeners();
    await this.loadDefaultLocation();
  }

  cacheElements() {
    this.elements = {
      locationInput: document.getElementById('location-input'),
      searchBtn: document.getElementById('search-btn'),
      currentWeather: document.getElementById('current-weather-card'),
      forecastContainer: document.getElementById('forecast-container'),
      celsiusBtn: document.getElementById('celsius-btn'),
      fahrenheitBtn: document.getElementById('fahrenheit-btn')
    };
  }

  setupEventListeners() {
    this.elements.searchBtn.addEventListener('click', () => this.fetchWeather());
    this.elements.locationInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.fetchWeather();
    });
    this.elements.celsiusBtn.addEventListener('click', () => this.setUnit('c'));
    this.elements.fahrenheitBtn.addEventListener('click', () => this.setUnit('f'));
  }

  async loadDefaultLocation() {
    try {
      if (navigator.geolocation) {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        await this.fetchWeather(`${position.coords.latitude},${position.coords.longitude}`);
      } else {
        await this.fetchWeather('London');
      }
    } catch (error) {
      console.error('Geolocation error:', error);
      await this.fetchWeather('London');
    }
  }

  async fetchWeather(location) {
    const searchLocation = location || this.elements.locationInput.value.trim();
    if (!searchLocation) return;

    try {
      const response = await fetch(`/api/weather?location=${encodeURIComponent(searchLocation)}`);
      if (!response.ok) throw new Error('Failed to fetch weather data');
      
      const data = await response.json();
      this.lastWeatherData = data;
      this.updateUI(data);
    } catch (error) {
      console.error('Fetch error:', error);
      this.showError('Failed to fetch weather data. Please try again.');
    }
  }

  updateUI(data) {
    this.updateCurrentWeather(data.current, data.location);
    this.updateForecast(data.forecast);
  }

  updateCurrentWeather(current, location) {
    const temp = this.currentUnit === 'c' ? current.temp_c : current.temp_f;
    const feelsLike = this.currentUnit === 'c' ? current.feelslike_c : current.feelslike_f;
    
    this.elements.currentWeather.innerHTML = `
      <h2>${location.name}, ${location.country}</h2>
      <div class="current-weather">
        <div>
          <div class="temp">${Math.round(temp)}°${this.currentUnit.toUpperCase()}</div>
          <div class="condition">
            <img src="https:${current.condition.icon}" alt="${current.condition.text}">
            <p>${current.condition.text}</p>
          </div>
        </div>
        <div class="details">
          <div class="detail-item">
            <div><i class="fas fa-temperature-low"></i> Feels Like</div>
            <div>${Math.round(feelsLike)}°</div>
          </div>
          <div class="detail-item">
            <div><i class="fas fa-tint"></i> Humidity</div>
            <div>${current.humidity}%</div>
          </div>
          <div class="detail-item">
            <div><i class="fas fa-wind"></i> Wind</div>
            <div>${current.wind_kph} km/h</div>
          </div>
          <div class="detail-item">
            <div><i class="fas fa-compass"></i> Pressure</div>
            <div>${current.pressure_mb} mb</div>
          </div>
        </div>
      </div>
    `;
  }

  updateForecast(forecast) {
    this.elements.forecastContainer.innerHTML = forecast.forecastday.map(day => `
      <div class="forecast-day">
        <h3>${new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</h3>
        <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
        <div class="temp-range">
          <span>${this.currentUnit === 'c' ? day.day.maxtemp_c : day.day.maxtemp_f}°</span>
          <span>${this.currentUnit === 'c' ? day.day.mintemp_c : day.day.mintemp_f}°</span>
        </div>
      </div>
    `).join('');
  }

  setUnit(unit) {
    if (this.currentUnit !== unit) {
      this.currentUnit = unit;
      this.elements.celsiusBtn.classList.toggle('active', unit === 'c');
      this.elements.fahrenheitBtn.classList.toggle('active', unit === 'f');
      if (this.lastWeatherData) {
        this.updateUI(this.lastWeatherData);
      }
    }
  }

  showError(message) {
    this.elements.currentWeather.innerHTML = `
      <div class="error">
        <i class="fas fa-exclamation-triangle"></i>
        <p>${message}</p>
      </div>
    `;
  }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => new WeatherApp());
