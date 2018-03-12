# nav-connector

[![codecov](https://codecov.io/gh/angro-kft/nav-connector/branch/dev/graph/badge.svg)](https://codecov.io/gh/angro-kft/nav-connector)

Node.js module which provides an interface for communicating with NAV online invoice service.

## 🚧Work in progress

This module is under constant development at this time and will stay maintained in the future.  
This module was developed in order to satisfy the following specification:  
[Online invoice interface specification](https://onlineszamla-test.nav.gov.hu/api/files/container/download/Online%20Szamla_Interfesz%20specifik%C3%A1ci%C3%B3_EN.pdf)

## Installation

Node.js 8.10.0 or higher is required.

```sh
$ npm install @angro/nav-connector
```

## Example

```js
const { NavConnector, validateTechnicalUser } = require('@angro/nav-connector');

/* Your technical user's data. */
const technicalUser = {
  login: 'login123',
  password: 'password',
  taxNumber: '12345678-2-04',
  signatureKey: 'signatureKey',
  exchangeKey: 'exchangeKey',
};

/* Always validate Your technical user's data. */
const validationErrors = validateTechnicalUser(technicalUser);

if (validationErrors) {
  throw new Error(`technicalUser validation errors: ${validationErrors}`);
}

/* Create the nav connector interface. */
const navConnector = new NavConnector(technicalUser);
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
