const swaggerPathRegex = require('./swagger-path-to-regex')

module.exports = (regexPathDefinitions) => {
    return {
        match: (path) => {
            const regexer = regexPathDefinitions.find(regexPath => swaggerPathRegex.match(path, regexPath))
            return swaggerPathRegex.match(path, regexer)
        },
    }
}