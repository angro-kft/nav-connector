const { assert } = require('chai');
const { axios, technicalUser, softwareData } = require('./lib/globals.js');
const createAnnulmentOperations = require('./lib/create-annulment-operations.js');

const manageAnnulment = require('../src/manage-annulment.js');

describe('manageAnnulment()', () => {
  it('should resolve to transactionId with single annulment', async () => {
    const operations = [
      {
        annulmentReference: '22222222',
      },
    ];

    const annulmentOperation = createAnnulmentOperations(operations)
      .slice(0, 1)
      .map(({ index, annulmentOperation, invoiceAnnulment }) => ({
        index,
        annulmentOperation,
        invoiceAnnulment,
      }));

    const annulmentOperations = {
      annulmentOperation,
    };

    const transactionId = await manageAnnulment({
      annulmentOperations,
      technicalUser,
      softwareData,
      axios,
    });
    assert.match(transactionId, /^[+a-zA-Z0-9_]{1,30}$/);
  });

  it('should resolve to transactionId with multiple annulments', async () => {
    const operations = [
      {
        annulmentReference: '11111111',
      },
      {
        annulmentReference: '22222222',
      },
    ];

    const annulmentOperation = createAnnulmentOperations(operations).map(
      ({ index, annulmentOperation, invoiceAnnulment }) => ({
        index,
        annulmentOperation,
        invoiceAnnulment,
      })
    );

    const annulmentOperations = {
      annulmentOperation,
    };

    const transactionId = await manageAnnulment({
      annulmentOperations,
      technicalUser,
      softwareData,
      axios,
    });

    assert.match(transactionId, /^[+a-zA-Z0-9_]{1,30}$/);
  });

  it('should normalize annulmentOperation key order', async () => {
    const operations = [
      {
        annulmentReference: '22222222',
      },
    ];

    const annulmentOperation = createAnnulmentOperations(operations).map(
      ({ index, annulmentOperation, invoiceAnnulment }) => ({
        annulmentOperation,
        index,
        invoiceAnnulment,
      })
    );

    const annulmentOperations = {
      annulmentOperation,
    };

    const transactionId = await manageAnnulment({
      annulmentOperations,
      technicalUser,
      softwareData,
      axios,
    });

    assert.match(transactionId, /^[+a-zA-Z0-9_]{1,30}$/);
  });
});
