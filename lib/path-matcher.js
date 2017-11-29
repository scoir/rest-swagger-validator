const swaggerPathRegex = require('./swagger-path-to-regex')
const SchemaAccessError = require('./schema-access-error')

module.exports = (regexPathDefinitions) => {
    return {
        match: (path) => {
            const regexer = regexPathDefinitions.find(regexPath => swaggerPathRegex.match(path, regexPath))
            
            if (typeof regexer !== 'object') {
                throw new SchemaAccessError(
                    `Unable to find '${path}' in schema`
                )
            }
            
            return Object.assign(
                {},
                regexer,
                swaggerPathRegex.match(path, regexer)
            )
        },
    }
}