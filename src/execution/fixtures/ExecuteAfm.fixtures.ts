import { AFM, Execution } from '@gooddata/typings';

const emptyResponse: Execution.IExecutionResponses = {
    executionResponse: {
        executionResponse: {
            dimensions: [
                {
                    headers: []
                },
                {
                    headers: [
                        {
                            measureGroupHeader: {
                                items: [
                                    {
                                        measureHeaderItem: {
                                            name: 'Lost',
                                            format: '$#,##0.00',
                                            localIdentifier: '1st_measure_local_identifier',
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
                // tslint:disable-next-line:max-line-length
                executionResult: '/gdc/app/projects/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/executionResults/2651138797087227392'
            }
        }
    },
    executionResult: {
        executionResult: {
            data: [],
            paging: {
                count: [
                    0,
                    0
                ],
                offset: [
                    0,
                    0
                ],
                total: [
                    0,
                    0
                ]
            }
        }
    }
};

const tooLargeResponse: Execution.IError = {
    name: 'Error 413',
    message: 'Response is too large',
    response: {
        status: 413
    }
};

const badRequestResponse: Execution.IError = {
    name: 'Error 400',
    message: 'Bad request',
    response: {
        status: 400
    }
};

const oneMeasureAfm: AFM.IAfm = {
    measures: [
        {
            localIdentifier: '1st_measure_local_identifier',
            definition: {
                measure: {
                    item: {
                        uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283'
                    }
                }
            }
        }
    ]
};

const oneMeasureResponse: Execution.IExecutionResponses = {
    executionResponse: {
        executionResponse: {
            dimensions: [
                {
                    headers: []
                },
                {
                    headers: [
                        {
                            measureGroupHeader: {
                                items: [
                                    {
                                        measureHeaderItem: {
                                            name: 'Lost',
                                            format: '$#,##0.00',
                                            localIdentifier: '1st_measure_local_identifier',
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
                // tslint:disable-next-line:max-line-length
                executionResult: '/gdc/app/projects/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/executionResults/2651138797087227392'
            }
        }
    },
    executionResult: {
        executionResult: {
            data: [
                [
                    '42470571.16'
                ]
            ],
            paging: {
                count: [
                    1,
                    1
                ],
                offset: [
                    0,
                    0
                ],
                total: [
                    1,
                    1
                ]
            },
            headerItems: [
                [],
                []
            ]
        }
    }
};

export {
    emptyResponse,
    tooLargeResponse,
    oneMeasureResponse,
    oneMeasureAfm,
    badRequestResponse
};
