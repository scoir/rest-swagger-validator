const debug = require('debug')('rest-swagger-validator:validation:request');
const Ajv = require('ajv');
const paramsToSchemaConverter = require('openapi-jsonschema-parameters');
const schemaRetriever = require('./schema-retrieval');
const errors = require('./errors');
const h = require('./helper');

module.exports = (schemaRetriever, pathMatcher) => {
    return (apiPath, apiMethod, parameters) => {
        debug(`validating ${apiMethod} on ${apiPath}`)
        const lowerMethod = apiMethod.toLowerCase();
        
        const {result:matchedPathObj, errors:matchErrors} = pathMatcher.match(apiPath)
        
        if (matchErrors) {
            return matchErrors
        }
        
        const {result:schemaParameterDefinitions, errors:schemaErrors} = schemaRetriever.getRequestParameters(matchedPathObj.path, lowerMethod);
        
        if (schemaErrors) {
            return schemaErrors
        }
        
        let result = []
        
        const paramsSchema = paramsToSchemaConverter(schemaParameterDefinitions)
        
        const bodyParameterDefinition = schemaParameterDefinitions.find(param => param.in === 'body');
        
        if (h.isDefined(parameters.body) && h.isUndefined(paramsSchema.body)) {
            // throw new SchemaAccessError(`Unable to find schema definition for request body of '${lowerMethod}' on '${apiPath}' in schema`)
            result.push(errors.create('missing', 'body is not available in spec'))
        } else if (h.isUndefined(parameters.body) && h.isDefined(paramsSchema.body) && bodyParameterDefinition.required) {
            //throw new SchemaAccessError(`Body parameter is required for '${lowerMethod}' on '${apiPath}'`)
            result.push(errors.create('required', 'body is required'))
        } else if (h.isDefined(parameters.body) && h.isDefined(paramsSchema.body)) {
            debug('validating request body');
            const ajv = new Ajv({
                unknownFormats: ['int32', 'int64', 'float'],
            });
            if (!ajv.validate(paramsSchema.body, parameters.body)) {
                result = result.concat(ajv.errors)
            }
        }
        
        if (paramsSchema.query) {
            debug('validating query parameters')
            const ajv = new Ajv({
                coerceTypes: true,
                unknownFormats: ['int32', 'int64', 'float'],
            })
            if (!ajv.validate(paramsSchema.query, parameters.query)) {
                result = result.concat(ajv.errors)
            }
        }
        
        if (paramsSchema.path) {
            debug('validating path parameters')
            const ajv = new Ajv({
                coerceTypes: true,
                unknownFormats: ['int32', 'int64', 'float'],
            })
            if (!ajv.validate(paramsSchema.path, matchedPathObj.params)) {
                result = result.concat(ajv.errors);
            }
        }
        
        if (result.length > 0) {
            return result
        }
        
        debug('finished validating')
    };
};