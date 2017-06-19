const helper = require('./helper');
const SchemaAccessError = require('./schema-access-error');
const swaggerPathRegex = require('./swagger-path-to-regex')

const getMethodAndPathSchema = (api, path, method) => {
    
    const regexPathDefinitions = api._regexPaths || [];
    
    const matchingRegex = regexPathDefinitions.find(regexPath => swaggerPathRegex.match(path, regexPath))
    
    if (matchingRegex === undefined) {
        throw new SchemaAccessError(
            `Unable to find '${path}' in schema`,
            api.paths
        )
    }
    
    const pathObj = api.paths[matchingRegex.path];
    
    if (typeof pathObj[method] !== 'object') {
        throw new SchemaAccessError(
            `Unable to find '${method}' on '${path}' in schema`,
            pathObj
        );
    }
    
    return pathObj[method];
};

module.exports = {
    getRequestParameters: (api, path, method) => {
        return getMethodAndPathSchema(api, path, method).parameters || [];
    },
    getResponseStatus: (api, path, method, status) => {
        const pathWithMethod = getMethodAndPathSchema(api, path, method);
        if (typeof pathWithMethod.responses !== 'object') {
            throw new SchemaAccessError(`Unable to find responses for '${method}' on '${path}' in schema`);
        }
        if (typeof pathWithMethod.responses[status] !== 'object') {
            throw new SchemaAccessError(
                `Unable to find response code ${status} for '${method}' on '${path}' in schema`,
                pathWithMethod.responses
            );
        }
        return pathWithMethod.responses[status];
    }
}