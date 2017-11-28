const debug = require('debug')('rest-swagger-validator:validation:response');
const Ajv = require('ajv');
const schemaRetriever = require('./schema-retrieval');
const SchemaAccessError = require('./schema-access-error');
const h = require('./helper');

module.exports = (schemaRetriever) => {
    return (apiPath, apiMethod, status, body) => {
        debug(`validating ${apiMethod} on ${apiPath}`)
        const lowerMethod = apiMethod.toLowerCase();
        
        const statusResponse = schemaRetriever.getResponseStatus(apiPath, lowerMethod, status);
        
        if (h.isDefined(body) && !h.isObject(statusResponse.schema)) {
            throw new SchemaAccessError(`Unable to find schema definition for response code ${status} of '${lowerMethod}' on '${apiPath}' in schema`)
        }
        
        if (h.isDefined(body)) {
            debug(`validating body`)
            const targetSchema = statusResponse.schema;
            const ajv = new Ajv({
                coerceTypes: true,
            });
            if (!ajv.validate(targetSchema, body)) {
                throw ajv.errors;
            }
        }
    }
};