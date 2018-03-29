// (C) 2007-2018 GoodData Corporation
import { VisualizationObject } from '@gooddata/typings';
import {
    ATTRIBUTE_DISPLAY_FORM_URI,
    ATTRIBUTE_URI,
    ATTRIBUTE_DISPLAY_FORM_URI_2,
    ATTRIBUTE_URI_2,
    DATE_DATA_SET_URI,
    DATE_DISPLAY_FORM_URI,
    METRIC_IDENTIFIER,
    ATTRIBUTE_DISPLAY_FORM_IDENTIFIER
} from './Afm.fixtures';

const simpleMeasure: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: 'visClassUri'
    },
    buckets: [
        {
            localIdentifier: 'measures',
            items: [
                {
                    measure: {
                        localIdentifier: 'm1',
                        alias: 'Measure M1',
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: '/gdc/md/project/obj/metric.id'
                                }
                            }
                        }
                    }
                }
            ]
        }]
};

const simpleMeasureWithIdentifiers: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: 'visClassUri'
    },
    buckets: [
        {
            localIdentifier: 'measures',
            items: [
                {
                    measure: {
                        localIdentifier: 'm1',
                        alias: 'Measure M1',
                        definition: {
                            measureDefinition: {
                                item: {
                                    identifier: 'metric.id'
                                }
                            }
                        }
                    }
                }
            ]
        }]
};

const simpleMeasureWithFormat: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: 'visClassUri'
    },
    buckets: [
        {
            localIdentifier: 'measures',
            items: [
                {
                    measure: {
                        localIdentifier: 'm1',
                        alias: 'Measure M1',
                        format: 'GD #,##0.00000',
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: '/gdc/md/project/obj/metric.id'
                                }
                            }
                        }
                    }
                }
            ]
        }]
};

const renamedMeasure: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: 'visClassUri'
    },
    buckets: [
        {
            localIdentifier: 'measures',
            items: [
                {
                    measure: {
                        localIdentifier: 'm1',
                        alias: 'Alias A1',
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: '/gdc/md/project/obj/metric.id'
                                }
                            }
                        }
                    }
                }
            ]
        }]
};

const filteredMeasure: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: 'visClassUri'
    },
    buckets: [
        {
            localIdentifier: 'measures',
            items: [
                {
                    measure: {
                        localIdentifier: 'm1',
                        alias: 'Measure M1',
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: '/gdc/md/project/obj/metric.id'
                                },
                                filters: [
                                    {
                                        positiveAttributeFilter: {
                                            displayForm: {
                                                uri: ATTRIBUTE_DISPLAY_FORM_URI
                                            },
                                            in: [
                                                `${ATTRIBUTE_URI}?id=1`,
                                                `${ATTRIBUTE_URI}?id=2`
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            ]
        }
    ]
};

const measureWithRelativeDate: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: 'visClassUri'
    },
    buckets: [
        {
            localIdentifier: 'measures',
            items: [
                {
                    measure: {
                        localIdentifier: 'm1',
                        alias: 'Measure M1',
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: '/gdc/md/project/obj/metric.id'
                                },
                                filters: [
                                    {
                                        relativeDateFilter: {
                                            dataSet: {
                                                uri: DATE_DATA_SET_URI
                                            },
                                            granularity: 'GDC.time.date',
                                            from: -89,
                                            to: 0
                                        }
                                    }, {
                                        positiveAttributeFilter: {
                                            displayForm: {
                                                uri: ATTRIBUTE_DISPLAY_FORM_URI
                                            },
                                            in: [
                                                `${ATTRIBUTE_URI}?id=1`,
                                                `${ATTRIBUTE_URI}?id=2`
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            ]
        }
    ]
};

const measureWithAbsoluteDate: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: 'visClassUri'
    },
    buckets: [
        {
            localIdentifier: 'measures',
            items: [{
                measure: {
                    localIdentifier: 'm1',
                    alias: 'Measure M1',
                    definition: {
                        measureDefinition: {
                            item: {
                                uri: '/gdc/md/project/obj/metric.id'
                            },
                            filters: [
                                {
                                    absoluteDateFilter: {
                                        dataSet: {
                                            uri: DATE_DATA_SET_URI
                                        },
                                        from: '2016-01-01',
                                        to: '2017-01-01'
                                    }
                                }, {
                                    positiveAttributeFilter: {
                                        displayForm: {
                                            uri: ATTRIBUTE_DISPLAY_FORM_URI
                                        },
                                        in: [
                                            `${ATTRIBUTE_URI}?id=1`,
                                            `${ATTRIBUTE_URI}?id=2`
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                }
            }]
        }
    ]
};

const factBasedMeasure: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: 'visClassUri'
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
                                    uri: '/gdc/md/project/obj/fact.id'
                                },
                                aggregation: 'sum'
                            }
                        }
                    }
                }
            ]
        }]
};

const factBasedRenamedMeasure: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: 'visClassUri'
    },
    buckets: [
        {
            localIdentifier: 'measures',
            items: [
                {
                    measure: {
                        localIdentifier: 'm1',
                        alias: 'Summary',
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: '/gdc/md/project/obj/fact.id'
                                },
                                aggregation: 'sum'
                            }
                        }
                    }
                }
            ]
        }]
};

