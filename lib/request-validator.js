const debug = require('debug')('rest-swagger-validator:validation:request');
const Ajv = require('ajv');
const paramsToSchemaConverter = require('openapi-jsonschema-parameters');
const schemaRetriever = require('./schema-retrieval');
const SchemaAccessError = require('./schema-access-error');
const h = require('./helper');

module.exports = (schemaRetriever) => {
    return (apiPath, apiMethod, parameters) => {
        debug(`validating ${apiMethod} on ${apiPath}`)
        const lowerMethod = apiMethod.toLowerCase();
        
        const schemaParameterDefinitions = schemaRetriever.getRequestParameters(apiPath, lowerMethod);
        
        const paramsSchema = paramsToSchemaConverter(schemaParameterDefinitions)
        
        const bodyParameterDefinition = schemaParameterDefinitions.find(param => param.in === 'body');
        
        if (h.isDefined(parameters.body) && h.isUndefined(paramsSchema.body)) {
            throw new SchemaAccessError(`Unable to find schema definition for request body of '${lowerMethod}' on '${apiPath}' in schema`)
        }
        if (h.isUndefined(parameters.body) && h.isDefined(paramsSchema.body) && bodyParameterDefinition.required) {
            throw new SchemaAccessError(`Body parameter is required for '${lowerMethod}' on '${apiPath}'`)
        }
        
        if (h.isDefined(parameters.body) && h.isDefined(paramsSchema.body)) {
            debug('validating request body');
            const ajv = new Ajv();
            if (!ajv.validate(paramsSchema.body, parameters.body)) {
                throw ajv.errors;
            }
        }
        
        if (paramsSchema.query) {
            const ajv = new Ajv({
                coerceTypes: true,
            })
            if (!ajv.validate(paramsSchema.query, parameters.query)) {
                throw ajv.errors
            }
        }
        
        debug('finished validating')
    };
};