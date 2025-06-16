const fetch = require('node-fetch');
exports.handler = async function (event) {
  const { path } = event.queryStringParameters;
  
  const API_KEY = process.env.OPENWEATHER_API_KEY;

  if (!path) {
    return { statusCode: 400, body: JSON.stringify({ error: 'API path parameter is missing' }) };
  }
  const fullApiUrl = `https://api.openweathermap.org${path}&appid=${API_KEY}`;
  try {
    const response = await fetch(fullApiUrl);
    const data = await response.json();
    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch data' }) };
  }
};