const attributeBasedMeasure: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: 'visClassUri'
    },
    buckets: [
        {
            localIdentifier: 'measures',
            items: [
                {
                    measure: {
                        localIdentifier: 'm1',
                        format: '#,##0',
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: ATTRIBUTE_DISPLAY_FORM_URI
                                },
                                aggregation: 'count'
                            }
                        }
                    }
                }
            ]
        }]
};

const attributeBasedMeasureWithoutFormat: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: 'visClassUri'
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
                                    uri: ATTRIBUTE_DISPLAY_FORM_URI
                                },
                                aggregation: 'count'
                            }
                        }
                    }
                }
            ]
        }]
};

const attributeBasedRenamedMeasure: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: 'visClassUri'
    },
    buckets: [
        {
            localIdentifier: 'measures',
            items: [
                {
                    measure: {
                        localIdentifier: 'm1',
                        alias: 'Count',
                        format: '#,##0',
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: ATTRIBUTE_DISPLAY_FORM_URI
                                },
                                aggregation: 'count'
                            }
                        }
                    }
                }
            ]
        }]
};

const showInPercent: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: 'visClassUri'
    },
    buckets: [
        {
            localIdentifier: 'measures',
            items: [
                {
                    measure: {
                        localIdentifier: 'm1',
                        alias: 'Measure M1',
                        format: '#,##0.00%',
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: '/gdc/md/project/obj/metric.id'
                                },
                                computeRatio: true
                            }
                        }
                    }
                }
            ]
        }, {
            localIdentifier: 'categories',
            items: [
                {
                    visualizationAttribute: {
                        localIdentifier: 'a1',
                        displayForm: {
                            uri: ATTRIBUTE_DISPLAY_FORM_URI
                        }
                    }
                }
            ]
        }]
};

const showInPercentWithoutFormat: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: 'visClassUri'
    },
    buckets: [
        {
            localIdentifier: 'measures',
            items: [
                {
                    measure: {
                        localIdentifier: 'm1',
                        alias: 'Measure M1',
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: '/gdc/md/project/obj/metric.id'
                                },
                                computeRatio: true
                            }
                        }
                    }
                }
            ]
        }, {
            localIdentifier: 'categories',
            items: [
                {
                    visualizationAttribute: {
                        localIdentifier: 'a1',
                        displayForm: {
                            uri: ATTRIBUTE_DISPLAY_FORM_URI
                        }
                    }
                }
            ]
        }]
};

const showInPercentWithDate: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: 'visClassUri'
    },
    buckets: [
        {
            localIdentifier: 'measures',
            items: [
                {
                    measure: {
                        localIdentifier: 'm1',
                        alias: 'Measure M1',
                        format: '#,##0.00%',
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: '/gdc/md/project/obj/metric.id'
                                },
                                computeRatio: true
                            }
                        }
                    }
                }
            ]
        }, {
            localIdentifier: 'categories',
            items: [
                {
                    visualizationAttribute: {
                        localIdentifier: 'a1',
                        displayForm: {
                            uri: DATE_DISPLAY_FORM_URI
                        }
                    }
            }]
        }]
    };

