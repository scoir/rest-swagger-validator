const swagga = require('../')

describe('swagga', function () {
    describe('validateRequest()', function () {
        it('should fail if the path is not in the api spec', async () => {
            const validator = await swagga.createFor('./spec/fixtures/single-get.yaml')
            expect(validator.validateRequest('/does/not/exist', 'GET')).toEqual([
                {
                    type: 'missing',
                    message: '\'/does/not/exist\' in schema'
                }
            ])
        })
        it('should fail if the path and method are not in the api spec', async () => {
            const validator = await swagga.createFor('./spec/fixtures/single-get.yaml')
            expect(validator.validateRequest('/pets/123', 'PUT')).toEqual([
                {
                    type: 'missing',
                    message: 'method put not in schema',
                }
            ])
        })
        describe('#body validation', () => {
            it('should fail if the body does not the match the schema definition', async () => {
                const validator = await swagga.createFor('./spec/fixtures/single-post.yaml')
                const result = validator.validateRequest('/pets/123', 'POST', {
                    body: {}
                })
                expect(result).toEqual([jasmine.objectContaining({
                    keyword: 'type',
                    message: 'should be array',
                })]);
            })
            it('should fail if the body does not exist, but the schema requires one', async () => {
                const validator = await swagga.createFor('./spec/fixtures/single-post.yaml')
                expect(validator.validateRequest('/pets/123', 'POST', {})).toEqual([
                    {
                        type: 'required',
                        message: 'body is required',
                    }
                ])
            })
            it('should not fail if the body does not exist, but the schema provides an optional one', async () => {
                const validator = await swagga.createFor('./spec/fixtures/single-post-no-required-body.yaml')
                const result = validator.validateRequest('/pets/123', 'POST', {})
                expect(result).toBeUndefined()
            })
            it('should fail if the body exists, but the schema does not define one', async () => {
                const validator = await swagga.createFor('./spec/fixtures/single-get.yaml')
                const result = validator.validateRequest('/pets/123', 'GET', {
                    body: {
                        some: 'field',
                    }
                })
                expect(result).toEqual([
                    {
                        type: 'missing',
                        message: 'body is not available in spec',
                    }
                ])
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
                const validator = await swagga.createFor('./spec/fixtures/single-get-with-boolean-parameter.yaml')
                const result = validator.validateRequest('/pets/123', 'GET', {
                    query: {
                        needsMe: '123',
                    }
                })
                expect(result).toEqual(jasmine.arrayContaining([
                    jasmine.objectContaining({
                        keyword: 'type',
                        dataPath: '.needsMe',
                        message: 'should be boolean',
                    })
                ]))
            })
            it('should attempt to coerce the query paremeters into the corresponding type', async () => {
                const validator = await swagga.createFor('./spec/fixtures/single-get-with-boolean-parameter.yaml')
                const result = validator.validateRequest('/pets/123', 'GET', {
                    query: {
                        needsMe: 'true',
                    }
                })
                
                expect(result).toBeUndefined()
            })
            it('should ensure that required parameters are required', async () => {
                const validator = await swagga.createFor('./spec/fixtures/single-get-with-boolean-parameter.yaml')
                const result = validator.validateRequest('/pets/123', 'GET', {
                        query: {
                            somethingElse: '123',
                        }
                    })
                expect(result).toEqual(jasmine.arrayContaining([
                    jasmine.objectContaining({
                        keyword: 'required',
                        message: 'should have required property \'needsMe\'',
                    })
                ]))
            })
        })
        describe('#path parameter validation', () => {
            it('should fail if a path parameter does not match the corresponding schema', async () => {
                const validator = await swagga.createFor('./spec/fixtures/single-get.yaml')
                const result = validator.validateRequest('/pets/abc', 'GET', {})
                expect(result).toEqual(jasmine.arrayContaining([
                    jasmine.objectContaining({
                        keyword: 'type',
                        dataPath: '.id',
                        message: 'should be integer',
                    })
                ]))
            })
            it('should attempt to coerce the query paremeters into the corresponding type', async () => {
                const validator = await swagga.createFor('./spec/fixtures/single-get-with-boolean-parameter.yaml')
                const result = validator.validateRequest('/pets/123', 'GET', {
                    query: {
                        needsMe: 'true',
                    }
                })
                
                expect(result).toBeUndefined()
            })
            it('should ensure that required parameters are required', async () => {
                const validator = await swagga.createFor('./spec/fixtures/single-get-with-boolean-parameter.yaml')
                const result = validator.validateRequest('/pets/123', 'GET', {
                    query: {
                        somethingElse: '123',
                    }
                })
                expect(result).toEqual(jasmine.arrayContaining([
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
            expect(validator.validateResponse('/does/not/exist', 'GET')).toEqual([
                {
                    type: 'missing',
                    message: '\'/does/not/exist\' in schema',
                }
            ])
        })
        it('should fail if the path and method are not in the api spec', async () => {
            const validator = await swagga.createFor('./spec/fixtures/single-get.yaml')
            expect(validator.validateResponse('/pets/123', 'PUT')).toEqual([
                {
                    type: 'missing',
                    message: 'method put not in schema',
                }
            ])
        })
        it('should fail if the path and method can not return the specified status', async () => {
            const validator = await swagga.createFor('./spec/fixtures/single-post.yaml')
            expect(validator.validateResponse('/pets/123', 'POST', 450)).toEqual([
                {
                    type: 'missing',
                    message: '450 response',
                }
            ])
        })
        it('should fail if the body does not match the schema definition', async () => {
            const validator = await swagga.createFor('./spec/fixtures/single-post.yaml')
            const result = validator.validateResponse('/pets/123', 'POST', 200, [])
            expect(result).toEqual([
                jasmine.objectContaining({
                    keyword: 'type',
                    message: 'should be object',
                })
            ]);
        })
    })
})