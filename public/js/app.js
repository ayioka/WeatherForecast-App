class WeatherApp {
  constructor() {
    this.currentUnit = 'c';
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
      celsiusBtn: document.getElementById('celsius-btn'),
      fahrenheitBtn: document.getElementById('fahrenheit-btn'),
      currentWeather: document.querySelector('.current-weather'),
      forecastCards: document.querySelector('.forecast-cards')
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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await this.fetchWeather(`${position.coords.latitude},${position.coords.longitude}`);
        },
        async () => {
          await this.fetchWeather('London');
        }
      );
    } else {
      await this.fetchWeather('London');
    }
  }

  async fetchWeather(location) {
    const searchLocation = location || this.elements.locationInput.value.trim();
    if (!searchLocation) return;

    try {
      const response = await fetch(`/api/weather?location=${encodeURIComponent(searchLocation)}`);
      const data = await response.json();
      this.updateUI(data);
    } catch (error) {
      console.error('Error:', error);
      this.showError('Failed to fetch weather data');
    }
  }

  updateUI(data) {
    this.updateCurrentWeather(data);
    this.updateForecast(data);
  }

  updateCurrentWeather(data) {
    const { current, location } = data;
    const temp = this.currentUnit === 'c' ? current.temp_c : current.temp_f;
    
    this.elements.currentWeather.innerHTML = `
      <div class="weather-card">
        <div class="location">
          <h2>${location.name}, ${location.country}</h2>
          <p>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div class="weather-main">
          <div class="temp">${Math.round(temp)}°${this.currentUnit.toUpperCase()}</div>
          <div class="condition">
            <img src="https:${current.condition.icon}" alt="${current.condition.text}">
            <p>${current.condition.text}</p>
          </div>
        </div>
        <div class="weather-details">
          <!-- Details will be added here -->
        </div>
      </div>
    `;
  }

  updateForecast(data) {
    this.elements.forecastCards.innerHTML = data.forecast.forecastday.map(day => `
      <div class="forecast-card">
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
      // Re-render with new units
      if (this.lastWeatherData) {
        this.updateUI(this.lastWeatherData);
      }
    }
  }

  showError(message) {
    this.elements.currentWeather.innerHTML = `
      <div class="error-card">
        <i class="fas fa-exclamation-triangle"></i>
        <p>${message}</p>
      </div>
    `;
  }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  new WeatherApp();
});
