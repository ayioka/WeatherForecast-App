require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API endpoint to proxy weather requests
app.get('/api/weather', async (req, res) => {
  try {
    const { location } = req.query;
    const apiKey = process.env.WEATHER_API_KEY;
    const response = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=5&aqi=no&alerts=no`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching weather data' });
  }
});

// Start server
{app.listen(3000, '0.0.0.0', () => {
  console.log(`Server running on port 3000');
