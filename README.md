# nav-connector

[![CircleCI](https://circleci.com/gh/angro-kft/nav-connector.svg?style=shield)](https://circleci.com/gh/angro-kft/nav-connector)
[![codecov](https://codecov.io/gh/angro-kft/nav-connector/branch/dev/graph/badge.svg)](https://codecov.io/gh/angro-kft/nav-connector)
[![npm (scoped)](https://img.shields.io/npm/v/@angro/nav-connector.svg)](https://www.npmjs.com/package/@angro/nav-connector)
[![license](https://img.shields.io/github/license/angro-kft/nav-connector.svg)](https://github.com/angro-kft/nav-connector/blob/dev/LICENSE)
![nav](https://img.shields.io/badge/NAV%20service%20version%20compatible-1.8-blue.svg)
![nav-interface](https://img.shields.io/badge/NAV%20interface%20version%20compatible-1.1-blue.svg)

Node.js module which provides an interface for communicating with NAV online invoice service.

This module was developed in order to satisfy the following specification:  
[Online invoice interface specification](https://onlineszamla-test.nav.gov.hu/api/files/container/download/Online%20Szamla_Interfesz%20specifik%C3%A1ci%C3%B3_EN.pdf)

## Installation

Tested with version 10.16.0 of Node.js.

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

const baseURL = 'https://api-test.onlineszamla.nav.gov.hu/invoiceService/v2/';

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
      compressedContent: false,
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
    const processingResults = await navConnector.queryTransactionStatus({
      transactionId,
    });

    /* Check processingResults.length.
        If the array is empty then transactionId was invalid. */
    if (processingResults.length) {
      /* Handle invoice status responses. */
    }
  } catch (error) {
    /* Handle errors. See bellow for details. */
  }
})();
```

## API

### NavConnector

Class representing the implementation of the NAV online invoice data service specification.

```js
/**
 * Create a navConnector.
 * @param {Object} params Constructor params.
 * @param {Object} params.technicalUser Technical user data.
 * @param {Object} params.softwareData Software data.
 * @param {String} [params.baseURL=https://api.onlineszamla.nav.gov.hu/invoiceService/v2/] Axios baseURL.
 * @param {number} [params.timeout=70000] Axios default timeout integer in milliseconds.
 */
const navConnector = new NavConnector({ technicalUser, softwareData });
```

Axios timeout option is needed because during NAV service outages, requests may never timeout if axios timeout option is not set.  
According to the NAV online invoice service documentation the request timeout is set to 5000 ms on the service side
but in practice there may be no timeout or there can be a gateway timeout after 60 seconds.
The timeout is set to 70000 milliseconds (70 sec) in axios as default.  
You can fine tune this value but its strongly suggested to keep it above 60 seconds to avoid dropped responses.

```js
const navConnector = new NavConnector({
  technicalUser,
  softwareData,
  timeout: 70000,
});
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
  compressedContent: false,
  invoiceOperation: [
    {
      index: 1,
      invoiceOperation: 'CREATE',
      invoiceData: 'invoice xml in base64 encoding',
    },
    {
      index: 2,
      invoiceOperation: 'STORNO',
      invoiceData: 'invoice xml in base64 encoding',
    },
  ],
};
```

Take note You have to compress the invoice by yourself before using the manageInvoice method.

```js
const invoiceOperations = {
  compressedContent: true,
  invoiceOperation: [
    {
      index: 1,
      invoiceOperation: 'CREATE',
      invoiceData: 'compressed invoice xml in base64 encoding',
    },
  ],
};
```


### navConnector.manageAnnulment()

Method to send a single or multiple invoice annulments to the NAV service. The method returns the transaction id of the operation which can be used later to get the status of the invoice processing status of this request.

```js
/**
 * Send request to NAV service to manage annulment invoices.
 * @async
 * @param {Object} annulmentOperations Request object for xml conversion and send.
 * @returns {Promise<string>} Manage invoice operation transaction id.
 */
const transactionId = await navConnector.manageAnnulment(annulmentOperations);
```

Example for annulmentOperations parameter:

```js
const annulmentOperations = {
  annulmentOperation: [
    {
      index: 1,
      annulmentOperation: 'ANNUL',
      invoiceAnnulment: 'invoice xml in base64 encoding',
    },
    {
      index: 2,
      annulmentOperation: 'ANNUL',
      invoiceAnnulment: 'invoice xml in base64 encoding',
    },
  ],
};
```
### navConnector.queryTransactionStatus()

Method to get the processing status of previously send invoices. The resolved return value is the ProcessingResultListType of the specification.

```js
/**
 * Get the result of a previously sent manage invoice request.
 * @async
 * @param {Object} params Function params.
 * @param {string} params.transactionId Manage invoice operation transaction id.
 * @param {boolean} [params.returnOriginalRequest=false] Flag for api response to contain the original invoice.
 * @returns {Promise<Array>} processingResults
 */
const processingResults = await navConnector.queryTransactionStatus({
  transactionId,
  returnOriginalRequest: true,
});

processingResults.forEach(processingResult => {
  const {
    index,
    invoiceStatus,
    originalRequest,
    compressedContentIndicator,
    businessValidationMessages,
    technicalValidationMessages,
  } = processingResult;

  /* Property businessValidationMessages and technicalValidationMessages
     are always normalized to arrays even if there were no validation messages. */
});
```

This function does type conversion for number and boolean typed values in the response according to the NAV service documentation.

### navConnector.testConnection()

Method to test connection, user auth data and keys validity with a tokenExchangeRequest.

```js
/**
 * Test connection, user auth data and keys validity with a tokenExchangeRequest.
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

### navConnector.queryInvoiceData()

Method to query previously sent invoices with invoice number or query params.

```js
/**
 * Query previously sent invoices with invoice number or query params.
 * @async
 * @param {Object} params Function params.
 * @param {Object} params.invoiceQuery Query single invoice with invoice number.
 * @returns {Promise<Object>} response
 */
```

#### Query by invoice number

```js
const invoiceQuery = {
  invoiceNumber: 'invoiceNumber',
  invoiceDirection: 'OUTBOUND'
};

const response = await navConnector.queryInvoiceData({
  invoiceQuery
});

const { currentPage, availablePage, queryResult } = response;

/* If no invoice was found with the given query then queryResult is undefined. */
if (!queryResult) {
  return;
}

const { invoiceResult, invoiceDigestList } = queryResult;
```

This function does type conversion for number and boolean typed values in the response according to the NAV service documentation.


### navConnector.queryInvoiceDigest()

Method to query previously sent invoices with query params.

```js
/**
 * Query previously sent invoices with query params.
 * @async
 * @param {Object} params Function params.
 * @param {number} params.page Integer page to query.
 * @param {string} params.invoiceDirection inbound or outbound request type
 * @param {Object} params.queryParams Query multiple invoices with params.
 * @returns {Promise<Object>} response
 */
```
#### Query by parameters

```js
const queryParams = {
  dateFrom: '2017-12-28',
  dateTo: '2017-12-28',
};

const response = await navConnector.queryInvoiceDigest({
  invoiceDirection: "OUTBOUND",
  page: 1,
  queryParams,
});

const { currentPage, availablePage, queryResult } = response;

/* If no invoice was found with the given query then queryResult is undefined. */
if (!queryResult) {
  return;
}

const { invoiceDigestList } = queryResult;
```

This function does type conversion for number and boolean typed values in the response according to the NAV service documentation.


### navConnector.queryTaxpayer()

Method to get taxpayer information by tax number.  
It resolves to an object containing taxpayerValidity and taxpayerData properties.  
Keep in mind the taxpayerData property is not returned by the NAV service if the tax number is non existent.

```js
/**
 * Get taxpayer information by tax number.
 * @param {string} taxNumber Taxpayer tax number to get information for.
 * @returns {Promise<Object>} Taxpayer information.
 */
const { taxpayerValidity, taxpayerData } = await navConnector.queryTaxpayer('12345678');

if (!taxpayerValidity) {
  /* Taxpayer is non existent or inactive. */
} else if (taxpayerData) {
  /* The taxpayerData property was returned by the service. */
}
```

This function does type conversion for boolean typed values in the response according to the NAV service documentation.

## Error handling

All methods can throw expectation and You can fine tune how to log these error, handle them or retry the request if possible.

```js
try {
  await navConnector.testConnection();
} catch (error) {
  /* Axios error instance.*/
  const { response, request } = error;

  if (response) {
    if (response.status === 504) {
      /* Gateway timeout, retryable. */
    } else if (response.data.result.errorCode === 'OPERATION_FAILED') {
      /* Server side error, retryable. */
    } else {
      /* Log the error and fix the request then resend it. */
    }
  } else if (request) {
    /* http.ClientRequest instance.
       Possible network error. Retryable. */
  } else {
    /* Something happened in setting up the request that triggered an Error.
       Log the error and try to fix the problem then resend the request. */
  }
}
```

The error.response.data object is always normalized to the following format:

```js
{
  result: {
    funcCode: 'funcCode',
    errorCode: 'errorCode',
    message: 'message',
  },
  technicalValidationMessages: [
    {
      validationResultCode: 'validationResultCode',
      validationErrorCode: 'validationErrorCode',
      message: 'message',
    },
    {
      validationResultCode: 'validationResultCode',
      validationErrorCode: 'validationErrorCode',
      message: 'message',
    },
  ],
}
```

Take note properties funcCode, errorCode and message can be undefined and technicalValidationMessages length can be zero but
response.data and result are always an object and technicalValidationMessages is always an array.

## Tests

Copy the file named `.env.example` and rename it to `.env` in the root of the repository and replace placeholder values with your own technical user's data.  
⚠️**Never edit the `.env.example` file and never commit your sensitive data!**

```sh
$ npm run test
```

## Maintainers

This repository is maintained by [ANGRO Nagykereskedelmi Kft.](https://angro.hu/)

## License

[GPL-3.0](LICENSE)
