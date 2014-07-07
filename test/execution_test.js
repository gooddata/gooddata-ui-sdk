// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
define(['execution', 'jquery'], function(ex, $) {
    describe('execution', function() {
        describe('with fake server', function() {
            beforeEach(function() {
                this.server = sinon.fakeServer.create();
                this.server.autoRespond = true;
            });

            afterEach(function() {
                this.server.restore();
                delete this.server;
            });

            describe('Data Execution:', function() {
                beforeEach(function() {
                    this.serverResponseMock = {
                        executionResult: {
                            columns: [
                                {
                                    attributeDisplayForm: {
                                        meta: {
                                            identifier: 'attrId',
                                            uri: 'attrUri',
                                            title: 'title'
                                        }
                                    }
                                },
                                {
                                    metric: {
                                        meta: {
                                            identifier: 'metricId',
                                            uri: 'metricUri'
                                        },
                                        content: {
                                            format: '#00'
                                        }
                                    }
                                }
                            ],
                            tabularDataResult: '/gdc/internal/projects/myFakeProjectId/experimental/executions/23452345'
                        }
                    };
                });

                describe('getData', function() {
                    it('should resolve with JSON with correct data', function(done) {
                        this.server.respondWith(
                            '/gdc/internal/projects/myFakeProjectId/experimental/executions',
                            [200, {'Content-Type': 'application/json'},
                            JSON.stringify(this.serverResponseMock)]
                        );
                        this.server.respondWith(
                            /\/gdc\/internal\/projects\/myFakeProjectId\/experimental\/executions\/(\w+)/,
                            [201, {'Content-Type': 'application/json'},
                            JSON.stringify({'tabularDataResult': {values: ['a', 1]}})]
                        );

                        ex.getData('myFakeProjectId', ['attrId', 'metricId']).then(function(result) {
                            expect(result.headers[0].id).to.be('attrId');
                            expect(result.headers[1].id).to.be('metricId');
                            expect(result.rawData[0]).to.be('a');
                            expect(result.rawData[1]).to.be(1);
                            done();
                        }, function(err) {
                            expect().fail('Should resolve with CSV data');
                            done();
                        });
                    });

                    it('should not fail if tabular data result is missing', function(done) {
                        this.server.respondWith(
                            '/gdc/internal/projects/myFakeProjectId/experimental/executions',
                            [200, {'Content-Type': 'application/json'},
                            JSON.stringify(this.serverResponseMock)]
                        );
                        this.server.respondWith(
                            /\/gdc\/internal\/projects\/myFakeProjectId\/experimental\/executions\/(\w+)/,
                            [204, {'Content-Type': 'application/json'}, ""]
                        );

                        ex.getData('myFakeProjectId', ['attrId', 'metricId']).then(function(result) {
                            expect(result.rawData).to.eql([]);
                            done();
                        }, function(err) {
                            expect().fail('Should resolve with empty data');
                            done();
                        });
                    });

                    it('should reject when execution fails', function(done) {
                        this.server.respondWith(
                            '/gdc/internal/projects/myFakeProjectId/experimental/executions',
                            [400, {'Content-Type': 'application/json'}, JSON.stringify({'reportDefinition':{'meta': {'uri': '/foo/bar/baz'}}})]
                        );

                        ex.getData('myFakeProjectId', ['attrId', 'metricId']).then(function(result) {
                            expect().fail('Should reject with 400');
                            done();
                        }, function(err) {
                            expect(err.status).to.be(400);
                            done();
                        });
                    });

                    it('should reject with 400 when data result fails', function(done) {
                        this.server.respondWith(
                            '/gdc/internal/projects/myFakeProjectId/experimental/executions',
                            [200, {'Content-Type': 'application/json'},
                            JSON.stringify(this.serverResponseMock)]
                        );
                        this.server.respondWith(
                            /\/gdc\/internal\/projects\/myFakeProjectId\/experimental\/executions\/(\w+)/,
                            [400, {'Content-Type': 'application/json'},
                            JSON.stringify({'tabularDataResult': {values: ['a', 1]}})]
                        );

                        ex.getData('myFakeProjectId', [{type: 'metric', uri: '/metric/uri'}]).then(function(result) {
                            expect().fail('Should reject with 400');
                            done();
                        }, function(err) {
                            expect(err.status).to.be(400);
                            done();
                        });
                    });
                });

                describe('getData with execution context filters', function() {
                    it('should propagate execution context filters to the server call', function() {
                        // prepare filters and then use them with getData
                        var filters = [{
                            "uri": "/gdc/md/myFakeProjectId/obj/1",
                            "constraint": {
                                "type": "list",
                                "elements": ["/gdc/md/myFakeProjectId/obj/1/elements?id=1"]
                            }
                        }];
                        var data = ex.getData('myFakeProjectId', ['attrId', 'metricId'], {
                            filters: filters
                        });

                        var request = this.server.requests[0];
                        var requestBody = JSON.parse(request.requestBody);

                        expect(requestBody.execution.filters).to.eql(filters);
                    });
                });

                describe('getData with query language filters', function() {
                    it('should propagate filters to the server call', function() {
                        // prepare filters and then use them with getData
                        var where = {
                            'label.attr.city': { '$eq' : 1 }
                        };
                        var data = ex.getData('myFakeProjectId', ['attrId', 'metricId'], {
                            where: where
                        });

                        var request = this.server.requests[0];
                        var requestBody = JSON.parse(request.requestBody);

                        expect(requestBody.execution.where).to.eql(where);
                    });
                });
            });

        });

    });
});

