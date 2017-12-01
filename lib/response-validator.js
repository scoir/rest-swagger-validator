const debug = require('debug')('rest-swagger-validator:validation:response');
const Ajv = require('ajv');
const schemaRetriever = require('./schema-retrieval');
const errors = require('./errors');
const h = require('./helper');

module.exports = (schemaRetriever, pathMatcher) => {
    return (apiPath, apiMethod, status, body) => {
        debug(`validating ${apiMethod} on ${apiPath}`)
        const lowerMethod = apiMethod.toLowerCase();

        const {result:matchedPathObj, errors:matchErrors} = pathMatcher.match(apiPath)
        
        if (matchErrors) {
            return matchErrors
        }
        
        const {result:statusResponse, errors:schemaErrors} = schemaRetriever.getResponseStatus(matchedPathObj.path, lowerMethod, status);
        
        if (schemaErrors) {
            return schemaErrors
        }
        
        if (h.isDefined(body) && !h.isObject(statusResponse.schema)) {
            return {
                errors: errors.create('missing', `${status} response code`),
            }
        }
        
        if (h.isDefined(body)) {
            debug(`validating body`)
            const targetSchema = statusResponse.schema;
            const ajv = new Ajv({
                coerceTypes: true,
                unknownFormats: ['int32', 'int64', 'float'],
            });
            if (!ajv.validate(targetSchema, body)) {
                return ajv.errors;
            }
        }
    }
};