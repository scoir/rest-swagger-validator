const swagga = require('../')

describe('swagga', function () {
    describe('validateRequest()', function () {
        it('should fail if the path is not in the api spec', async () => {
            const validator = await swagga.createFor('./spec/fixtures/single-get.yaml')
            expect(() => {
                validator.validateRequest('/does/not/exist', 'GET')
            }).toThrowError('Unable to find \'/does/not/exist\' in schema')
        })
        it('should fail if the path and method are not in the api spec', async () => {
            const validator = await swagga.createFor('./spec/fixtures/single-get.yaml')
            expect(() => {
                validator.validateRequest('/pets/123', 'PUT')
            }).toThrowError('Unable to find \'put\' on \'/pets/{id}\' in schema')
        })
        describe('#body validation', () => {
            it('should fail if the body does not the match the schema definition', async () => {
                const spy = jasmine.createSpy('exception');
                const validator = await swagga.createFor('./spec/fixtures/single-post.yaml')
                try {
                    validator.validateRequest('/pets/123', 'POST', {
                        body: {}
                    })
                } catch (e) {
                    spy(e);
                }
                expect(spy).toHaveBeenCalledWith([jasmine.objectContaining({
                    keyword: 'type',
                    message: 'should be array',
                })]);
            })
            it('should fail if the body does not exist, but the schema requires one', async () => {
                const validator = await swagga.createFor('./spec/fixtures/single-post.yaml')
                expect(() => {
                    validator.validateRequest('/pets/123', 'POST', {})
                }).toThrowError('Body parameter is required for \'post\' on \'/pets/123\'')
            })
            it('should not fail if the body does not exist, but the schema provides an optional one', async () => {
                const validator = await swagga.createFor('./spec/fixtures/single-post-no-required-body.yaml')
                const result = validator.validateRequest('/pets/123', 'POST', {})
                expect(result).toBeUndefined()
            })
            it('should fail if the body exists, but the schema does not define one', async () => {
                const validator = await swagga.createFor('./spec/fixtures/single-get.yaml')
                expect(() => {
                    validator.validateRequest('/pets/123', 'GET', {
                        body: {
                            some: 'field',
                        }
                    })
                }).toThrowError('Unable to find schema definition for request body of \'get\' on \'/pets/123\' in schema')
            })
            it('should return nothing if the request is valid', async () => {
                const validator = await swagga.createFor('./spec/fixtures/single-post.yaml')
                const result = validator.validateRequest('/pets/123', 'POST', {
                    body: []
                })
                expect(result).toBeUndefined()
            })
        })
        describe('#query parameter validation', () => {
            it('should fail if a query parameter does not match the corresponding schema', async () => {
                const spy = jasmine.createSpy('exception');
                const validator = await swagga.createFor('./spec/fixtures/single-get-with-boolean-parameter.yaml')
                expect(() => {
                    validator.validateRequest('/pets/123', 'GET', {
                        query: {
                            needsMe: '123',
                        }
                    })
                }).toThrow(jasmine.arrayContaining([
                    jasmine.objectContaining({
                        keyword: 'type',
                        dataPath: '.needsMe',
                        message: 'should be boolean',
                    })
                ]))
            })
            it('should attempt to coerce the query paremeters into the corresponding type', async () => {
                const spy = jasmine.createSpy('exception');
                const validator = await swagga.createFor('./spec/fixtures/single-get-with-boolean-parameter.yaml')
                const result = validator.validateRequest('/pets/123', 'GET', {
                    query: {
                        needsMe: 'true',
                    }
                })
                
                expect(result).toBeUndefined()
            })
            it('should ensure that required parameters are required', async () => {
                const spy = jasmine.createSpy('exception');
                const validator = await swagga.createFor('./spec/fixtures/single-get-with-boolean-parameter.yaml')
                expect(() => {
                    validator.validateRequest('/pets/123', 'GET', {
                        query: {
                            somethingElse: '123',
                        }
                    })
                }).toThrow(jasmine.arrayContaining([
                    jasmine.objectContaining({
                        keyword: 'required',
                        message: 'should have required property \'needsMe\'',
                    })
                ]))
            })
        })
        describe('#path parameter validation', () => {
            it('should fail if a path parameter does not match the corresponding schema', async () => {
                const spy = jasmine.createSpy('exception');
                const validator = await swagga.createFor('./spec/fixtures/single-get.yaml')
                expect(() => {
                    validator.validateRequest('/pets/abc', 'GET', {})
                }).toThrow(jasmine.arrayContaining([
                    jasmine.objectContaining({
                        keyword: 'type',
                        dataPath: '.id',
                        message: 'should be integer',
                    })
                ]))
            })
            it('should attempt to coerce the query paremeters into the corresponding type', async () => {
                const spy = jasmine.createSpy('exception');
                const validator = await swagga.createFor('./spec/fixtures/single-get-with-boolean-parameter.yaml')
                const result = validator.validateRequest('/pets/123', 'GET', {
                    query: {
                        needsMe: 'true',
                    }
                })
                
                expect(result).toBeUndefined()
            })
            it('should ensure that required parameters are required', async () => {
                const spy = jasmine.createSpy('exception');
                const validator = await swagga.createFor('./spec/fixtures/single-get-with-boolean-parameter.yaml')
                expect(() => {
                    validator.validateRequest('/pets/123', 'GET', {
                        query: {
                            somethingElse: '123',
                        }
                    })
                }).toThrow(jasmine.arrayContaining([
                    jasmine.objectContaining({
                        keyword: 'required',
                        message: 'should have required property \'needsMe\'',
                    })
                ]))
            })
        })
    })
    
    describe('validateResponse()', function () {
        it('should fail if the path is not in the api spec', async () => {
            const validator = await swagga.createFor('./spec/fixtures/single-get.yaml')
            expect(() => {
                validator.validateResponse('/does/not/exist', 'GET')
            }).toThrowError('Unable to find \'/does/not/exist\' in schema')
        })
        it('should fail if the path and method are not in the api spec', async () => {
            const validator = await swagga.createFor('./spec/fixtures/single-get.yaml')
            expect(() => {
                validator.validateResponse('/pets/123', 'PUT')
            }).toThrowError('Unable to find \'put\' on \'/pets/{id}\' in schema')
        })
        it('should fail if the path and method can not return the specified status', async () => {
            const validator = await swagga.createFor('./spec/fixtures/single-post.yaml')
            expect(() => {
                validator.validateResponse('/pets/123', 'POST', 450)
            }).toThrowError('Unable to find response code 450 for \'post\' on \'/pets/{id}\' in schema')
        })
        it('should fail if the body does not match the schema definition', async () => {
            const spy = jasmine.createSpy('exception');
            const validator = await swagga.createFor('./spec/fixtures/single-post.yaml')
            
            try {
                validator.validateResponse('/pets/123', 'POST', 200, [])
            } catch (e) {
                spy(e);
            }
            expect(spy).toHaveBeenCalledWith([
                jasmine.objectContaining({
                    keyword: 'type',
                    message: 'should be object',
                })
            ]);
        })
    })
})