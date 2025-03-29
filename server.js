require('dotenv').config();
const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API endpoint
app.get('/api/weather', async (req, res) => {
  try {
    const { location } = req.query;
    if (!location) {
      return res.status(400).json({ error: 'Location parameter is required' });
    }

    const apiKey = process.env.WEATHER_API_KEY;
    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(location)}&days=5&aqi=no&alerts=no`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
