const helper = require('./helper')
const errors = require('./errors')

const getMethodAndPathSchema = (api, swaggerPath, method) => {
    const pathObj = api.paths[swaggerPath]
    
    if (typeof pathObj[method] !== 'object') {
        return {
            errors: [
                errors.create('missing', `method ${method} not in schema`)
            ]
        }
    }
    
    return {
        result: pathObj[method]
    }
};

module.exports = (api) => {
    return {
        getRequestParameters: (swaggerPath, method) => {
            const {result:methodAndPath, errors:accessErrors} = getMethodAndPathSchema(api, swaggerPath, method)
            if (accessErrors) {
                return {
                    errors: accessErrors,
                }
            }
            return {
                result: methodAndPath.parameters || [],
            }
        },
        getResponseStatus: (swaggerPath, method, status) => {
            const {result:methodAndPath, errors:accessErrors} = getMethodAndPathSchema(api, swaggerPath, method)
            if (accessErrors) {
                return {
                    errors: accessErrors
                }
            }
            
            if (typeof methodAndPath.responses !== 'object') {
                return {
                    errors: [
                        errors.create('missing', 'responses')
                    ]
                }
            }
            if (typeof methodAndPath.responses[status] !== 'object') {
                return {
                    errors: [
                        errors.create('missing', `${status} response`)
                    ]
                }
            }
            return {
                result: methodAndPath.responses[status],
            }
        }
    };
};
