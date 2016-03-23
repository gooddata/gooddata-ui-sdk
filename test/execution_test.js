// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
/* eslint func-names:0 handle-callback-err: 0 */
import * as ex from '../src/execution';
import cloneDeep from 'lodash/lang/cloneDeep';

describe('execution', () => {
    describe('with fake server', () => {
        let server;
        let serverResponseMock;

        beforeEach(function() {
            server = sinon.fakeServer.create();
            server.autoRespond = true;
        });

        afterEach(function() {
            server.restore();
        });

        describe('Data Execution:', () => {
            beforeEach(function() {
                serverResponseMock = {
                    executionResult: {
                        columns: [
                            {
                                attributeDisplayForm: {
                                    meta: {
                                        identifier: 'attrId',
                                        uri: 'attrUri',
                                        title: 'Df Title'
                                    }
                                }
                            },
                            {
                                metric: {
                                    meta: {
                                        identifier: 'metricId',
                                        uri: 'metricUri',
                                        title: 'Metric Title'
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

            describe('getData', () => {
                it('should resolve with JSON with correct data without headers', done => {
                    server.respondWith(
                        '/gdc/internal/projects/myFakeProjectId/experimental/executions',
                        [200, {'Content-Type': 'application/json'},
                        JSON.stringify(serverResponseMock)]
                    );
                    server.respondWith(
                        /\/gdc\/internal\/projects\/myFakeProjectId\/experimental\/executions\/(\w+)/,
                        [201, {'Content-Type': 'application/json'},
                        JSON.stringify({'tabularDataResult': {values: ['a', 1]}})]
                    );

                    ex.getData('myFakeProjectId', ['attrId', 'metricId']).then(function(result) {
                        expect(result.headers[0].id).to.be('attrId');
                        expect(result.headers[0].uri).to.be('attrUri');
                        expect(result.headers[0].type).to.be('attrLabel');
                        expect(result.headers[0].title).to.be('Df Title');
                        expect(result.headers[1].id).to.be('metricId');
                        expect(result.headers[1].uri).to.be('metricUri');
                        expect(result.headers[1].type).to.be('metric');
                        expect(result.headers[1].title).to.be('Metric Title');
                        expect(result.rawData[0]).to.be('a');
                        expect(result.rawData[1]).to.be(1);
                        done();
                    }, function() {
                        expect().fail('Should resolve with CSV data');
                        done();
                    });
                });

                it('should resolve with JSON with correct data including headers', done => {
                    const responseMock = JSON.parse(JSON.stringify(serverResponseMock));

                    responseMock.executionResult.headers = [
                        {
                            id: 'attrId',
                            title: 'Atribute Title',
                            type: 'attrLabel',
                            uri: 'attrUri'
                        },
                        {
                            id: 'metricId',
                            title: 'Metric Title',
                            type: 'metric',
                            uri: 'metricUri'
                        }
                    ];

                    server.respondWith(
                        '/gdc/internal/projects/myFakeProjectId/experimental/executions',
                        [200, {'Content-Type': 'application/json'},
                        JSON.stringify(responseMock)]
                    );
                    server.respondWith(
                        /\/gdc\/internal\/projects\/myFakeProjectId\/experimental\/executions\/(\w+)/,
                        [201, {'Content-Type': 'application/json'},
                        JSON.stringify({'tabularDataResult': {values: ['a', 1]}})]
                    );

                    ex.getData('myFakeProjectId', ['attrId', 'metricId']).then(function(result) {
                        expect(result.headers[0].id).to.be('attrId');
                        expect(result.headers[0].uri).to.be('attrUri');
                        expect(result.headers[0].type).to.be('attrLabel');
                        expect(result.headers[0].title).to.be('Atribute Title');
                        expect(result.headers[1].id).to.be('metricId');
                        expect(result.headers[1].uri).to.be('metricUri');
                        expect(result.headers[1].type).to.be('metric');
                        expect(result.headers[1].title).to.be('Metric Title');
                        expect(result.rawData[0]).to.be('a');
                        expect(result.rawData[1]).to.be(1);
                        done();
                    }, function() {
                        expect().fail('Should resolve with CSV data');
                        done();
                    });
                });

                it('should not fail if tabular data result is missing', done => {
                    server.respondWith(
                        '/gdc/internal/projects/myFakeProjectId/experimental/executions',
                        [200, {'Content-Type': 'application/json'},
                        JSON.stringify(serverResponseMock)]
                    );
                    server.respondWith(
                        /\/gdc\/internal\/projects\/myFakeProjectId\/experimental\/executions\/(\w+)/,
                        [204, {'Content-Type': 'application/json'}, '']
                    );

                    ex.getData('myFakeProjectId', ['attrId', 'metricId']).then(function(result) {
                        expect(result.rawData).to.eql([]);
                        expect(result.isEmpty).to.be(true);
                        done();
                    }, function() {
                        expect().fail('Should resolve with empty data');
                        done();
                    });
                });

                it('should reject when execution fails', done => {
                    server.respondWith(
                        '/gdc/internal/projects/myFakeProjectId/experimental/executions',
                        [400, {'Content-Type': 'application/json'}, JSON.stringify({'reportDefinition': {'meta': {'uri': '/foo/bar/baz'}}})]
                    );

                    ex.getData('myFakeProjectId', ['attrId', 'metricId']).then(function() {
                        expect().fail('Should reject with 400');
                        done();
                    }, function(err) {
                        expect(err.status).to.be(400);
                        done();
                    });
                });

                it('should reject with 400 when data result fails', done => {
                    server.respondWith(
                        '/gdc/internal/projects/myFakeProjectId/experimental/executions',
                        [200, {'Content-Type': 'application/json'},
                        JSON.stringify(serverResponseMock)]
                    );
                    server.respondWith(
                        /\/gdc\/internal\/projects\/myFakeProjectId\/experimental\/executions\/(\w+)/,
                        [400, {'Content-Type': 'application/json'},
                        JSON.stringify({'tabularDataResult': {values: ['a', 1]}})]
                    );

                    ex.getData('myFakeProjectId', [{type: 'metric', uri: '/metric/uri'}]).then(function() {
                        expect().fail('Should reject with 400');
                        done();
                    }, function(err) {
                        expect(err.status).to.be(400);
                        done();
                    });
                });
            });

            describe('getData with execution context filters', () => {
                it('should propagate execution context filters to the server call', () => {
                    // prepare filters and then use them with getData
                    const filters = [{
                        'uri': '/gdc/md/myFakeProjectId/obj/1',
                        'constraint': {
                            'type': 'list',
                            'elements': ['/gdc/md/myFakeProjectId/obj/1/elements?id=1']
                        }
                    }];
                    ex.getData('myFakeProjectId', ['attrId', 'metricId'], {
                        filters: filters
                    });
                    const request = server.requests[0];
                    const requestBody = JSON.parse(request.requestBody);

                    expect(requestBody.execution.filters).to.eql(filters);
                });
            });

            describe('getData with order', () => {
                it('should propagate orderBy to server call', () => {
                    const orderBy = [
                        {
                            column: 'column1',
                            direction: 'asc'
                        },
                        {
                            column: 'column2',
                            direction: 'desc'
                        }
                    ];
                    let request;
                    let requestBody;

                    ex.getData('myFakeProjectId', ['attrId', 'metricId'], {
                        orderBy: orderBy
                    });

                    request = server.requests[0];
                    requestBody = JSON.parse(request.requestBody);
                    expect(requestBody.execution.orderBy).to.eql(orderBy);
                });
            });

            describe('getData with definitions', () => {
                it('should propagate orderBy to server call', () => {
                    const definitions = [
                        {
                            metricDefinition: {
                                'title': 'Closed Pipeline - previous year',
                                'expression': 'SELECT (SELECT {adyRSiRTdnMD}) FOR PREVIOUS ({date.year})',
                                'format': '#,,.00M',
                                'identifier': 'adyRSiRTdnMD.generated.pop.1fac4f897bbb5994a257cd2c9f0a81a4'
                            }
                        }
                    ];
                    ex.getData('myFakeProjectId', ['attrId', 'metricId'], {
                        definitions: definitions
                    });

                    /*eslint-disable vars-on-top*/
                    const request = server.requests[0];
                    const requestBody = JSON.parse(request.requestBody);
                    /*eslint-enable vars-on-top*/
                    expect(requestBody.execution.definitions).to.eql(definitions);
                });
            });

            describe('getData with query language filters', () => {
                it('should propagate filters to the server call', () => {
                    // prepare filters and then use them with getData
                    const where = {
                        'label.attr.city': { '$eq': 1 }
                    };
                    ex.getData('myFakeProjectId', ['attrId', 'metricId'], {
                        where: where
                    });
                    /*eslint-disable vars-on-top*/
                    const request = server.requests[0];
                    const requestBody = JSON.parse(request.requestBody);
                    /*eslint-enable vars-on-top*/

                    expect(requestBody.execution.where).to.eql(where);
                });
            });
        });

        describe('Execution with MD object', () => {
            let mdObj;
            beforeEach(() => {
                mdObj = {
                    'measures': [
                        {
                            'type': 'fact',
                            'aggregation': 'sum',
                            'objectUri': '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144',
                            'title': 'Sum of Amount',
                            'format': '#,##0.00',
                            'metricAttributeFilters': [
                                {
                                    'listAttributeFilter': {
                                        'attribute': '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/949',
                                        'displayForm': '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/952',
                                        'default': {
                                            'negativeSelection': false,
                                            'attributeElements': [
                                                '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/949/elements?id=168284',
                                                '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/949/elements?id=168282'
                                            ]
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            'type': 'metric',
                            'objectUri': '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1556',
                            'title': 'Probability BOP',
                            'format': '#,##0.00',
                            'metricAttributeFilters': []
                        }
                    ],
                    'categories': [
                        {
                            'type': 'attribute',
                            'collection': 'attribute',
                            'displayForm': '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1028'
                        }
                    ],
                    'filters': [
                        {
                            'listAttributeFilter': {
                                'attribute': '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1025',
                                'displayForm': '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1028',
                                'default': {
                                    'negativeSelection': false,
                                    'attributeElements': [
                                        '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1025/elements?id=1243',
                                        '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1025/elements?id=1242',
                                        '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1025/elements?id=1241',
                                        '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1025/elements?id=1240',
                                        '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1025/elements?id=1239',
                                        '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1025/elements?id=1238',
                                        '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1025/elements?id=1236'
                                    ]
                                }
                            }
                        }
                    ],
                    'stacks': []
                };
            });

            it('creates proper configuration for execution', () => {
                const executionConfiguration = ex.mdToExecutionConfiguration(mdObj);
                expect(executionConfiguration).to.eql({
                    'execution': {
                        'columns': [
                            'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.filtered_sum.469572f0e43df209235a82bb42c00129',
                            '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1556',
                            '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1028'
                        ],
                        'where': {
                            '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1028': {
                                '$in': [
                                    { 'id': 1243 },
                                    { 'id': 1242 },
                                    { 'id': 1241 },
                                    { 'id': 1240 },
                                    { 'id': 1239 },
                                    { 'id': 1238 },
                                    { 'id': 1236 }
                                ]
                            }
                        },
                        'definitions': [
                            {
                                'metricDefinition': {
                                    'identifier': 'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.filtered_sum.469572f0e43df209235a82bb42c00129',
                                    'expression': 'SELECT SUM([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144]) WHERE [/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/949] IN ([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/949/elements?id=168284],[/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/949/elements?id=168282])',
                                    'title': 'Sum of Amount',
                                    'format': '#,##0.00'
                                }
                            }
                        ]
                    }
                });
            });

            it('handles empty filters', () => {
                const mdObjWithoutFilters = cloneDeep(mdObj);
                mdObjWithoutFilters.measures[0].metricAttributeFilters[0].listAttributeFilter.default.attributeElements = [];
                const executionConfiguration = ex.mdToExecutionConfiguration(mdObjWithoutFilters);
                expect(executionConfiguration).to.eql({
                    'execution': {
                        'columns': [
                            'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.sum.1e157fec15ec162b3c6da2e404b7d4b3',
                            '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1556',
                            '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1028'
                        ],
                        'where': {
                            '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1028': {
                                '$in': [
                                    { 'id': 1243 },
                                    { 'id': 1242 },
                                    { 'id': 1241 },
                                    { 'id': 1240 },
                                    { 'id': 1239 },
                                    { 'id': 1238 },
                                    { 'id': 1236 }
                                ]
                            }
                        },
                        'definitions': [
                            {
                                'metricDefinition': {
                                    'identifier': 'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.sum.1e157fec15ec162b3c6da2e404b7d4b3',
                                    'expression': 'SELECT SUM([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144])',
                                    'title': 'Sum of Amount',
                                    'format': '#,##0.00'
                                }
                            }
                        ]
                    }
                });
            });
        });
    });
});

