// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
/* eslint func-names:0 handle-callback-err: 0 */
import { cloneDeep, range } from 'lodash';

import * as ex from '../src/execution';
import { expectColumns, expectMetricDefinition, expectOrderBy, expectWhereCondition } from './helpers/execution';

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
                        headers: [
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
                        ],
                        tabularDataResult: '/gdc/internal/projects/myFakeProjectId/experimental/executions/23452345'
                    }
                };
            });

            describe('getData', () => {
                it('should resolve with JSON with correct data including headers', done => {
                    const responseMock = JSON.parse(JSON.stringify(serverResponseMock));

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

                it('should wrap response headers with metric mappings', () => {
                    server.respondWith(
                        '/gdc/internal/projects/myFakeProjectId/experimental/executions',
                        [200, {'Content-Type': 'application/json'},
                            JSON.stringify(serverResponseMock)]
                    );
                    server.respondWith(
                        /\/gdc\/internal\/projects\/myFakeProjectId\/experimental\/executions\/(\w+)/,
                        [204, {'Content-Type': 'application/json'}, '']
                    );

                    return ex.getData(
                        'myFakeProjectId',
                        [{type: 'metric', uri: '/metric/uri'}],
                        {
                            metricMappings: [
                                { element: 'metricUri', measureIndex: 0 }
                            ]
                        }
                    ).then(function(result) {
                        expect(result.headers[1]).to.eql({
                            id: 'metricId',
                            title: 'Metric Title',
                            type: 'metric',
                            uri: 'metricUri',
                            measureIndex: 0,
                            isPoP: undefined
                        });
                    }, function() {
                        expect().fail('Should not fail when processing mappings');
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
                    buckets: {
                        'measures': [
                            {
                                'measure': {
                                    'type': 'fact',
                                    'aggregation': 'sum',
                                    'objectUri': '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144',
                                    'title': 'Sum of Amount',
                                    'format': '#,##0.00',
                                    'measureFilters': [
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
                                    ],
                                    'sort': 'desc'
                                }
                            },
                            {
                                'measure': {
                                    'type': 'attribute',
                                    'aggregation': 'count',
                                    'objectUri': '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1244',
                                    'title': 'Count of Activity',
                                    'format': '#,##0.00',
                                    'measureFilters': []
                                }
                            },
                            {
                                'measure': {
                                    'type': 'metric',
                                    'objectUri': '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1556',
                                    'title': 'Probability BOP',
                                    'format': '#,##0.00',
                                    'measureFilters': []
                                }
                            },
                            {
                                'measure': {
                                    'type': 'metric',
                                    'objectUri': '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/2825',
                                    'title': '# of Opportunities (Account: 1 Source Consulting, 1-800 Postcards, 1-800 We Answer, 1-888-OhioComp, 14 West)',
                                    'format': '#,##0',
                                    'measureFilters': [
                                        {
                                            'listAttributeFilter': {
                                                'attribute': '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969',
                                                'displayForm': '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/970',
                                                'default': {
                                                    'negativeSelection': false,
                                                    'attributeElements': [
                                                        '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969/elements?id=961042',
                                                        '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969/elements?id=961038',
                                                        '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969/elements?id=958079',
                                                        '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969/elements?id=961044',
                                                        '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969/elements?id=961046'
                                                    ]
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        ],
                        'categories': [
                            {
                                'category': {
                                    'type': 'attribute',
                                    'collection': 'attribute',
                                    'displayForm': '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1028',
                                    'sort': 'asc'
                                }
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
                            }, {
                                'dateFilter': {
                                    'dimension': '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/16561',
                                    'granularity': 'GDC.time.week',
                                    'from': -3,
                                    'to': 0
                                }
                            }
                        ]
                    }
                };
            });

            it('creates proper configuration for execution', () => {
                const execConfig = ex.mdToExecutionConfiguration(mdObj);

                expectColumns([
                    '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1028',
                    'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.filtered_sum.b9f95d95adbeac03870b764f8b2c3402',
                    'attribute_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1244.generated.count.a865b88e507b9390e2175b79e1d6252f',
                    '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1556',
                    'metric_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_2825.generated.filtered_base.3812d81c1c1609700e47fc800e85bfac'
                ], execConfig);

                expectMetricDefinition({
                    identifier: 'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.filtered_sum.b9f95d95adbeac03870b764f8b2c3402',
                    expression: 'SELECT SUM([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144]) WHERE [/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/949] IN ([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/949/elements?id=168284],[/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/949/elements?id=168282])',
                    title: 'Sum of Amount',
                    format: '#,##0.00'
                }, execConfig);

                expectMetricDefinition({
                    'identifier': 'attribute_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1244.generated.count.a865b88e507b9390e2175b79e1d6252f',
                    'expression': 'SELECT COUNT([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1244])',
                    'title': 'Count of Activity',
                    'format': '#,##0.00'
                }, execConfig);

                expectMetricDefinition({
                    identifier: 'metric_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_2825.generated.filtered_base.3812d81c1c1609700e47fc800e85bfac',
                    expression: 'SELECT [/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/2825] WHERE [/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969] IN ([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969/elements?id=961042],[/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969/elements?id=961038],[/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969/elements?id=958079],[/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969/elements?id=961044],[/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969/elements?id=961046])',
                    title: '# of Opportunities (Account: 1 Source Consulting, 1-800 Postcards, 1-800 We Answer, 1-888-OhioComp, 14 West)',
                    format: '#,##0'
                }, execConfig);

                expectWhereCondition({
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
                    },
                    '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/16561': {
                        '$between': [-3, 0],
                            '$granularity': 'GDC.time.week'
                    }
                }, execConfig);
            });

            it('handles empty filters', () => {
                const mdObjWithoutFilters = cloneDeep(mdObj);
                mdObjWithoutFilters.buckets.measures[0].measure.measureFilters[0].listAttributeFilter.default.attributeElements = [];
                const execConfig = ex.mdToExecutionConfiguration(mdObjWithoutFilters);

                expectColumns([
                    '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1028',
                    'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.sum.7537800b1daf7582198e84ca6205d600',
                    'attribute_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1244.generated.count.a865b88e507b9390e2175b79e1d6252f',
                    '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1556',
                    'metric_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_2825.generated.filtered_base.3812d81c1c1609700e47fc800e85bfac'
                ], execConfig);

                expectMetricDefinition({
                    identifier: 'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.sum.7537800b1daf7582198e84ca6205d600',
                    expression: 'SELECT SUM([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144])',
                    title: 'Sum of Amount',
                    format: '#,##0.00'
                }, execConfig);

                expectMetricDefinition({
                    identifier: 'attribute_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1244.generated.count.a865b88e507b9390e2175b79e1d6252f',
                    expression: 'SELECT COUNT([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1244])',
                    title: 'Count of Activity',
                    format: '#,##0.00'
                }, execConfig);

                expectMetricDefinition({
                    'identifier': 'metric_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_2825.generated.filtered_base.3812d81c1c1609700e47fc800e85bfac',
                    'expression': 'SELECT [/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/2825] WHERE [/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969] IN ([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969/elements?id=961042],[/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969/elements?id=961038],[/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969/elements?id=958079],[/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969/elements?id=961044],[/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969/elements?id=961046])',
                    'title': '# of Opportunities (Account: 1 Source Consulting, 1-800 Postcards, 1-800 We Answer, 1-888-OhioComp, 14 West)',
                    'format': '#,##0'
                }, execConfig);

                expectWhereCondition({
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
                    },
                    '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/16561': {
                        '$between': [-3, 0],
                        '$granularity': 'GDC.time.week'
                    }
                }, execConfig);
            });

            it('does not execute all-time date filter', () => {
                const mdWithAllTime = cloneDeep(mdObj);
                mdWithAllTime.buckets.filters = [{
                    'dateFilter': {
                        'dimension': '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/16561',
                        'granularity': 'GDC.time.year'
                    }
                }];

                const executionConfiguration = ex.mdToExecutionConfiguration(mdWithAllTime);
                expect(executionConfiguration.where).to.eql({});
            });

            it('does not execute attribute filter with all selected', () => {
                const mdWithSelectAll = cloneDeep(mdObj);
                mdWithSelectAll.buckets.filters = [{
                    'listAttributeFilter': {
                        'attribute': '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1025',
                        'displayForm': '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1028',
                        'default': {
                            'negativeSelection': true,
                            'attributeElements': []
                        }
                    }
                }];

                const executionConfiguration = ex.mdToExecutionConfiguration(mdWithSelectAll);
                expect(executionConfiguration.where).to.eql({});
            });

            it('generates right metricMappings', () => {
                const mdObjCloned = cloneDeep(mdObj);
                const executionConfiguration = ex.mdToExecutionConfiguration(mdObjCloned);
                expect(executionConfiguration.metricMappings).to.eql([
                    {
                        element: 'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.filtered_sum.b9f95d95adbeac03870b764f8b2c3402',
                        measureIndex: 0
                    }, {
                        element: 'attribute_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1244.generated.count.a865b88e507b9390e2175b79e1d6252f',
                        measureIndex: 1
                    }, {
                        element: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1556',
                        measureIndex: 2
                    }, {
                        element: 'metric_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_2825.generated.filtered_base.3812d81c1c1609700e47fc800e85bfac',
                        measureIndex: 3
                    }
                ]);
            });

            it('generates right metricMappings for PoP metric', () => {
                const mdObjPoP = cloneDeep(mdObj);
                mdObjPoP.buckets.measures = [{
                    measure: {
                        type: 'metric',
                        objectUri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1556',
                        title: 'Probability BOP',
                        format: '#,##0.00',
                        measureFilters: [],
                        showPoP: true,
                        sort: {
                            direction: 'asc',
                            sortByPoP: true
                        }
                    }
                }];

                const executionConfiguration = ex.mdToExecutionConfiguration(mdObjPoP);
                expect(executionConfiguration.metricMappings).to.eql([
                    {
                        element: 'metric_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1556.generated.pop.742c298cb16e36869e5d70e87840ffa1',
                        measureIndex: 0,
                        isPoP: true
                    },
                    {
                        element: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1556',
                        measureIndex: 0
                    }
                ]);
            });


            it('generates metricMappings for two identical metrics', () => {
                const mdObjPoP = cloneDeep(mdObj);
                mdObjPoP.buckets.measures = [{
                        measure: {
                            type: 'metric',
                            objectUri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1556',
                            title: 'Probability BOP #1',
                            format: '#,##0.00',
                            measureFilters: []
                        }
                    },
                    {
                        measure: {
                            type: 'metric',
                            objectUri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1556',
                            title: 'Probability BOP #2',
                            format: '#,##0.00',
                            measureFilters: []
                        }
                    }
                ];

                const executionConfiguration = ex.mdToExecutionConfiguration(mdObjPoP);
                expect(executionConfiguration.metricMappings).to.eql([
                    {
                        element: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1556',
                        measureIndex: 0
                    },
                    {
                        element: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1556',
                        measureIndex: 1
                    }
                ]);
            });

            it('propagates sort data from metrics and categories', () => {
                const executionConfiguration = ex.mdToExecutionConfiguration(mdObj);
                expectOrderBy(
                    [{
                        column: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1028',
                        direction: 'asc'
                    },
                    {
                        column: 'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.filtered_sum.b9f95d95adbeac03870b764f8b2c3402',
                        direction: 'desc'
                    }],
                    executionConfiguration
                );
            });

            it('doesn\'t set sort data on generated PoP column', () => {
                mdObj.buckets.measures[0].measure.showPoP = true;
                mdObj.buckets.measures = mdObj.buckets.measures.slice(1);

                const executionConfiguration = ex.mdToExecutionConfiguration(mdObj);

                expectOrderBy(
                    [
                        {
                            column: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1028',
                            direction: 'asc'
                        }
                    ],
                    executionConfiguration
                );
            });

            it('overrides sort for bar chart', () => {
                mdObj.type = 'bar';

                const executionConfiguration = ex.mdToExecutionConfiguration(mdObj);

                expectOrderBy(
                    [
                        {
                            column: 'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.filtered_sum.b9f95d95adbeac03870b764f8b2c3402',
                            direction: 'desc'
                        }
                    ],
                    executionConfiguration
                );
            });

            it('returns empty sort when no sort is defined for no-bar visualization', () => {
                mdObj.type = 'column';
                mdObj.buckets.measures = [
                    {
                        'measure': {
                            'type': 'attribute',
                            'aggregation': 'count',
                            'objectUri': '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1244',
                            'title': 'Count of Activity',
                            'format': '#,##0.00',
                            'measureFilters': []
                        }
                    }
                ];
                mdObj.buckets.categories = [
                    {
                        'category': {
                            'type': 'attribute',
                            'collection': 'attribute',
                            'displayForm': '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1028'
                        }
                    }
                ];

                const executionConfiguration = ex.mdToExecutionConfiguration(mdObj);

                expectOrderBy([], executionConfiguration);
            });

            it('ensures measure title length does not exceed 255 chars', () => {
                mdObj.buckets.measures = [
                    {
                        'measure': {
                            'type': 'fact',
                            'aggregation': 'sum',
                            'objectUri': '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144',
                            'title': `Sum of Amount (${range(0, 300).map(() => 'element')})`,
                            'format': '#,##0.00',
                            'showPoP': true,
                            'showInPercent': true
                        }
                    }
                ];

                const execConfig = ex.mdToExecutionConfiguration(mdObj);

                execConfig.definitions.forEach(definition => {
                    expect(definition.metricDefinition.title).to.have.length(255);
                });
            });
        });

        describe('generating contribution metric', () => {
            let mdObjContribution;
            beforeEach(() => {
                mdObjContribution = {
                    buckets: {
                        'measures': [
                            {
                                'measure': {
                                    'type': 'metric',
                                    'objectUri': '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/2825',
                                    'title': '% # of Opportunities',
                                    'format': '#,##0',
                                    'measureFilters': [],
                                    'showInPercent': true,
                                    'showPoP': false
                                }
                            }
                        ],
                        'categories': [
                            {
                                'category': {
                                    'type': 'attribute',
                                    'collection': 'attribute',
                                    'attribute': '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1027',
                                    'displayForm': '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1028'
                                }
                            }
                        ],
                        'filters': []
                    }
                };
            });

            it('for calculated measure', () => {
                const execConfig = ex.mdToExecutionConfiguration(mdObjContribution);

                expectColumns([
                    '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1028',
                    'metric_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_2825.generated.percent.0eb685df0742b4e27091746615e06193'
                ], execConfig);

                expectMetricDefinition({
                    title: '% # of Opportunities',
                    identifier: 'metric_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_2825.generated.percent.0eb685df0742b4e27091746615e06193',
                    expression: 'SELECT (SELECT [/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/2825]) / (SELECT [/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/2825] BY ALL [/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1027])',
                    format: '#,##0.00%'
                }, execConfig);
            });

            it('for generated measure', () => {
                mdObjContribution.buckets.measures = [
                    {
                        'measure': {
                            'type': 'fact',
                            'aggregation': 'sum',
                            'objectUri': '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144',
                            'title': '% Sum of Amount',
                            'format': '#,##0.00',
                            'showInPercent': true
                        }
                    }
                ];

                const execConfig = ex.mdToExecutionConfiguration(mdObjContribution);

                expectColumns([
                    '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1028',
                    'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.percent.3124707f49557fe26b7eecfa3f61b021'
                ], execConfig);

                expectMetricDefinition({
                    title: '% Sum of Amount',
                    identifier: 'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.percent.3124707f49557fe26b7eecfa3f61b021',
                    expression: 'SELECT (SELECT SUM([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144])) / (SELECT SUM([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144]) BY ALL [/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1027])',
                    format: '#,##0.00%'
                }, execConfig);
            });

            it('for generated measure with attribute filters', () => {
                mdObjContribution.buckets.measures = [
                    {
                        'measure': {
                            'type': 'fact',
                            'aggregation': 'sum',
                            'objectUri': '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1',
                            'title': '% Sum of Amount',
                            'format': '#,##0.00',
                            'showInPercent': true,
                            'measureFilters': [
                                {
                                    'listAttributeFilter': {
                                        'attribute': '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/42',
                                        'displayForm': '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/43',
                                        'default': {
                                            'negativeSelection': false,
                                            'attributeElements': [
                                                '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/42/elements?id=61527'
                                            ]
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ];

                const execConfig = ex.mdToExecutionConfiguration(mdObjContribution);

                expectColumns([
                    '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1028',
                    'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1.generated.filtered_percent.08fe4920a4353ed70cdb0cb255489611'
                ], execConfig);

                expectMetricDefinition({
                    title: '% Sum of Amount',
                    identifier: 'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1.generated.filtered_percent.08fe4920a4353ed70cdb0cb255489611',
                    expression: 'SELECT (' +
                        'SELECT SUM([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1]) ' +
                        'WHERE [/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/42] ' +
                        'IN ([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/42/elements?id=61527])' +
                    ') / (' +
                        'SELECT SUM([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1]) ' +
                        'BY ALL [/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1027] ' +
                        'WHERE [/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/42] ' +
                        'IN ([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/42/elements?id=61527])' +
                    ')',
                    format: '#,##0.00%'
                }, execConfig);
            });
        });

        describe('generating pop metric', () => {
            let mdObj;
            beforeEach(() => {
                mdObj = {
                    buckets: {
                        'measures': [
                            {
                                'measure': {
                                    'type': 'metric',
                                    'objectUri': '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/2825',
                                    'title': '# of Opportunities',
                                    'format': '#,##0',
                                    'measureFilters': [],
                                    'showInPercent': false,
                                    'showPoP': true
                                }
                            }
                        ],
                        'categories': [
                            {
                                'category': {
                                    'type': 'date',
                                    'collection': 'attribute',
                                    'displayForm': '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1234',
                                    'attribute': '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1233'
                                }
                            }
                        ],
                        'filters': []
                    }
                };
            });

            it('for calculated metric', () => {
                const execConfig = ex.mdToExecutionConfiguration(mdObj);
                expectColumns([
                    '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1234',
                    'metric_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_2825.generated.pop.0e380388838e2d867a3d11ea64e22573',
                    '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/2825'
                ], execConfig);

                expectMetricDefinition({
                    title: '# of Opportunities - previous year',
                    identifier: 'metric_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_2825.generated.pop.0e380388838e2d867a3d11ea64e22573',
                    expression: 'SELECT [/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/2825] FOR PREVIOUS ([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1233])',
                    format: '#,##0'
                }, execConfig);
            });

            it('for generated measure', () => {
                mdObj.buckets.measures = [
                    {
                        'measure': {
                            'type': 'fact',
                            'aggregation': 'sum',
                            'objectUri': '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144',
                            'title': 'Sum of Amount',
                            'format': '#,##0.00',
                            'showPoP': true
                        }
                    }
                ];

                const execConfig = ex.mdToExecutionConfiguration(mdObj);

                expectColumns([
                    '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1234',
                    'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.pop.00d7d51e0e86780bebfe65b025ed8f14',
                    'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.sum.7537800b1daf7582198e84ca6205d600'
                ], execConfig);

                expectMetricDefinition({
                    identifier: 'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.pop.00d7d51e0e86780bebfe65b025ed8f14',
                    expression: 'SELECT (SELECT SUM([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144])) FOR PREVIOUS ([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1233])',
                    title: 'Sum of Amount - previous year',
                    format: '#,##0.00'
                }, execConfig);

                expectMetricDefinition({
                    identifier: 'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.sum.7537800b1daf7582198e84ca6205d600',
                    expression: 'SELECT SUM([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144])',
                    title: 'Sum of Amount',
                    format: '#,##0.00'
                }, execConfig);
            });

            it('for generated measure with contribution', () => {
                mdObj.buckets.measures = [
                    {
                        'measure': {
                            'type': 'fact',
                            'aggregation': 'sum',
                            'objectUri': '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144',
                            'title': '% Sum of Amount',
                            'format': '#,##0.00',
                            'showPoP': true,
                            'showInPercent': true
                        }
                    }
                ];

                const execConfig = ex.mdToExecutionConfiguration(mdObj);

                expectColumns([
                    '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1234',
                    'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.pop.985ea06c284684b6feb0b05a6d796034',
                    'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.percent.93434aa1d9e8d4fe653757ba8c891025'
                ], execConfig);

                expectMetricDefinition({
                    title: '% Sum of Amount - previous year',
                    identifier: 'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.pop.985ea06c284684b6feb0b05a6d796034',
                    expression: 'SELECT (SELECT (SELECT SUM([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144])) / (SELECT SUM([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144]) BY ALL [/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1233])) FOR PREVIOUS ([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1233])',
                    format: '#,##0.00%'
                }, execConfig);

                expectMetricDefinition({
                    title: '% Sum of Amount',
                    identifier: 'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.percent.93434aa1d9e8d4fe653757ba8c891025',
                    expression: 'SELECT (SELECT SUM([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144])) / (SELECT SUM([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144]) BY ALL [/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1233])',
                    format: '#,##0.00%'
                }, execConfig);
            });
        });

        describe('Update metric format for generated metrics', () => {
            const mdObj = {
                buckets: {
                    categories: [
                        {
                            'category': {
                                'type': 'date',
                                'collection': 'attribute',
                                'displayForm': '/gdc/md/myFakeProjectId/obj/1234',
                                'attribute': '/gdc/md/myFakeProjectId/obj/1233'
                            }
                        }
                    ]
                }
            };

            beforeEach(() => {
                const responseMock = { metric: { content: { format: 'someone changed me' } } };
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
                        headers: [
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
                        ],
                        tabularDataResult: '/gdc/internal/projects/myFakeProjectId/experimental/executions/23452345'
                    }
                };
                server.respondWith(
                    '/gdc/md/myFakeProjectId/obj/1',
                    [200, {'Content-Type': 'application/json'},
                        JSON.stringify(responseMock)]
                );

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
            });

            afterEach(() => {
                server.restore();
            });

            it('when metric is PoP', () => {
                mdObj.buckets.measures = [
                    {
                        'measure': {
                            'type': 'metric',
                            'objectUri': '/gdc/md/myFakeProjectId/obj/1',
                            'measureFilters': [],
                            'title': '% Sum of Amount',
                            'format': '#,##0.00',
                            'showPoP': true,
                            'showInPercent': false
                        }
                    }
                ];
                return ex.getDataForVis('myFakeProjectId', mdObj, {}).then(() => {
                    const request = JSON.parse(server.requests[1].requestBody);
                    expect(request.execution.definitions[0].metricDefinition.format).to.be('someone changed me');
                });
            });

            it('when metric has metricFilter', () => {
                mdObj.buckets.measures = [
                    {
                        'measure': {
                            'type': 'metric',
                            'objectUri': '/gdc/md/myFakeProjectId/obj/1',
                            'measureFilters': [
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
                            ],
                            'title': '% Sum of Amount',
                            'format': '#,##0.00',
                            'showPoP': false,
                            'showInPercent': false
                        }
                    }
                ];
                return ex.getDataForVis('myFakeProjectId', mdObj, {}).then(() => {
                    const request = JSON.parse(server.requests[1].requestBody);
                    expect(request.execution.definitions[0].metricDefinition.format).to.be('someone changed me');
                });
            });
        });
    });
});
