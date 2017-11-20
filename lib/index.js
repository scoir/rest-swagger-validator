const SwaggerParser = require('swagger-parser');
const buildRequestValidator = require('./request-validator');
const buildResponseValidator = require('./response-validator');

const swaggerPathRegex = require('./swagger-path-to-regex');
const schemaRetrieval = require('./schema-retrieval');

const debug = require('debug');
const rootDebug = debug('swagga');

const parser = new SwaggerParser();

const swaggas = {};

module.exports = {
    createFor: async (swaggerFile) => {
        rootDebug(`initializing with ${swaggerFile}`)
        if (!swaggas.hasOwnProperty(swaggerFile)) {
            rootDebug('building new instance')
            const api = await parser.dereference(swaggerFile);
            const regexToPathMapping = [];
            Object.keys(api.paths).forEach(path => {
                debug('swagga:regex-builder')(`building regex for ${path}`)
                const regPath = swaggerPathRegex.convertToRegexer(path)
                regexToPathMapping.push(regPath)
                debug('swagga:regex-builder')(`built ${regPath.regex} for ${path}`)
            })
            
            const retriever = schemaRetrieval(api, regexToPathMapping);
            
            swaggas[swaggerFile] = {
                validateRequest: buildRequestValidator(retriever),
                validateResponse: buildResponseValidator(retriever),
            };
            rootDebug('finished building instance')
        }
        return swaggas[swaggerFile];
    }
};
