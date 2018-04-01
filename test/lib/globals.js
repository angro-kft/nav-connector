const { chain, camelCase } = require('lodash');
const axios = require('axios');

require('dotenv').config();

exports.technicalUser = chain(process.env)
  .pickBy((value, key) => key.includes('NAV_CONNECTOR_TECHNICAL_USER_'))
  .mapKeys((value, key) =>
    camelCase(key.replace('NAV_CONNECTOR_TECHNICAL_USER_', ''))
  )
  .value();

exports.softwareData = {
  softwareId: '123456789123456789',
  softwareName: 'string',
  softwareOperation: 'LOCAL_SOFTWARE',
  softwareMainVersion: 'string',
  softwareDevName: 'string',
  softwareDevContact: 'string',
  softwareDevCountryCode: 'HU',
  softwareDevTaxNumber: 'string',
};

exports.axios = axios.create({
  baseURL: 'https://api-test.onlineszamla.nav.gov.hu/invoiceService/',
  headers: {
    'content-type': 'application/xml',
    accept: 'application/xml',
    encoding: 'UTF-8',
  },
});
