const axios = require('axios');

async function getCoordsFromAddress(address) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    address
  )}.json?access_token=${process.env.MAPBOX_ACCESS_TOKEN}`;
  const res = await axios.get(url);
  const data = res.data;
  const coords = data?.features[0]?.geometry?.coordinates;
  return {
    lat: coords ? coords[1] : 51.59374293965505,
    lng: coords ? coords[0] : -0.09783556998624243,
  };
}

module.exports = getCoordsFromAddress;
