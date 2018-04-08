const xml2js = require('xml2js');

const builder = new xml2js.Builder({
  xmldec: { version: '1.0', encoding: 'UTF-8' },
  renderOpts: { pretty: true, indent: '\t', newline: '\n' },
});

/**
 * Create a request xml string from a request object.
 * @param {Object} request Request object.
 * @returns {string} Xml request.
 */
module.exports = function createRequestXml(request) {
  const xml = builder.buildObject(request);

  return `${xml}\n`;
};
