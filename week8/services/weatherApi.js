const axios = require('axios');
const { AppError } = require('../middleware/error');

// Simple in-memory cache
const cache = {
  data: {},
  timestamp: {}
};

// Cache expiration time (10 minutes)
const CACHE_EXPIRATION = 10 * 60 * 1000;

exports.getWeatherByCity = async (city) => {
  try {
    // Check if we have cached data and it's still valid
    if (
      cache.data[city] && 
      cache.timestamp[city] && 
      Date.now() - cache.timestamp[city] < CACHE_EXPIRATION
    ) {
      return cache.data[city];
    }

    // Otherwise fetch new data
    const API_KEY = process.env.WEATHER_API_KEY || 'demo_api_key';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    
    const response = await axios.get(url);
    
    if (response.status !== 200) {
      throw new AppError('Failed to fetch weather data', 500);
    }

    // Save to cache
    cache.data[city] = response.data;
    cache.timestamp[city] = Date.now();
    
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new AppError(`City "${city}" not found`, 404);
    }
    throw new AppError(error.message || 'Weather service error', 500);
  }
};
