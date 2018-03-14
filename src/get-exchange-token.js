module.exports = async function getExchangeToken({ axios, requestXml }) {
  try {
    return await axios.post('/tokenExchange', requestXml);
  } catch (error) {
    throw error;
  }
};
