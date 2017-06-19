const GROUP_MATCHER_REGEX = /{[^}]+}/g;
const GROUP_MATCH_BRACKET_REGEX = /{|}/g
const STRING_REPLACE_FOR_GROUP_MATCH = '([^\/]+)';

module.exports = {
    convertToRegexer: (path) => {
        let regexPath = path;
        const result = {
            path: path
        }
        const groups = path.match(GROUP_MATCHER_REGEX)
        result.params = groups.map(group => group.replace(GROUP_MATCH_BRACKET_REGEX, ''))
        groups.forEach(group => {
            regexPath = regexPath.replace(group, STRING_REPLACE_FOR_GROUP_MATCH);
        })
        regexPath = regexPath.replace('/', '\/')
        result.regex = new RegExp(`^${regexPath}$`)
        return result;
    },
    match: (path, regexer) => {
        if (!path.match(regexer.regex)) {
            return
        }
        const matches = path.match(regexer.regex)
        const captured = Array.prototype.slice.call(matches, 1)
        if (captured.length !== regexer.params.length) {
            return
        }
        
        const result = {
            params: {}
        }
        captured.forEach((match, idx) => {
            result.params[regexer.params[idx]] = match
        })
        return result;
    },
}