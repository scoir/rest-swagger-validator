# rest swagger validator

rest-swagger-validator is a module for use with one or more swagger definitions in order to validate that a request and/or response are valid.

## the need

Swagger api specs creation/modification was added as the first step in any agile story.  As part of our integration tests, we wanted to validate that any recorded api calls were valid responses to record and any actual api calls were valid requests.

## our solution

Usage of the module could look something like this:

```js
// integration spec
const swagga = require('rest-swagger-validator');
const swaggerFilePath = 'my-swagger.json';
var swag;

// validate that a response is valid before recording so that we do not test against a state that should never occur based on the api specification
const recordGet = (url, responseStatus, responseBody) => {
    swag.validateResponse(url, 'GET', responseStatus, responseBody);
    // record an expected GET request
}

// validate that any calls made from the browser pass the schema laid out in the swagger api spec
const validateGet = (url) => {
    const lastGetCall = myCallHistory.getLastGetCall(url);
    swag.validateRequest(url, 'GET', {
        query: lastGetCall.queryParameters,
        body: lastGetCall.body,
    });
}

// before we start testing, create a swagger validator instance for a specific swagger file
beforeAll(async () => {
    swag = await swagga.createFor(swaggerFilePath);
})

it('...', async () => {
    await recordGet('/some/url', 200, {
        field1: 'val1',
        field2: 'val2',
    });
    
    // load the page
    // assert some things happened on the page
    
    await validateGet('/some/url');
})
```
