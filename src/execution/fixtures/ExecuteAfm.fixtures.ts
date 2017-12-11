import { AFM, Execution } from '@gooddata/typings';

const emptyResponseWithNull: Execution.IExecutionResponses = {
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
    executionResult: null
};

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

const attributeOnlyResponse: Execution.IExecutionResponses = {
    executionResponse: {
        executionResponse: {
            dimensions: [
                {
                    headers: [
                        {
                            attributeHeader: {
                                name: 'Activity Type',
                                localIdentifier: '7db11218-2497-4c0d-ae3d-e746150ff259',
                                uri: '/gdc/md/iv700nz0qecyidsh6kakoxo5fmk8o9cs/obj/1252',
                                identifier: 'label.activity.activitytype',
                                formOf: {
                                    name: 'Activity Type',
                                    uri: '/gdc/md/iv700nz0qecyidsh6kakoxo5fmk8o9cs/obj/1251',
                                    identifier: 'attr.activity.activitytype'
                                }
                            }
                        }
                    ]
                },
                {
                    headers: []
                }
            ],
            links: {
                executionResult:
                    '/gdc/app/projects/iv700nz0qecyidsh6kakoxo5fmk8o9cs/executionResults/4863872856674434048' +
                    '?q=eAGdkbFOwzAQhl8Fea7kJFILREKIAaQuHaAVA%2Brg2Nf2iB0H%2B1IIUd6dSxvBQpdsPtv36b%2FvOhGg%0' +
                    'A9oFWyoHIxaYiJAtGzIT2tnHVKxo6RJG%2FbWdih5YgjEXwn8OpE4ooYNEQrIdOZjxowiNSe7Vua2BQ%0AbJxTo' +
                    'eUXLgzG2qr2yQe3NHwl90ZLZyQer5Ok%2Bk4%2BQLdo4mFRqtJ%2F%2BfnOlTf%2BVkfpi3eZZvOMGYWK%0A8Gj' +
                    'BQUWb5%2BUESCrh3B7v0dwx8TT0P9F%2FZ5uUNR3InpQ9KevZYGTTIu9GtxdNvozfDAZgmb7iaCpq%0AxjUBJ8y' +
                    'ib7f9rxAtq44gNgH%2FFvxGMMB71Gfo%2F4ALEO1%2Fg%3D%3D%0A&c=58db8bd401cd8f37900b01e46aec7d0' +
                    '0&offset=0%2C0&limit=1000%2C1000&dimensions=2&totals=0%2C0'
            }
        }
    },
    executionResult: {
        executionResult: {
            data: [],
            paging: {
                count: [4, 0],
                offset: [0, 0],
                total: [4, 1]
            },
            headerItems: [
                [
                    [
                        {
                            attributeHeaderItem: {
                                name: 'Email',
                                uri: '/gdc/md/iv700nz0qecyidsh6kakoxo5fmk8o9cs/obj/1251/elements?id=169663'
                            }
                        },
                        {
                            attributeHeaderItem: {
                                name: 'In Person Meeting',
                                uri: '/gdc/md/iv700nz0qecyidsh6kakoxo5fmk8o9cs/obj/1251/elements?id=169661'
                            }
                        },
                        {
                            attributeHeaderItem: {
                                name: 'Phone Call',
                                uri: '/gdc/md/iv700nz0qecyidsh6kakoxo5fmk8o9cs/obj/1251/elements?id=169658'
                            }
                        },
                        {
                            attributeHeaderItem: {
                                name: 'Web Meeting',
                                uri: '/gdc/md/iv700nz0qecyidsh6kakoxo5fmk8o9cs/obj/1251/elements?id=169666'
                            }
                        }
                    ]
                ],
                []
            ]
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
    emptyResponseWithNull,
    attributeOnlyResponse,
    tooLargeResponse,
    oneMeasureResponse,
    oneMeasureAfm,
    badRequestResponse
};