const measureWithSorting: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: 'visClassUri'
    },
    buckets: [
        {
            localIdentifier: 'measures',
            items: [
                {
                    measure: {
                        localIdentifier: 'm1',
                        alias: 'Measure M1',
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: '/gdc/md/project/obj/metric.id'
                                }
                            }
                        }
                    }
                }
            ]
        }],

    // tslint:disable-next-line:max-line-length
    properties: '{"sortItems":[{"measureSortItem":{"direction":"desc","locators":[{"measureLocatorItem":{"measureIdentifier":"m1"}}]}}]}'
};

const popMeasure: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: 'visClassUri'
    },
    buckets: [
        {
            localIdentifier: 'measures',
            items: [
                {
                    measure: {
                        localIdentifier: 'm1_pop',
                        alias: 'Measure M1 - previous year',
                        definition: {
                            popMeasureDefinition: {
                                measureIdentifier: 'm1',
                                popAttribute: {
                                    uri: ATTRIBUTE_URI
                                }
                            }
                        }
                    }
                },
                {
                    measure: {
                        localIdentifier: 'm1',
                        alias: 'Measure M1',
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: '/gdc/md/project/obj/metric.id'
                                }
                            }
                        }
                    }
                }
            ]
        }, {
            localIdentifier: 'categories',
            items: [
                {
                    visualizationAttribute: {
                        localIdentifier: 'a1',
                        displayForm: {
                            uri: ATTRIBUTE_DISPLAY_FORM_URI
                        }
                    }
                }]
            }],
    // tslint:disable-next-line:max-line-length
    properties: '{"sortItems":[{"measureSortItem":{"direction":"desc","locators":[{"measureLocatorItem":{"measureIdentifier":"m1"}}]}}]}'
};

const popMeasureWithSorting: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: 'visClassUri'
    },
    buckets: [
        {
            localIdentifier: 'measures',
            items: [
                {
                    measure: {
                        localIdentifier: 'm1_pop',
                        alias: 'Measure M1 - previous year',
                        definition: {
                            popMeasureDefinition: {
                                measureIdentifier: 'm1',
                                popAttribute: {
                                    uri: ATTRIBUTE_URI
                                }
                            }
                        }
                    }
                },
                {
                    measure: {
                        localIdentifier: 'm1',
                        alias: 'Measure M1',
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: '/gdc/md/project/obj/metric.id'
                                }
                            }
                        }
                    }
                }
            ]
        }, {
            localIdentifier: 'categories',
            items: [{
                visualizationAttribute: {
                    localIdentifier: 'a1',
                    displayForm: {
                        uri: ATTRIBUTE_DISPLAY_FORM_URI
                    }
                }
            }]
        }],
    // tslint:disable-next-line:max-line-length
    properties: '{"sortItems":[{"measureSortItem":{"direction":"desc","locators":[{"measureLocatorItem":{"measureIdentifier":"m1_pop"}}]}}]}'
};

const categoryWithSorting: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: 'visClassUri'
    },
    buckets: [
        {
            localIdentifier: 'categories',
            items: [
                {
                    visualizationAttribute: {
                        localIdentifier: 'a1',
                        displayForm: {
                            uri: ATTRIBUTE_DISPLAY_FORM_URI
                        }
                    }
                }
            ]
        }],
    // tslint:disable-next-line:max-line-length
    properties: '{"sortItems":[{"attributeSortItem":{"direction":"desc","attributeIdentifier":"a1"}}]}'
};

const attributeFilter: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: 'visClassUri'
    },
    buckets: [],
    filters: [
        {
            positiveAttributeFilter: {
                displayForm: {
                    uri: ATTRIBUTE_DISPLAY_FORM_URI
                },
                in: [
                    `${ATTRIBUTE_URI}?id=1`,
                    `${ATTRIBUTE_URI}?id=2`,
                    `${ATTRIBUTE_URI}?id=3`
                ]
            }
        },
        {
            positiveAttributeFilter: {
                displayForm: {
                    uri: ATTRIBUTE_DISPLAY_FORM_URI_2
                },
                in: [
                    `${ATTRIBUTE_URI_2}?id=a`
                ]
            }
        }
    ]
};

