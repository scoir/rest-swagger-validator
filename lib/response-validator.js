const jsonSchema = require('jsonschema');
const schemaRetriever = require('./schema-retrieval');
const SchemaAccessError = require('./schema-access-error');
const h = require('./helper');

module.exports = (api, apiPath, apiMethod, status, body) => {
    const lowerMethod = apiMethod.toLowerCase();
    
    const statusResponse = schemaRetriever.getResponseStatus(api, apiPath, lowerMethod, status);
    
    if (h.isDefined(body) && !h.isObject(statusResponse.schema)) {
        throw new SchemaAccessError(`Unable to find schema definition for response code ${status} of '${lowerMethod}' on '${apiPath}' in schema`)
    }
    
    if (h.isDefined(body)) {
        const targetSchema = statusResponse.schema;
        const results = jsonSchema.validate(body, targetSchema, {
            throwError: true
        })
    }
}