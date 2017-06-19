const schemaRetriever = require('./schema-retrieval');
const jsonSchema = require('jsonschema');
const SchemaAccessError = require('./schema-access-error');

module.exports = (api, apiPath, apiMethod, status, body) => {
    const lowerMethod = apiMethod.toLowerCase();
    
    const statusResponse = schemaRetriever.getResponseStatus(api, apiPath, lowerMethod, status);
    
    if (typeof body !== 'undefined' && typeof statusResponse.schema !== 'object') {
        throw new SchemaAccessError(`Unable to find schema definition for response code ${status} of '${lowerMethod}' on '${apiPath}' in schema`)
    }
    
    if (typeof body !== 'undefined') {
        const targetSchema = statusResponse.schema;
        const results = jsonSchema.validate(body, targetSchema, {
            throwError: true
        })
    }
}