const xml2js = require('xml2js');

const builder = new xml2js.Builder({
  xmldec: { version: '1.0', encoding: 'UTF-8' },
});

const xml = builder.buildObject(baseRequest);
