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
        
    describe('validateRequest()', function () {
        it('should fail if the path is not in the api spec', async () => {
            await swagga.parseDefinition('./spec/fixtures/single-get.yaml')
            expect(() => {
                swagga.validateRequest('/does/not/exist', 'GET')
            }).toThrowError('Unable to find \'/does/not/exist\' in schema')
        })
        it('should fail if the path and method are not in the api spec', async () => {
            await swagga.parseDefinition('./spec/fixtures/single-get.yaml')
            expect(() => {
                swagga.validateRequest('/pets/123', 'PUT')
            }).toThrowError('Unable to find \'put\' on \'/pets/123\' in schema')
        })
        it('should fail if the body does not the match the schema definition', async () => {
            const spy = jasmine.createSpy('exception');
            await swagga.parseDefinition('./spec/fixtures/single-post.yaml')
            try {
                swagga.validateRequest('/pets/123', 'POST', {
                    body: {}
                })
            } catch (e) {
                spy(e.property, e.message);
            }
            expect(spy).toHaveBeenCalledWith('instance', 'is not of a type(s) array');
        })
        it('should fail if the body does not exist, but the schema requires one', async () => {
            await swagga.parseDefinition('./spec/fixtures/single-post.yaml')
            expect(() => {
                swagga.validateRequest('/pets/123', 'POST', {})
            }).toThrowError('Body parameter is required for \'post\' on \'/pets/123\'')
        })
    })
    
    describe('validateResponse()', function () {
        it('should fail if the path is not in the api spec', async () => {
            await swagga.parseDefinition('./spec/fixtures/single-get.yaml')
            expect(() => {
                swagga.validateResponse('/does/not/exist', 'GET')
            }).toThrowError('Unable to find \'/does/not/exist\' in schema')
        })
        it('should fail if the path and method are not in the api spec', async () => {
            await swagga.parseDefinition('./spec/fixtures/single-get.yaml')
            expect(() => {
                swagga.validateResponse('/pets/123', 'PUT')
            }).toThrowError('Unable to find \'put\' on \'/pets/123\' in schema')
        })
        it('should fail if the path and method can not return the specified status', async () => {
            await swagga.parseDefinition('./spec/fixtures/single-post.yaml')
            expect(() => {
                swagga.validateResponse('/pets/123', 'POST', 450)
            }).toThrowError('Unable to find response code 450 for \'post\' on \'/pets/123\' in schema')
        })
        it('should fail if the body does not match the schema definition', async () => {
            const spy = jasmine.createSpy('exception');
            await swagga.parseDefinition('./spec/fixtures/single-post.yaml')
            
            try {
                swagga.validateResponse('/pets/123', 'POST', 200, [])
            } catch (e) {
                spy(e.property, e.message);
            }
            expect(spy).toHaveBeenCalledWith('instance', 'is not of a type(s) object');
        })
    })
})