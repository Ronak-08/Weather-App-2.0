exports.handler = async function (event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const { endpoint = '', query = '' } = event.queryStringParameters || {};
  const API_KEY = process.env.OPENWEATHER_API_KEY;

  if (!endpoint) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing endpoint parameter' }) };
  }

const allowedEndpoints = [
  '/data/2.5/weather',
  '/data/2.5/forecast',
  '/data/2.5/air_pollution',
  '/geo/1.0/direct',  
  '/geo/1.0/reverse'      
];
  if (!allowedEndpoints.includes(endpoint)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid endpoint' }) };
  }

  const fullApiUrl = `https://api.openweathermap.org${endpoint}?${query}&appid=${API_KEY}`;

  try {
    const response = await fetch(fullApiUrl);
    const data = await response.json();
    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (error) {
    console.error('Fetch error:', error); // Good for debugging
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch data' }) };
  }
};
