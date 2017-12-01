const swaggerPathRegex = require('./swagger-path-to-regex')
const errors = require('./errors')

module.exports = (regexPathDefinitions) => {
    return {
        match: (path) => {
            const regexer = regexPathDefinitions.find(regexPath => swaggerPathRegex.match(path, regexPath))
            
            if (typeof regexer !== 'object') {
                return {
                    errors: [
                        errors.create('missing', `'${path}' in schema`)
                    ],
                }
            }
            
            return {
                result: Object.assign(
                    {},
                    regexer,
                    swaggerPathRegex.match(path, regexer)
                )
            }
        },
    }
}