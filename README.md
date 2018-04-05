# nav-connector

[![CircleCI](https://circleci.com/gh/angro-kft/nav-connector.svg?style=shield)](https://circleci.com/gh/angro-kft/nav-connector)
[![codecov](https://codecov.io/gh/angro-kft/nav-connector/branch/dev/graph/badge.svg)](https://codecov.io/gh/angro-kft/nav-connector)

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
    /* Send invoice to the NAV service.
       invoiceOperations is the InvoiceOperationListType in the specification. */
    const invoiceOperations = {
      technicalAnnulment: false,
      invoiceOperation: [{
        index: 1,
        operation: 'CREATE',
        invoice: 'invoice xml in base64 encoding',
      }],
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
      /* Axios error instance.
         Possible network error. You can try to resend the request later. */
    } else {
      /* Something happened in setting up the request that triggered an Error. */
    }
  }
})();
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
