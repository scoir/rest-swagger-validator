const debug = require('debug')('rest-swagger-validator:validation:request');
const Ajv = require('ajv');
const schemaRetriever = require('./schema-retrieval');
const SchemaAccessError = require('./schema-access-error');
const h = require('./helper');

module.exports = (schemaRetriever) => {
    return (apiPath, apiMethod, parameters) => {
        debug(`validating ${apiMethod} on ${apiPath}`)
        const lowerMethod = apiMethod.toLowerCase();
        
        const schemaParameterDefinitions = schemaRetriever.getRequestParameters(apiPath, lowerMethod);
        
        const bodyParameterDefinition = schemaParameterDefinitions.find(param => param.in === 'body');
        
        if (h.isDefined(parameters.body) && h.isUndefined(bodyParameterDefinition)) {
            throw new SchemaAccessError(`Unable to find schema definition for request body of '${lowerMethod}' on '${apiPath}' in schema`)
        }
        if (h.isUndefined(parameters.body) && h.isDefined(bodyParameterDefinition) && bodyParameterDefinition.required) {
            throw new SchemaAccessError(`Body parameter is required for '${lowerMethod}' on '${apiPath}'`)
        }
        
        if (h.isDefined(parameters.body) && h.isDefined(bodyParameterDefinition)) {
            debug('validating request body');
            const targetSchema = bodyParameterDefinition.schema;
            const ajv = new Ajv();
            if (!ajv.validate(targetSchema, parameters.body)) {
                throw ajv.errors;
            }
        }
        
        const queryParameterDefinitions = schemaParameterDefinitions.filter(param => param.in === 'query');
        
        queryParameters = parameters.query || {};
        Object.keys(queryParameters).forEach(key => {
            const definedSchema = queryParameterDefinitions.find(param => param.name === key);
            const targetSchema = {
                type: definedSchema.type,
            };
            debug(`validating query parameter ${key} against ${JSON.stringify(targetSchema)}`);
            const ajv = new Ajv({
                coerceTypes: true,
            });
            if (!ajv.validate(targetSchema, queryParameters[key])) {
                throw ajv.errors;
            }
        })
        debug('finished validating')
    };
};