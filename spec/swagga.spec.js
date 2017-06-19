const swagga = require('../')

describe('swagga', function () {
    describe('parseDefinition()', function () {
        it('should parse a swagger yaml file', async () => {
            const definition = await swagga.parseDefinition('./spec/fixtures/basic.yaml')
            expect(definition.swagger).toEqual('2.0')
            expect(definition.info.title).toEqual('Basic Swagger YAML Definition')
        })
        it('should parse a swagger yaml file', async () => {
            const definition = await swagga.parseDefinition('./spec/fixtures/basic.json')
            expect(definition.swagger).toEqual('2.0')
            expect(definition.info.title).toEqual('Basic Swagger JSON Definition')
        })
    })
})