const dateFilter: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: 'visClassUri'
    },
    buckets: [],
    filters: [
        {
            relativeDateFilter: {
                from: -89,
                to: 0,
                granularity: 'GDC.time.date',
                dataSet: {
                    uri: DATE_DATA_SET_URI
                }
            }
        }
    ]
};

const dateFilterWithStrings: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: 'visClassUri'
    },
    buckets: [],
    filters: [{
        relativeDateFilter: {
            from: -89,
            to: 0,
            granularity: 'GDC.time.date',
            dataSet: {
                uri: DATE_DATA_SET_URI
            }
        }
    }]
};

const dateFilterWithUndefs: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: 'visClassUri'
    },
    buckets: [],
    filters: [{
        relativeDateFilter: {
            granularity: 'GDC.time.date',
            dataSet: {
                uri: DATE_DATA_SET_URI
            }
        }
    }]
};

const attributeFilterWithAll: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: 'visClassUri'
    },
    buckets: [],
    filters: [
        {
            negativeAttributeFilter: {
                displayForm: {
                    uri: ATTRIBUTE_DISPLAY_FORM_URI
                },
                notIn: []
            }
        },
        {
            positiveAttributeFilter: {
                displayForm: {
                    uri: ATTRIBUTE_DISPLAY_FORM_URI_2
                },
                in: [
                    `${ATTRIBUTE_URI_2}?id=a`
                ]
            }
    }]
};

const stackingAttribute: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: 'visClassUri'
    },
    buckets: [
        {
            localIdentifier: 'measures',
            items: [
                {
                    measure: {
                        localIdentifier: 'm1',
                        alias: 'Sum of Bundle cost',
                        format: '#,##0.00',
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: '/gdc/md/project/obj/metric.id'
                                },
                                aggregation: 'sum'
                            }
                        }
                    }
                }
            ]
        }, {
            localIdentifier: 'view',
            items: [{
                visualizationAttribute: {
                    localIdentifier: 'a1',
                    displayForm: {
                        uri: DATE_DISPLAY_FORM_URI
                    }
                }
            }]
        }, {
            localIdentifier: 'stack',
            items: [
                {
                    visualizationAttribute: {
                        localIdentifier: 'a2',
                        displayForm: {
                            uri: ATTRIBUTE_DISPLAY_FORM_URI
                        }
                    }
                }
            ]
        }],
    filters: [
        {
            relativeDateFilter: {
                granularity: 'GDC.time.quarter',
                dataSet: {
                    uri: DATE_DATA_SET_URI
                },
                from: -3,
                to: 0
            }
        },
        {
            negativeAttributeFilter: {
                displayForm: {
                    uri: ATTRIBUTE_DISPLAY_FORM_URI
                },
                notIn: [
                    `${ATTRIBUTE_URI}?id=1`
                ]
            }
        }
    ]
};

const stackingRenamedAttribute: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: 'visClassUri'
    },
    buckets: [
        {
            localIdentifier: 'measures',
            items: [
                {
                    measure: {
                        localIdentifier: 'm1',
                        alias: 'My Metric Alias',
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: '/gdc/md/project/obj/metric.id'
                                },
                                aggregation: 'sum'
                            }
                        }
                    }
                }
            ]
        }, {
            localIdentifier: 'view',
            items: [{
                visualizationAttribute: {
                    localIdentifier: 'a1',
                    alias: 'My Date Alias',
                    displayForm: {
                        uri: DATE_DISPLAY_FORM_URI
                    }
                }
            }]
        }, {
            localIdentifier: 'stack',
            items: [
                {
                    visualizationAttribute: {
                        localIdentifier: 'a2',
                        alias: 'My Attribute Alias',
                        displayForm: {
                            uri: ATTRIBUTE_DISPLAY_FORM_URI
                        }
                    }
                }
            ]
        }],
    filters: []
};

