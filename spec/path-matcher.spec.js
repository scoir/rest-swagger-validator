const pathToRegex = require('../lib/swagger-path-to-regex')

describe('swagger-path-to-regex', function () {
    it('should convert a path to a regex', () => {
        const path = '/some-url/{with}/{params}'
        expect(pathToRegex.convertToRegexer(path)).toEqual({
            path,
            regex: /^\/some-url\/([^\/]+)\/([^\/]+)$/,
            params: ['with', 'params']
        })
    })
    it('should match a path to a regex matcher', () => {
        const path = '/some-url/{with}/{params}'
        const regexer = pathToRegex.convertToRegexer(path)
        const result = pathToRegex.match('/some-url/path-part1/path-part2', regexer)
        expect(result).toEqual({
            params: {
                with: 'path-part1',
                params: 'path-part2',
            }
        })
    })
});