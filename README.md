*Project Overview*
I developed a weather application that provides real-time weather data and forecasts using external APIs. The application serves a practical purpose by helping users plan their activities based on accurate weather information.

*Part 1: Local Implementation*
Application Features
Current weather conditions
3-day weather forecast
Location search
Temperature unit conversion
Responsive design for all devices

*Technologies Used*
Frontend: HTML, CSS, JavaScript
Backend: Node.js 
API: WeatherAPI
# My Weather Application Project

- Shows real-time weather for any location
- Displays a 3-day forecast with high/low temps
- Automatically detects your location
- Works perfectly on phones and computers
- Handles errors gracefully

## How I Built It

### The Frontend 

I used modern JavaScript to make everything interactive:

```javascript
class WeatherApp {
  constructor() {
    this.currentUnit = 'c'; // Default to Celsius
    this.init();
  }

  async init() {
    this.setupElements();
    this.addEventListeners();
    await this.getUserLocation();
  }

  setupElements() {
    // Cache all the DOM elements I need
    this.searchInput = document.getElementById('location-input');
    this.searchButton = document.getElementById('search-btn');
    this.weatherDisplay = document.getElementById('current-weather-card');
  }

  addEventListeners() {
    // Make the search work when button is clicked or Enter is pressed
    this.searchButton.addEventListener('click', () => this.getWeather());
    this.searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.getWeather();
    });
  }

  async getUserLocation() {
    // Try to get their location automatically
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      await this.getWeather(`${position.coords.latitude},${position.coords.longitude}`);
    } catch {
      // If that fails, default to London
      await this.getWeather('London');
    }
  }

  async getWeather(location) {
    const searchLocation = location || this.searchInput.value.trim();
    if (!searchLocation) return;

    try {
      const response = await fetch(`/api/weather?location=${encodeURIComponent(searchLocation)}`);
      if (!response.ok) throw new Error('Failed to get weather');
      
      const data = await response.json();
      this.displayWeather(data);
    } catch (error) {
      this.showError('Oops! Couldn\'t get weather data. Please try again.');
    }
  }

  displayWeather(data) {
    // Update the UI with the new weather data
    const { current, location } = data;
    this.weatherDisplay.innerHTML = `
      <h2>${location.name}, ${location.country}</h2>
      <div class="current-temp">${Math.round(current.temp_c)}°C</div>
      <!-- More weather details here -->
    `;
  }

  showError(message) {
    this.weatherDisplay.innerHTML = `
      <div class="error">
        <i class="fas fa-exclamation-triangle"></i>
        <p>${message}</p>
      </div>
    `;
  }
}

// Start the app when page loads
window.addEventListener('DOMContentLoaded', () => new WeatherApp());
```

### The Backend (Server Code)

I built a Node.js server that talks to the WeatherAPI:

```javascript
require('dotenv').config();
const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// My weather API endpoint
app.get('/api/weather', async (req, res) => {
  try {
    const { location } = req.query;
    if (!location) {
      return res.status(400).json({ error: 'Please provide a location' });
    }

    const apiKey = process.env.WEATHER_API_KEY;
    const response = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=5`
    );
    
    if (!response.ok) throw new Error('Weather API failed');
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to get weather data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## How I Deployed It

### Setting Up the Servers

1. **Backend Servers (Web01 & Web02)**:
```bash
# I installed Node.js and PM2
sudo apt update
sudo apt install -y nodejs npm
npm install -g pm2

# Then set up my app
git clone https://github.com/myaccount/weather-app.git
cd weather-app
npm install
echo "WEATHER_API_KEY=mysecretkey" > .env

# Started it with PM2 so it runs forever
pm2 start server.js --name "weather-app"
pm2 startup
pm2 save
```

2. **Load Balancer (Lb01)**:
```bash
# Installed Nginx
sudo apt update
sudo apt install -y nginx

# Created my load balancer config
sudo nano /etc/nginx/conf.d/loadbalancer.conf
```

Here's the config I used:
```nginx
upstream weather_servers {
    server 44.207.3.30:3000; # Web01
    server 52.91.76.229:3000; # Web02
    least_conn; # Smart traffic distribution
}

server {
    listen 80;
    
    location / {
        proxy_pass http://weather_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Then I tested and restarted Nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

## Problems I Faced and How I Solved Them

1. **Empty Backend Responses**:
   - *Problem*: The load balancer wasn't showing which server handled requests
   - *Solution*: I added proper headers and variables to track this

2. **API Rate Limits**:
   - *Problem*: Kept hitting API limits during testing
   - *Solution*: I implemented client-side caching to reduce calls

3. **Mobile Layout Issues**:
   - *Problem*: Looked weird on phones
   - *Solution*: I added responsive CSS with media queries

## How to Run It Yourself

1. **Local Development**:
```bash
git clone https://github.com/myaccount/weather-app.git
cd weather-app
npm install
npm start
```

2. **Production Deployment**:
Follow the server setup steps I showed above. Remember to:
- Keep your API keys secret in `.env`
- Set up proper firewalls
- Enable HTTPS in production


