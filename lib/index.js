const SwaggerParser = require('swagger-parser');
const requestValidator = require('./request-validator');
const responseValidator = require('./response-validator');

const swaggerPathRegex = require('./swagger-path-to-regex')

const parser = new SwaggerParser();

let api;

module.exports = {
    parseDefinition: async (swaggerFile) => {
        const parsedApi = await parser.dereference(swaggerFile);
        api = parsedApi;
        api._regexPaths = [];
        Object.keys(api.paths).forEach(path => {
            api._regexPaths.push(swaggerPathRegex.convertToRegexer(path))
        })
        return api;
    },
    validateRequest: (apiPath, apiMethod, parameters) => {
        return requestValidator(api, apiPath, apiMethod, parameters);
    },
    validateResponse: (apiPath, apiMethod, status, body) => {
        return responseValidator(api, apiPath, apiMethod, status, body);
    },
};
