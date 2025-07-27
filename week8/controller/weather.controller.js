const weatherService = require('../services/weatherApi');
const { AppError } = require('../middleware/error');

exports.getWeather = async (req, res) => {
  const { city } = req.params;
  
  if (!city) {
    throw new AppError('City parameter is required', 400);
  }
  
  const weatherData = await weatherService.getWeatherByCity(city);
  
  res.status(200).json({
    status: 'success',
    data: {
      city: weatherData.name,
      country: weatherData.sys.country,
      temperature: weatherData.main.temp,
      description: weatherData.weather[0].description,
      humidity: weatherData.main.humidity,
      windSpeed: weatherData.wind.speed,
      icon: weatherData.weather[0].icon
    }
  });
};
