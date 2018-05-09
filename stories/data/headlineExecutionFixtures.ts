// (C) 2007-2018 GoodData Corporation
import { AFM, Execution } from '@gooddata/typings';

const headlineWithOneMeasureExecutionRequest: AFM.IExecution['execution'] = {
    afm: {
        measures: [
            {
                definition: {
                    measure: {
                        item: {
                            uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283'
                        }
                    }
                },
                localIdentifier: 'lostMetric',
                format: '#,##0.00',
                alias: 'Lost'
            }
        ]
    },
    resultSpec: {
        dimensions: [
            {
                itemIdentifiers: [
                    'measureGroup'
                ]
            }
        ]
    }
};

const headlineWithOneMeasureExecutionResponse: Execution.IExecutionResponse = {
    dimensions: [
        {
            headers: [
                {
                    measureGroupHeader: {
                        items: [
                            {
                                measureHeaderItem: {
                                    name: 'Lost',
                                    format: '#,##0.00',
                                    localIdentifier: 'lostMetric',
                                    uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283',
                                    identifier: 'af2Ewj9Re2vK'
                                }
                            }
                        ]
                    }
                }
            ]
        }
    ],
    links: {
        executionResult: 'abc'
    }
};

const headlineWithOneMeasureExecutionResult: Execution.IExecutionResult = {
    data: [
        9011389.956
    ],
    headerItems: [
        [
            [
                {
                    measureHeaderItem: {
                        name: 'Lost',
                        order: 0
                    }
                }
            ]
        ]
    ],
    paging: {
        count: [
            1
        ],
        offset: [
            0
        ],
        total: [
            1
        ]
    }
};

const headlineWithTwoMeasuresExecutionRequest: AFM.IExecution['execution'] = {
    afm: {
        measures: [
            {
                definition: {
                    measure: {
                        item: {
                            uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283'
                        }
                    }
                },
                localIdentifier: 'lostMetric',
                format: '#,##0.00',
                alias: 'Lost'
            },
            {
                definition: {
                    measure: {
                        item: {
                            uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1284'
                        }
                    }
                },
                localIdentifier: 'wonMetric',
                format: '#,##0.00',
                alias: 'Won'
            }
        ]
    },
    resultSpec: {
        dimensions: [
            {
                itemIdentifiers: [
                    'measureGroup'
                ]
            }
        ]
    }
};

const headlineWithTwoMeasuresExecutionResponse: Execution.IExecutionResponse = {
    dimensions: [
        {
            headers: [
                {
                    measureGroupHeader: {
                        items: [
                            {
                                measureHeaderItem: {
                                    name: 'Lost',
                                    format: '#,##0.00',
                                    localIdentifier: 'lostMetric',
                                    uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283',
                                    identifier: 'af2Ewj9Re2vK'
                                }
                            },
                            {
                                measureHeaderItem: {
                                    name: 'Won',
                                    format: '#,##0.00',
                                    localIdentifier: 'wonMetric',
                                    uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1284',
                                    identifier: 'afSEwRwdbMeQ'
                                }
                            }
                        ]
                    }
                }
            ]
        }
    ],
    links: {
        executionResult: 'abc'
    }
};

const headlineWithTwoMeasuresExecutionResult: Execution.IExecutionResult = {
    data: [
        9011389.956,
        42470571.16
    ],
    headerItems: [
        [
            [
                {
                    measureHeaderItem: {
                        name: 'Lost',
                        order: 0
                    }
                },
                {
                    measureHeaderItem: {
                        name: 'Won',
                        order: 1
                    }
                }
            ]
        ]
    ],
    paging: {
        count: [
            2
        ],
        offset: [
            0
        ],
        total: [
            2
        ]
    }
};

export const headlineWithOneMeasure = {
    executionRequest: headlineWithOneMeasureExecutionRequest,
    executionResponse: headlineWithOneMeasureExecutionResponse,
    executionResult: headlineWithOneMeasureExecutionResult
};

export const headlineWithTwoMeasures = {
    executionRequest: headlineWithTwoMeasuresExecutionRequest,
    executionResponse: headlineWithTwoMeasuresExecutionResponse,
    executionResult: headlineWithTwoMeasuresExecutionResult
};
