const helper = require('./helper')
const SchemaAccessError = require('./schema-access-error')

const getMethodAndPathSchema = (api, swaggerPath, method) => {
    const pathObj = api.paths[swaggerPath]
    
    if (typeof pathObj[method] !== 'object') {
        throw new SchemaAccessError(
            `Unable to find '${method}' on '${swaggerPath}' in schema`,
            pathObj
        )
    }
    
    return pathObj[method]
};

module.exports = (api) => {
    return {
        getRequestParameters: (swaggerPath, method) => {
            return getMethodAndPathSchema(api, swaggerPath, method).parameters || [];
        },
        getResponseStatus: (swaggerPath, method, status) => {
            const pathWithMethod = getMethodAndPathSchema(api, swaggerPath, method);
            if (typeof pathWithMethod.responses !== 'object') {
                throw new SchemaAccessError(`Unable to find responses for '${method}' on '${swaggerPath}' in schema`);
            }
            if (typeof pathWithMethod.responses[status] !== 'object') {
                throw new SchemaAccessError(
                    `Unable to find response code ${status} for '${method}' on '${swaggerPath}' in schema`,
                    pathWithMethod.responses
                );
            }
            return pathWithMethod.responses[status];
        }
    };
};
