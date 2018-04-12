# nav-connector

[![CircleCI](https://circleci.com/gh/angro-kft/nav-connector.svg?style=shield)](https://circleci.com/gh/angro-kft/nav-connector)
[![codecov](https://codecov.io/gh/angro-kft/nav-connector/branch/dev/graph/badge.svg)](https://codecov.io/gh/angro-kft/nav-connector)
[![npm (scoped)](https://img.shields.io/npm/v/@angro/nav-connector.svg)](https://www.npmjs.com/package/@angro/nav-connector)
[![license](https://img.shields.io/github/license/angro-kft/nav-connector.svg)](https://github.com/angro-kft/nav-connector/blob/dev/LICENSE)
![nav](https://img.shields.io/badge/NAV%20service%20version%20compatible-0.11-blue.svg)

Node.js module which provides an interface for communicating with NAV online invoice service.

This module was developed in order to satisfy the following specification:  
[Online invoice interface specification](https://onlineszamla-test.nav.gov.hu/api/files/container/download/Online%20Szamla_Interfesz%20specifik%C3%A1ci%C3%B3_EN.pdf)

## Installation

Node.js 8.10.0 or higher is required.

```sh
$ npm install @angro/nav-connector
```

## Example

```js
const NavConnector = require('@angro/nav-connector');

/* Your technical user's data. */
const technicalUser = {
  login: 'login123',
  password: 'password',
  taxNumber: '12345678',
  signatureKey: 'signatureKey',
  exchangeKey: 'exchangeKey',
};

const softwareData = {
  softwareId: '123456789123456789',
  softwareName: 'string',
  softwareOperation: 'LOCAL_SOFTWARE',
  softwareMainVersion: 'string',
  softwareDevName: 'string',
  softwareDevContact: 'string',
  softwareDevCountryCode: 'HU',
  softwareDevTaxNumber: 'string',
};

const baseURL = 'https://api-test.onlineszamla.nav.gov.hu/invoiceService/';

/* Create the nav connector interface. */
const navConnector = new NavConnector({ technicalUser, softwareData, baseURL });

(async function sendInvoice() {
  try {
    /* On app start You can test connection to the NAV service and user given data validity.
       testConnection() will throw if a tokenExchangeRequest operation is not successful. */
    await navConnector.testConnection();

    /* Send invoice to the NAV service.
       invoiceOperations is the InvoiceOperationListType in the specification. */
    const invoiceOperations = {
      technicalAnnulment: false,
      invoiceOperation: [
        {
          index: 1,
          operation: 'CREATE',
          invoice: 'invoice xml in base64 encoding',
        },
      ],
    };

    const transactionId = await navConnector.manageInvoice(invoiceOperations);

    /* Check previously sent invoice processing status.
       processingResults is the ProcessingResultListType in the specification. */
    const processingResults = await navConnector.queryInvoiceStatus({
      transactionId,
    });

    /* Check processingResults.length.
        If the array is empty then transactionId was invalid. */
    if (processingResults.length) {
      /* Handle invoice status responses. */
    }
  } catch (error) {
    if (error.response) {
      /* Axios error instance.
         error.response.data contains service error response,
         this is the GeneralErrorResponseType in the specification. */
    } else if (error.request) {
      /* http.ClientRequest.
         Possible network error. You can try to resend the request later. */
    } else {
      /* Something happened in setting up the request that triggered an Error. */
    }
  }
})();
```
## API

### NavConnector

Class representing the implementation of the NAV online invoice data service specification.

```js
/**
 * Create a navConnector.
 * @param {Object} params Constuctor params.
 * @param {Object} params.technicalUser Technical user data.
 * @param {Object} params.softwareData Software data.
 * @param {String} [params.baseURL=https://api.onlineszamla.nav.gov.hu/invoiceService/] Axios baseURL.
 */
const navConnector = new NavConnector({ technicalUser, softwareData });
```

### navConnector.manageInvoice()

Method to send a single or multiple invoices to the NAV service. The method returns the transaction id of the operation which can be used later to get the status of the invoice processing status of this request.

```js
/**
 * Send request to NAV service to manage invoices.
 * @async
 * @param {Object} invoiceOperations Request object for xml conversion and send.
 * @returns {Promise<string>} Manage invoice operation transaction id.
 */
const transactionId = await navConnector.manageInvoice(invoiceOperations);
```

Example for invoiceOperations parameter:  

```js
const invoiceOperations = {
  technicalAnnulment: false,
  invoiceOperation: [
    {
      index: 1,
      operation: 'CREATE',
      invoice: 'invoice xml in base64 encoding',
    },
    {
      index: 2,
      operation: 'STORNO',
      invoice: 'invoice xml in base64 encoding',
    },
  ],
};
```

### navConnector.queryInvoiceStatus()

Method to get the processing status of previously send invoices. The resolved return value is the ProcessingResultListType of the specification. 

```js
/**
 * Get the result of a previously sent manage invoice request.
 * @async
 * @param {Object} params Function params.
 * @param {Object} params.transactionId Manage invoice operation transaction id.
 * @param {boolean} [params.returnOriginalRequest=false] Flag for api response to contain the original invoice.
 * @returns {Promise<Array>} processingResults
 */
const processingResults = await navConnector.queryInvoiceStatus({
      transactionId,
      returnOriginalRequest: true,
    });
```

### navConnector.testConnection()

Method to test connection, user auth data and keys validity with a tokenExchnageRequest.

```js
/**
 * Test connection, user auth data and keys validity with a tokenExchnageRequest.
 * @async
 * @throws {Object} Will throw an error if there was a network expectation
 * or any user given auth data or key is invalid.
 */
try {
  await navConnector.testConnection();
} catch(error) {
  /* Log the error. */
}
```

## Error handling

All methods can throw expectation and You can fine tune how to log these error, handle them or retry the request if possible.

```js
try {
  await navConnector.testConnection();
} catch (error) {
  if (error.response) {
    /* Axios error instance.
       Log the error and fix the request then resend it.
       Its possible to have error here if the NAV service is down.
       According to the specification handle those errors and
       resend the request later. */
  } else if (error.request) {
    /* http.ClientRequest instance. 
       Possible network error. You can try to resend the request later. */
  } else {
    /* Something happened in setting up the request that triggered an Error.
       Log the error and try to fix the problem then resend the request. */
  }
}
```

## Tests

Copy the file named `.env.example` and rename it to `.env` in the root of the repository and replace placeholder values with your own technical user's data.  
⚠️**Never edit the `.env.example` file and never commit your sensitive data!**

```sh
$ npm run test
```

## Maintainers

This repository is maintained by [ANGRO Nagykereskedelmi Kft.](https://angro.hu/)

Repository lead maintainer: [Dávid Házi](https://github.com/kailniris) ( <mailto:hazi.david@angro.hu> )

## License

[GPL-3.0](LICENSE)
