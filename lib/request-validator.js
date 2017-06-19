const jsonSchema = require('jsonschema');
const schemaRetriever = require('./schema-retrieval');
const SchemaAccessError = require('./schema-access-error');

module.exports = (api, apiPath, apiMethod, parameters) => {
    const lowerMethod = apiMethod.toLowerCase();
    
    const schemaParameterDefinitions = schemaRetriever.getRequestParameters(api, apiPath, lowerMethod);
    
    const bodyParameterDefinition = schemaParameterDefinitions.find(param => param.in === 'body');
    
    if (typeof parameters.body !== 'undefined' && typeof bodyParameterDefinition === 'undefined') {
        throw new SchemaAccessError(`Unable to find schema definition for request body of '${lowerMethod}' on '${apiPath}' in schema`)
    }
    if (typeof parameters.body === 'undefined' && typeof bodyParameterDefinition !== 'undefined' && bodyParameterDefinition.required) {
        throw new SchemaAccessError(`Body parameter is required for '${lowerMethod}' on '${apiPath}'`)
    }
    
    if (typeof parameters.body !== 'undefined' && typeof bodyParameterDefinition !== 'undefined') {
        const targetSchema = bodyParameterDefinition.schema;
        const result = jsonSchema.validate(parameters.body, targetSchema, {
            throwError: true,
        });
    }
    
    const pathParameterDefinitions = schemaParameterDefinitions.filter(param => param.in === 'path');
    
    pathParameters = parameters.path || {};
    Object.keys(pathParameters).forEach(key => {
        const targetSchema = pathParameterDefinitions.find(param => param.name === key);
        const results = jsonSchema.validate(pathParameters[key], targetSchema, {
            throwError: true,
        })
    })
}