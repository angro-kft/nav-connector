# nav-connector

[![codecov](https://codecov.io/gh/angro-kft/nav-connector/branch/dev/graph/badge.svg)](https://codecov.io/gh/angro-kft/nav-connector)

Node.js module which provides an interface for communicating with NAV online invoice service.

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
