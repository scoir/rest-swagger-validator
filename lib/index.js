const SwaggerParser = require('swagger-parser');
const buildRequestValidator = require('./request-validator');
const buildResponseValidator = require('./response-validator');
const buildPathMatcher = require('./path-matcher');
const swaggerPathRegex = require('./swagger-path-to-regex');
const schemaRetrieval = require('./schema-retrieval');

const debug = require('debug');
const rootDebug = debug('rest-swagger-validator');
const regexDebug = debug('rest-swagger-validator:regex-builder');

const parser = new SwaggerParser();

const filenameToSwaggerDefinition = {};

module.exports = {
    createFor: async (swaggerFile) => {
        rootDebug(`initializing with ${swaggerFile}`)
        if (!filenameToSwaggerDefinition.hasOwnProperty(swaggerFile)) {
            rootDebug('building new instance')
            const api = await parser.dereference(swaggerFile);
            const regexToPathMapping = [];
            Object.keys(api.paths).forEach(path => {
                regexDebug(`building regex for ${path}`)
                const regPath = swaggerPathRegex.convertToRegexer(path)
                regexToPathMapping.push(regPath)
                regexDebug(`built ${regPath.regex} for ${path}`)
            })
            
            const retriever = schemaRetrieval(api, regexToPathMapping);
            const pathMatcher = buildPathMatcher(regexToPathMapping)
            
            filenameToSwaggerDefinition[swaggerFile] = {
                validateRequest: buildRequestValidator(retriever, pathMatcher),
                validateResponse: buildResponseValidator(retriever, pathMatcher),
            };
            rootDebug('finished building instance')
        }
        return filenameToSwaggerDefinition[swaggerFile];
    }
};
