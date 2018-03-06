// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
/* eslint func-names:0 handle-callback-err: 0 */
import { cloneDeep, range } from 'lodash';
import fetchMock from '../utils/fetch-mock';

import { expectColumns, expectMetricDefinition } from '../helpers/execution';
import { createModule as exFactory } from '../../src/execution/experimental-executions';
import { createModule as attributesMapLoaderFactory } from '../../src/utils/attributesMapLoader';
import { createModule as xhrFactory } from '../../src/xhr';
import { createModule as mdFactory } from '../../src/metadata';
import { createModule as configFactory } from '../../src/config';

const config = configFactory();
const xhr = xhrFactory(config);
const md = mdFactory(xhr);
const attributesMapLoader = attributesMapLoaderFactory(md);
const ex = exFactory(xhr, attributesMapLoader);

describe('execution', () => {
    describe('with fake server', () => {
        let serverResponseMock;

        afterEach(() => {
            fetchMock.restore();
        });

        describe('Data Execution:', () => {
            beforeEach(() => {
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
                        tabularDataResult: '/gdc/internal/projects/myFakeProjectId/experimental/executions/23452345',
                        extendedTabularDataResult: '/gdc/internal/projects/myFakeProjectId/experimental/executions/extendedResults/23452345'
                    }
                };
            });

            describe('getData', () => {
                it('should resolve with JSON with correct data including headers', () => {
                    const responseMock = JSON.parse(JSON.stringify(serverResponseMock));

                    fetchMock.mock(
                        '/gdc/internal/projects/myFakeProjectId/experimental/executions',
                        { status: 200, body: JSON.stringify(responseMock) }
                    );
                    fetchMock.mock(
                        /\/gdc\/internal\/projects\/myFakeProjectId\/experimental\/executions\/extendedResults\/(\w+)/,
                        { status: 201, body: JSON.stringify({ extendedTabularDataResult: { values: [{ id: 1, name: 'a' }, 1] } }) }
                    );

                    return ex.getData('myFakeProjectId', ['attrId', 'metricId']).then((result) => {
                        expect(result.headers[0].id).toBe('attrId');
                        expect(result.headers[0].uri).toBe('attrUri');
                        expect(result.headers[0].type).toBe('attrLabel');
                        expect(result.headers[0].title).toBe('Atribute Title');
                        expect(result.headers[1].id).toBe('metricId');
                        expect(result.headers[1].uri).toBe('metricUri');
                        expect(result.headers[1].type).toBe('metric');
                        expect(result.headers[1].title).toBe('Metric Title');
                        expect(result.rawData[0]).toEqual({ id: 1, name: 'a' });
                        expect(result.rawData[1]).toBe(1);
                        expect(result.warnings).toEqual([]);
                    });
                });

                it('should resolve with JSON with correct warnings', () => {
                    const responseMock = JSON.parse(JSON.stringify(serverResponseMock));

                    fetchMock.mock(
                        '/gdc/internal/projects/myFakeProjectId/experimental/executions',
                        { status: 200, body: JSON.stringify(responseMock) }
                    );
                    fetchMock.mock(
                        /\/gdc\/internal\/projects\/myFakeProjectId\/experimental\/executions\/extendedResults\/(\w+)/,
                        { status: 201, body: JSON.stringify({ extendedTabularDataResult: { warnings: [1, 2, 3] } }) }
                    );

                    return ex.getData('myFakeProjectId', ['attrId', 'metricId']).then((result) => {
                        expect(result.warnings).toEqual([1, 2, 3]);
                    });
                });

                it('should retrieve all the pages', () => {
                    const responseMock = JSON.parse(JSON.stringify(serverResponseMock));

                    fetchMock.mock(
                        '/gdc/internal/projects/myFakeProjectId/experimental/executions',
                        { status: 200, body: JSON.stringify(responseMock) }
                    );

                    fetchMock.mock(
                        // eslint-disable-next-line max-len
                        /\/gdc\/internal\/projects\/myFakeProjectId\/experimental\/executions\/extendedResults\/23452345/,
                        {
                            status: 201,
                            body: JSON.stringify({
                                extendedTabularDataResult: {
                                    paging: {
                                        offset: 0,
                                        count: 1,
                                        total: 2,
                                        next: '/gdc/internal/projects/myFakeProjectId/experimental/executions/extendedResults/2343434'
                                    },
                                    values: [[{ id: '1', name: 'a' }, '2']]
                                }
                            })
                        }
                    );

                    fetchMock.mock(
                        // eslint-disable-next-line max-len
                        /\/gdc\/internal\/projects\/myFakeProjectId\/experimental\/executions\/extendedResults\/2343434/,
                        {
                            status: 201,
                            body: JSON.stringify({
                                extendedTabularDataResult: {
                                    paging: {
                                        offset: 1,
                                        count: 1,
                                        total: 2,
                                        next: null
                                    },
                                    values: [[{ id: '2', name: 'b' }, '3']]
                                }
                            })
                        }
                    );

                    return ex.getData('myFakeProjectId', ['attrId', 'metricId'], {}).then((result) => {
                        expect(result.rawData).toEqual([
                            [{ id: '1', name: 'a' }, '2'],
                            [{ id: '2', name: 'b' }, '3']
                        ]);
                    });
                });

                it('should not fail if tabular data result is missing', () => {
                    fetchMock.mock(
                        '/gdc/internal/projects/myFakeProjectId/experimental/executions',
                        { status: 200, body: JSON.stringify(serverResponseMock) }
                    );
                    fetchMock.mock(
                        /\/gdc\/internal\/projects\/myFakeProjectId\/experimental\/executions\/extendedResults\/(\w+)/,
                        { status: 204 }
                    );

                    return ex.getData('myFakeProjectId', ['attrId', 'metricId']).then((result) => {
                        expect(result.rawData).toEqual([]);
                        expect(result.isEmpty).toBe(true);
                    });
                });

                it('should reject when execution fails', () => {
                    fetchMock.mock(
                        '/gdc/internal/projects/myFakeProjectId/experimental/executions',
                        400
                    );

                    return ex.getData('myFakeProjectId', ['attrId', 'metricId']).catch((err) => {
                        expect(err).toBeInstanceOf(Error);
                        expect(err.response.status).toBe(400);
                    });
                });

                it('should reject with 400 when data result fails', () => {
                    fetchMock.mock(
                        '/gdc/internal/projects/myFakeProjectId/experimental/executions',
                        { status: 200, body: JSON.stringify(serverResponseMock) }
                    );
                    fetchMock.mock(
                        /\/gdc\/internal\/projects\/myFakeProjectId\/experimental\/executions\/extendedResults\/(\w+)/,
                        { status: 400, body: JSON.stringify({ tabularDataResult: { values: ['a', 1] } }) }
                    );

                    return ex.getData('myFakeProjectId', [{ type: 'metric', uri: '/metric/uri' }]).then(null, (err) => {
                        expect(err).toBeInstanceOf(Error);
                    });
                });

                it('should wrap response headers with metric mappings', () => {
                    fetchMock.mock(
                        '/gdc/internal/projects/myFakeProjectId/experimental/executions',
                        { status: 200, body: JSON.stringify(serverResponseMock) }
                    );
                    fetchMock.mock(
                        /\/gdc\/internal\/projects\/myFakeProjectId\/experimental\/executions\/extendedResults\/(\w+)/,
                        { status: 204 }
                    );

                    return ex.getData(
                        'myFakeProjectId',
                        [{ type: 'metric', uri: '/metric/uri' }],
                        {
                            metricMappings: [
                                { element: 'metricUri', measureIndex: 0 }
                            ]
                        }
                    ).then((result) => {
                        expect(result.headers[1]).toEqual({
                            id: 'metricId',
                            title: 'Metric Title',
                            type: 'metric',
                            uri: 'metricUri',
                            measureIndex: 0,
                            isPoP: undefined
                        });
                    }).catch(() => {
                        throw new Error('Should not fail when processing mappings');
                    });
                });

                it('should set headers via settings', () => {
                    const matcher = '/gdc/internal/projects/myFakeProjectId/experimental/executions';
                    fetchMock.mock(matcher, { status: 200, body: JSON.stringify(serverResponseMock) });
                    fetchMock.mock(
                        /\/gdc\/internal\/projects\/myFakeProjectId\/experimental\/executions\/extendedResults\/(\w+)/,
                        { status: 204 }
                    );

                    return ex.getData('myFakeProjectId', ['attrId', 'metricId'], {}, { headers: { 'X-GDC-REQUEST': 'foo' } }).then(() => {
                        const [, settings] = fetchMock.lastCall(matcher);
                        expect(settings.headers['X-GDC-REQUEST']).toEqual('foo');
                    });
                });
            });

            describe('getData with order', () => {
                it('should propagate orderBy to server call', () => {
                    const matcher = '/gdc/internal/projects/myFakeProjectId/experimental/executions';
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

                    fetchMock.mock(matcher, { status: 200, body: JSON.stringify(serverResponseMock) });

                    fetchMock.mock(
                        /\/gdc\/internal\/projects\/myFakeProjectId\/experimental\/executions\/extendedResults\/(\w+)/,
                        { status: 204 }
                    );

                    return ex.getData('myFakeProjectId', ['attrId', 'metricId'], {
                        orderBy
                    }).then(() => {
                        const [, settings] = fetchMock.lastCall(matcher);
                        const requestBody = JSON.parse(settings.body);
                        expect(requestBody.execution.orderBy).toEqual(orderBy);
                    });
                });
            });

            describe('getData with definitions', () => {
                it('should propagate orderBy to server call', () => {
                    const matcher = '/gdc/internal/projects/myFakeProjectId/experimental/executions';
                    const definitions = [
                        {
                            metricDefinition: {
                                title: 'Closed Pipeline - previous year',
                                expression: 'SELECT (SELECT {adyRSiRTdnMD}) FOR PREVIOUS ({date.year})',
                                format: '#,,.00M',
                                identifier: 'adyRSiRTdnMD.generated.pop.1fac4f897bbb5994a257cd2c9f0a81a4'
                            }
                        }
                    ];
                    fetchMock.mock(matcher, { status: 200, body: JSON.stringify(serverResponseMock) });

                    fetchMock.mock(
                        /\/gdc\/internal\/projects\/myFakeProjectId\/experimental\/executions\/extendedResults\/(\w+)/,
                        { status: 204 }
                    );

                    return ex.getData('myFakeProjectId', ['attrId', 'metricId'], {
                        definitions
                    }).then(() => {
                        const [, settings] = fetchMock.lastCall(matcher);
                        const requestBody = JSON.parse(settings.body);
                        expect(requestBody.execution.definitions).toEqual(definitions);
                    });
                });
            });

            describe('getData with query language filters', () => {
                it('should propagate filters to the server call', () => {
                    // prepare filters and then use them with getData
                    const matcher = '/gdc/internal/projects/myFakeProjectId/experimental/executions';
                    fetchMock.mock(matcher, { status: 200, body: JSON.stringify(serverResponseMock) });
                    fetchMock.mock(
                        /\/gdc\/internal\/projects\/myFakeProjectId\/experimental\/executions\/extendedResults\/(\w+)/,
                        { status: 204 }
                    );
                    const where = {
                        'label.attr.city': { $eq: 1 }
                    };
                    return ex.getData('myFakeProjectId', ['attrId', 'metricId'], {
                        where
                    }).then(() => {
                        const [, settings] = fetchMock.lastCall(matcher);
                        const requestBody = JSON.parse(settings.body);

                        expect(requestBody.execution.where).toEqual(where);
                    });
                });
            });
        });

        // used now only from Catalogue for getting right items/dateDataSets
        describe('MD object to execution definitions and columns', () => {
            let mdObj;
            beforeEach(() => {
                mdObj = {
                    visualizationClass: {
                        uri: 'xyz'
                    },
                    buckets: [
                        {
                            localIdentifier: 'measures',
                            items: [
                                {
                                    measure: {
                                        localIdentifier: 'm1',
                                        definition: {
                                            measureDefinition: {
                                                item: {
                                                    uri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144'
                                                },
                                                aggregation: 'sum',
                                                filters: [
                                                    {
                                                        positiveAttributeFilter: {
                                                            displayForm: {
                                                                uri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/952'
                                                            },
                                                            in: [
                                                                '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/949/elements?id=168284',
                                                                '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/949/elements?id=168282'
                                                            ]
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        title: 'Sum of Amount',
                                        format: '#,##0.00'
                                    }
                                },
                                {
                                    measure: {
                                        localIdentifier: 'm2',
                                        definition: {
                                            measureDefinition: {
                                                item: {
                                                    uri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1244'
                                                },
                                                aggregation: 'count'
                                            }
                                        },
                                        title: 'Count of Activity',
                                        format: '#,##0.00'
                                    }
                                },
                                {
                                    measure: {
                                        localIdentifier: 'm3',
                                        definition: {
                                            measureDefinition: {
                                                item: {
                                                    uri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1556'
                                                }
                                            }
                                        },
                                        title: 'Probability BOP',
                                        format: '#,##0.00'
                                    }
                                },
                                {
                                    measure: {
                                        localIdentifier: 'm4',
                                        definition: {
                                            measureDefinition: {
                                                item: {
                                                    uri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/2825'
                                                },
                                                filters: [
                                                    {
                                                        positiveAttributeFilter: {
                                                            displayForm: {
                                                                uri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/970'
                                                            },
                                                            in: [
                                                                '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969/elements?id=961042',
                                                                '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969/elements?id=961038',
                                                                '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969/elements?id=958079',
                                                                '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969/elements?id=961044',
                                                                '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969/elements?id=961046'
                                                            ]
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        title: '# of Opportunities (Account: 1 Source Consulting, 1-800 Postcards, 1-800 We Answer, 1-888-OhioComp, 14 West)',
                                        format: '#,##0'
                                    }
                                }]
                        },
                        {
                            localIdentifier: 'attribute',
                            items: [
                                {
                                    visualizationAttribute: {
                                        localIdentifier: 'a1',
                                        displayForm: {
                                            uri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1028'
                                        }
                                    }
                                }
                            ]
                        }
                    ],
                    filters: [
                        {
                            positiveAttributeFilter: {
                                displayForm: {
                                    uri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1028'
                                },
                                in: [
                                    '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1025/elements?id=1243',
                                    '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1025/elements?id=1242',
                                    '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1025/elements?id=1241',
                                    '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1025/elements?id=1240',
                                    '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1025/elements?id=1239',
                                    '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1025/elements?id=1238',
                                    '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1025/elements?id=1236'
                                ]
                            }
                        }, {
                            relativeDateFilter: {
                                dataSet: {
                                    uri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/16561'
                                },
                                granularity: 'GDC.time.week',
                                from: -3,
                                to: 0
                            }
                        }
                    ],
                    properties: {
                        sortItems: [
                            {
                                measureSortItem: {
                                    direction: 'desc',
                                    locators: [
                                        {
                                            measureLocatorItem: {
                                                measureIdentifier: 'm1'
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                attributeSortItem: {
                                    direction: 'asc',
                                    attributeIdentifier: 'a1'
                                }
                            }
                        ]
                    }
                };

                const displayForms = [
                    {
                        attributeDisplayForm: {
                            content: {
                                formOf: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1025'
                            },
                            meta: {
                                uri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1028'
                            }
                        }
                    },
                    {
                        attributeDisplayForm: {
                            content: {
                                formOf: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/949'
                            },
                            meta: {
                                uri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/952'
                            }
                        }
                    },
                    {
                        attributeDisplayForm: {
                            content: {
                                formOf: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969'
                            },
                            meta: {
                                uri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/970'
                            }
                        }
                    }
                ];
                const attributeObjects = [
                    {
                        attribute: {
                            content: {},
                            meta: {
                                uri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1025'
                            }
                        }
                    },
                    {
                        attribute: {
                            content: {},
                            meta: {
                                uri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/949'
                            }
                        }
                    },
                    {
                        attribute: {
                            content: {},
                            meta: {
                                uri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969'
                            }
                        }
                    }
                ];
                let callCount = 0;
                const twoCallsMatcher = () => {
                    if (callCount === 0) {
                        callCount = 1;
                        return {
                            status: 200,
                            body: JSON.stringify({
                                objects: {
                                    items: displayForms
                                }
                            })
                        };
                    }

                    return {
                        status: 200,
                        body: JSON.stringify({
                            objects: {
                                items: attributeObjects
                            }
                        })
                    };
                };
                fetchMock.mock(
                    '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/objects/get',
                    twoCallsMatcher
                );
            });

            it('creates proper configuration for execution', () => {
                return ex.mdToExecutionDefinitionsAndColumns('qamfsd9cw85e53mcqs74k8a0mwbf5gc2', mdObj).then((execConfig) => {
                    expectColumns([
                        '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1025',
                        'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.b9f95d95adbeac03870b764f8b2c3402_filtered_sum',
                        'attribute_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1244.generated.a865b88e507b9390e2175b79e1d6252f_count',
                        '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1556',
                        'metric_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_2825.generated.3812d81c1c1609700e47fc800e85bfac_filtered_base'
                    ], execConfig);

                    expectMetricDefinition({
                        identifier: 'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.b9f95d95adbeac03870b764f8b2c3402_filtered_sum',
                        expression: 'SELECT SUM([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144]) WHERE [/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/949] IN ([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/949/elements?id=168284],[/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/949/elements?id=168282])',
                        title: 'Sum of Amount',
                        format: '#,##0.00'
                    }, execConfig);

                    expectMetricDefinition({
                        identifier: 'attribute_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1244.generated.a865b88e507b9390e2175b79e1d6252f_count',
                        expression: 'SELECT COUNT([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1244])',
                        title: 'Count of Activity',
                        format: '#,##0.00'
                    }, execConfig);

                    expectMetricDefinition({
                        identifier: 'metric_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_2825.generated.3812d81c1c1609700e47fc800e85bfac_filtered_base',
                        expression: 'SELECT [/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/2825] WHERE [/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969] IN ([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969/elements?id=961042],[/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969/elements?id=961038],[/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969/elements?id=958079],[/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969/elements?id=961044],[/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969/elements?id=961046])',
                        title: '# of Opportunities (Account: 1 Source Consulting, 1-800 Postcards, 1-800 We Answer, 1-888-OhioComp, 14 West)',
                        format: '#,##0'
                    }, execConfig);
                });
            });

            it('handles empty filters', () => {
                const mdObjWithoutFilters = cloneDeep(mdObj);
                mdObjWithoutFilters.buckets[0].items[0].measure.definition.measureDefinition.filters[0].positiveAttributeFilter.in = []; // eslint-disable-line max-len
                return ex.mdToExecutionDefinitionsAndColumns('qamfsd9cw85e53mcqs74k8a0mwbf5gc2', mdObjWithoutFilters).then((execConfig) => {
                    expectColumns([
                        '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1025',
                        'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.7537800b1daf7582198e84ca6205d600_sum',
                        'attribute_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1244.generated.a865b88e507b9390e2175b79e1d6252f_count',
                        '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1556',
                        'metric_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_2825.generated.3812d81c1c1609700e47fc800e85bfac_filtered_base'
                    ], execConfig);

                    expectMetricDefinition({
                        identifier: 'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.7537800b1daf7582198e84ca6205d600_sum',
                        expression: 'SELECT SUM([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144])',
                        title: 'Sum of Amount',
                        format: '#,##0.00'
                    }, execConfig);

                    expectMetricDefinition({
                        identifier: 'attribute_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1244.generated.a865b88e507b9390e2175b79e1d6252f_count',
                        expression: 'SELECT COUNT([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1244])',
                        title: 'Count of Activity',
                        format: '#,##0.00'
                    }, execConfig);

                    expectMetricDefinition({
                        identifier: 'metric_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_2825.generated.3812d81c1c1609700e47fc800e85bfac_filtered_base',
                        expression: 'SELECT [/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/2825] WHERE [/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969] IN ([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969/elements?id=961042],[/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969/elements?id=961038],[/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969/elements?id=958079],[/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969/elements?id=961044],[/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/969/elements?id=961046])',
                        title: '# of Opportunities (Account: 1 Source Consulting, 1-800 Postcards, 1-800 We Answer, 1-888-OhioComp, 14 West)',
                        format: '#,##0'
                    }, execConfig);
                });
            });

            it('ensures measure title length does not exceed 1000 chars', () => {
                const mdObjCloned = cloneDeep(mdObj);
                mdObjCloned.buckets[0] = {
                    localIdentifier: 'measures',
                    items: [
                        {
                            measure: {
                                localIdentifier: 'm1',
                                definition: {
                                    measureDefinition: {
                                        item: {
                                            uri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144'
                                        },
                                        aggregation: 'sum',
                                        computeRatio: true
                                    }
                                },
                                title: `Sum of Amount (${range(0, 1050).map(() => 'element')})`,
                                format: '#,##0.00'
                            }
                        }
                    ]
                };

                return ex.mdToExecutionDefinitionsAndColumns('qamfsd9cw85e53mcqs74k8a0mwbf5gc2', mdObjCloned).then((execConfig) => {
                    execConfig.definitions.forEach((definition) => {
                        expect(definition.metricDefinition.title).toHaveLength(1000);
                    });
                });
            });
        });

        describe('generating contribution metric', () => {
            let mdObjContribution;
            beforeEach(() => {
                mdObjContribution = {
                    visualizationClass: {
                        uri: 'xyz'
                    },
                    buckets: [
                        {
                            localIdentifier: 'measures',
                            items: [
                                {
                                    measure: {
                                        localIdentifier: 'm1',
                                        definition: {
                                            measureDefinition: {
                                                item: {
                                                    uri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/2825'
                                                },
                                                computeRatio: true
                                            }
                                        },
                                        title: '% # of Opportunities',
                                        format: '#,##0'
                                    }
                                }]
                        },
                        {
                            localIdentifier: 'attribute',
                            items: [
                                {
                                    visualizationAttribute: {
                                        localIdentifier: 'a1',
                                        displayForm: {
                                            uri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1028'
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                };

                const displayForms = [
                    {
                        attributeDisplayForm: {
                            content: {
                                formOf: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1027'
                            },
                            meta: {
                                uri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1028'
                            }
                        }
                    },
                    {
                        attributeDisplayForm: {
                            content: {
                                formOf: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/42'
                            },
                            meta: {
                                uri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/43'
                            }
                        }
                    }
                ];
                const attributeObjects = [
                    {
                        attribute: {
                            content: {},
                            meta: {
                                uri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1027'
                            }
                        }
                    },
                    {
                        attribute: {
                            content: {},
                            meta: {
                                uri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/42'
                            }
                        }
                    }
                ];
                let callCount = 0;
                const twoCallsMatcher = () => {
                    if (callCount === 0) {
                        callCount = 1;
                        return {
                            status: 200,
                            body: JSON.stringify({
                                objects: {
                                    items: displayForms
                                }
                            })
                        };
                    }

                    return {
                        status: 200,
                        body: JSON.stringify({
                            objects: {
                                items: attributeObjects
                            }
                        })
                    };
                };
                fetchMock.mock(
                    '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/objects/get',
                    twoCallsMatcher
                );
            });

            afterEach(() => {
                fetchMock.restore();
            });

            it('for calculated measure', () => {
                return ex.mdToExecutionDefinitionsAndColumns('qamfsd9cw85e53mcqs74k8a0mwbf5gc2', mdObjContribution).then((execConfig) => {
                    expectColumns([
                        '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1027',
                        'metric_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_2825.generated.0eb685df0742b4e27091746615e06193_percent'
                    ], execConfig);

                    expectMetricDefinition({
                        title: '% # of Opportunities',
                        identifier: 'metric_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_2825.generated.0eb685df0742b4e27091746615e06193_percent',
                        expression: 'SELECT (SELECT [/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/2825]) / (SELECT [/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/2825] BY ALL [/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1027])',
                        format: '#,##0.00%'
                    }, execConfig);
                });
            });

            it('for generated measure', () => {
                const mdObjContributionCloned = cloneDeep(mdObjContribution);
                mdObjContributionCloned.buckets[0] = {
                    localIdentifier: 'measures',
                    items: [
                        {
                            measure: {
                                localIdentifier: 'm1',
                                definition: {
                                    measureDefinition: {
                                        item: {
                                            uri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144'
                                        },
                                        computeRatio: true,
                                        aggregation: 'sum'
                                    }
                                },
                                title: '% Sum of Amount',
                                format: '#,##0.00'
                            }
                        }]
                };

                return ex.mdToExecutionDefinitionsAndColumns('qamfsd9cw85e53mcqs74k8a0mwbf5gc2', mdObjContributionCloned).then((execConfig) => {
                    expectColumns([
                        '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1027',
                        'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.3124707f49557fe26b7eecfa3f61b021_percent'
                    ], execConfig);

                    expectMetricDefinition({
                        title: '% Sum of Amount',
                        identifier: 'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.3124707f49557fe26b7eecfa3f61b021_percent',
                        expression: 'SELECT (SELECT SUM([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144])) / (SELECT SUM([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144]) BY ALL [/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1027])',
                        format: '#,##0.00%'
                    }, execConfig);
                });
            });

            it('for generated measure with attribute filters', () => {
                const mdObjContributionCloned = cloneDeep(mdObjContribution);
                mdObjContributionCloned.buckets[0] = {
                    localIdentifier: 'measures',
                    items: [
                        {
                            measure: {
                                localIdentifier: 'm1',
                                definition: {
                                    measureDefinition: {
                                        item: {
                                            uri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1'
                                        },
                                        computeRatio: true,
                                        aggregation: 'sum',
                                        filters: [
                                            {
                                                positiveAttributeFilter: {
                                                    displayForm: {
                                                        uri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/43'
                                                    },
                                                    in: [
                                                        '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/42/elements?id=61527'
                                                    ]
                                                }
                                            }
                                        ]
                                    }
                                },
                                title: '% Sum of Amount',
                                format: '#,##0.00'
                            }
                        }]
                };

                return ex.mdToExecutionDefinitionsAndColumns('qamfsd9cw85e53mcqs74k8a0mwbf5gc2', mdObjContributionCloned).then((execConfig) => {
                    expectColumns([
                        '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1027',
                        'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1.generated.08fe4920a4353ed70cdb0cb255489611_filtered_percent'
                    ], execConfig);

                    expectMetricDefinition({
                        title: '% Sum of Amount',
                        identifier: 'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1.generated.08fe4920a4353ed70cdb0cb255489611_filtered_percent',
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
        });

        describe('generating pop metric', () => {
            let mdObj;
            beforeEach(() => {
                mdObj = {
                    visualizationClass: {
                        uri: 'xyz'
                    },
                    buckets: [
                        {
                            localIdentifier: 'measures',
                            items: [
                                {
                                    measure: {
                                        localIdentifier: 'm1_pop',
                                        definition: {
                                            popMeasureDefinition: {
                                                measureIdentifier: 'm1',
                                                popAttribute: {
                                                    uri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1233'
                                                }
                                            }
                                        },
                                        title: '# of Opportunities - previous year',
                                        format: '#,##0'
                                    }
                                },
                                {
                                    measure: {
                                        localIdentifier: 'm1',
                                        definition: {
                                            measureDefinition: {
                                                item: {
                                                    uri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/2825'
                                                }
                                            }
                                        },
                                        title: '# of Opportunities',
                                        format: '#,##0'
                                    }
                                }]
                        },
                        {
                            localIdentifier: 'attribute',
                            items: [
                                {
                                    visualizationAttribute: {
                                        localIdentifier: 'a1',
                                        displayForm: {
                                            uri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1234'
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                };

                const displayForms = [
                    {
                        attributeDisplayForm: {
                            content: {
                                formOf: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1233'
                            },
                            meta: {
                                uri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1234'
                            }
                        }
                    }
                ];
                const attributeObjects = [
                    {
                        attribute: {
                            content: {
                                type: 'GDC.time.year'
                            },
                            meta: {
                                uri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1233'
                            }
                        }
                    }
                ];
                let callCount = 0;
                const twoCallsMatcher = () => {
                    if (callCount === 0) {
                        callCount = 1;
                        return {
                            status: 200,
                            body: JSON.stringify({
                                objects: {
                                    items: displayForms
                                }
                            })
                        };
                    }

                    return {
                        status: 200,
                        body: JSON.stringify({
                            objects: {
                                items: attributeObjects
                            }
                        })
                    };
                };
                fetchMock.mock(
                    '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/objects/get',
                    twoCallsMatcher
                );
            });

            it('for calculated metric', () => {
                return ex.mdToExecutionDefinitionsAndColumns('qamfsd9cw85e53mcqs74k8a0mwbf5gc2', mdObj).then((execConfig) => {
                    expectColumns([
                        '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1233',
                        'metric_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_2825.generated.0e380388838e2d867a3d11ea64e22573_pop',
                        '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/2825'
                    ], execConfig);

                    expectMetricDefinition({
                        title: '# of Opportunities - previous year',
                        identifier: 'metric_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_2825.generated.0e380388838e2d867a3d11ea64e22573_pop',
                        expression: 'SELECT [/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/2825] FOR PREVIOUS ([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1233])',
                        format: '#,##0'
                    }, execConfig);
                });
            });

            it('for generated measure', () => {
                const mdObjCloned = cloneDeep(mdObj);
                mdObjCloned.buckets[0] = {
                    localIdentifier: 'measures',
                    items: [
                        {
                            measure: {
                                localIdentifier: 'm1_pop',
                                definition: {
                                    popMeasureDefinition: {
                                        measureIdentifier: 'm1',
                                        popAttribute: {
                                            uri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1233'
                                        }
                                    }
                                },
                                title: 'Sum of Amount - previous year',
                                format: '#,##0.00'
                            }
                        },
                        {
                            measure: {
                                localIdentifier: 'm1',
                                definition: {
                                    measureDefinition: {
                                        item: {
                                            uri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144'
                                        },
                                        aggregation: 'sum'
                                    }
                                },
                                title: 'Sum of Amount',
                                format: '#,##0.00'
                            }
                        }]
                };

                return ex.mdToExecutionDefinitionsAndColumns('qamfsd9cw85e53mcqs74k8a0mwbf5gc2', mdObjCloned).then((execConfig) => {
                    expectColumns([
                        '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1233',
                        'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.00d7d51e0e86780bebfe65b025ed8f14_pop',
                        'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.7537800b1daf7582198e84ca6205d600_sum'
                    ], execConfig);

                    expectMetricDefinition({
                        identifier: 'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.00d7d51e0e86780bebfe65b025ed8f14_pop',
                        expression: 'SELECT (SELECT SUM([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144])) FOR PREVIOUS ([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1233])',
                        title: 'Sum of Amount - previous year',
                        format: '#,##0.00'
                    }, execConfig);

                    expectMetricDefinition({
                        identifier: 'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.7537800b1daf7582198e84ca6205d600_sum',
                        expression: 'SELECT SUM([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144])',
                        title: 'Sum of Amount',
                        format: '#,##0.00'
                    }, execConfig);
                });
            });

            it('for generated measure with contribution', () => {
                const mdObjCloned = cloneDeep(mdObj);
                mdObjCloned.buckets[0] = {
                    localIdentifier: 'measures',
                    items: [
                        {
                            measure: {
                                localIdentifier: 'm1_pop',
                                definition: {
                                    popMeasureDefinition: {
                                        measureIdentifier: 'm1',
                                        popAttribute: {
                                            uri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1233'
                                        }
                                    }
                                },
                                title: '% Sum of Amount - previous year',
                                format: '#,##0.00'
                            }
                        },
                        {
                            measure: {
                                localIdentifier: 'm1',
                                definition: {
                                    measureDefinition: {
                                        item: {
                                            uri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144'
                                        },
                                        aggregation: 'sum',
                                        computeRatio: true
                                    }
                                },
                                title: '% Sum of Amount',
                                format: '#,##0.00'
                            }
                        }]
                };

                return ex.mdToExecutionDefinitionsAndColumns('qamfsd9cw85e53mcqs74k8a0mwbf5gc2', mdObjCloned).then((execConfig) => {
                    expectColumns([
                        '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1233',
                        'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.985ea06c284684b6feb0b05a6d796034_pop',
                        'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.93434aa1d9e8d4fe653757ba8c891025_percent'
                    ], execConfig);

                    expectMetricDefinition({
                        title: '% Sum of Amount - previous year',
                        identifier: 'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.985ea06c284684b6feb0b05a6d796034_pop',
                        expression: 'SELECT (SELECT (SELECT SUM([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144])) / (SELECT SUM([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144]) BY ALL [/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1233])) FOR PREVIOUS ([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1233])',
                        format: '#,##0.00%'
                    }, execConfig);

                    expectMetricDefinition({
                        title: '% Sum of Amount',
                        identifier: 'fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.93434aa1d9e8d4fe653757ba8c891025_percent',
                        expression: 'SELECT (SELECT SUM([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144])) / (SELECT SUM([/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1144]) BY ALL [/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1233])',
                        format: '#,##0.00%'
                    }, execConfig);
                });
            });
        });
    });
});