const oneMeasureOneAttribute: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: 'visClassUri'
    },
    buckets: [
        {
            localIdentifier: 'measures',
            items: [
                {
                    measure: {
                        localIdentifier: 'm1',
                        alias: 'Sum of Bundle cost',
                        format: '#,##0.00',
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: '/gdc/md/project/obj/metric.id'
                                },
                                aggregation: 'sum'
                            }
                        }
                    }
                }
            ]
        }, {
            localIdentifier: 'attributes',
            items: [{
                visualizationAttribute: {
                    localIdentifier: 'a1',
                    displayForm: {
                        uri: ATTRIBUTE_DISPLAY_FORM_URI
                    }
                }
            }]
        }],
    filters: []
};

const oneMeasureOneAttributeWithIdentifiers: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: 'visClassUri'
    },
    buckets: [
        {
            localIdentifier: 'measures',
            items: [
                {
                    measure: {
                        localIdentifier: 'm1',
                        alias: 'Sum of Bundle cost',
                        format: '#,##0.00',
                        definition: {
                            measureDefinition: {
                                item: {
                                    identifier: METRIC_IDENTIFIER
                                },
                                aggregation: 'sum'
                            }
                        }
                    }
                }
            ]
        }, {
            localIdentifier: 'attributes',
            items: [{
                visualizationAttribute: {
                    localIdentifier: 'a1',
                    displayForm: {
                        identifier: ATTRIBUTE_DISPLAY_FORM_IDENTIFIER
                    }
                }
            }]
        }],
    filters: []
};

const multipleSorts: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: 'visClassUri'
    },
    buckets: [
        {
            localIdentifier: 'measures',
            items: [
                {
                    measure: {
                        localIdentifier: 'm1',
                        alias: 'Sum of Bundle cost',
                        format: '#,##0.00',
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: '/gdc/md/project/obj/metric.id'
                                },
                                aggregation: 'sum'
                            }
                        }
                    }
                },
                {
                    measure: {
                        localIdentifier: 'm2',
                        alias: 'Sum of Bundle cost',
                        format: '#,##0.00',
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: '/gdc/md/project/obj/metric.id'
                                },
                                aggregation: 'sum'
                            }
                        }
                    }
                }
            ]}
    ],
    filters: [],
    // tslint:disable-next-line:max-line-length
    properties: '{"sortItems":[{"measureSortItem":{"direction":"desc","locators":[{"measureLocatorItem":{"measureIdentifier":"m1"}}]}}]}'
};

export const tables = {
    oneMeasureOneAttribute,
    oneMeasureOneAttributeWithIdentifiers,
    multipleSorts
};

export const charts = {
    simpleMeasure,
    simpleMeasureWithIdentifiers,
    simpleMeasureWithFormat,
    renamedMeasure,
    filteredMeasure,
    measureWithRelativeDate,
    measureWithAbsoluteDate,
    factBasedMeasure,
    factBasedRenamedMeasure,
    attributeBasedMeasure,
    attributeBasedMeasureWithoutFormat,
    attributeBasedRenamedMeasure,
    showInPercent,
    showInPercentWithoutFormat,
    showInPercentWithDate,
    measureWithSorting,
    popMeasure,
    popMeasureWithSorting,
    categoryWithSorting,
    dateFilter,
    dateFilterWithStrings,
    dateFilterWithUndefs,
    attributeFilter,
    attributeFilterWithAll,
    stackingAttribute,
    stackingRenamedAttribute
};

export const attributeWithIdentifier: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: 'visClassUri'
    },
    buckets: [{
        localIdentifier: 'measures',
        items: [
            {
                measure: {
                    localIdentifier: 'm1',
                    alias: 'm1',
                    definition: {
                        measureDefinition: {
                            item: {
                                uri: 'foo'
                            }
                        }
                    }
                }
            }
        ]
    }, {
        localIdentifier: 'categories',
        items: [
            {
                visualizationAttribute: {
                    localIdentifier: 'bar',
                    displayForm: {
                        uri: ATTRIBUTE_DISPLAY_FORM_URI
                    },
                    alias: 'Attribute Bar'
                }
            }
        ]
    }]
};
