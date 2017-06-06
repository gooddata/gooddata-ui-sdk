import { IVisualizationObject } from '../../model/VisualizationObject';
import {
    ATTRIBUTE_DISPLAY_FORM_URI,
    ATTRIBUTE_URI,
    ATTRIBUTE_DISPLAY_FORM_URI_2,
    ATTRIBUTE_URI_2,
    DATE_DATA_SET_URI,
    DATE_DISPLAY_FORM_URI,
    DATE_URI
} from './Afm.fixtures';

const simpleMeasure: IVisualizationObject = {
    type: 'bar',

    buckets: {
        measures: [{
            measure: {
                measureFilters: [],
                objectUri: '/gdc/md/project/obj/metric.id',
                showInPercent: false,
                showPoP: false,
                title: 'Measure M1',
                type: 'metric'
            }
        }],
        categories: [],
        filters: []
    }
};

const filteredMeasure: IVisualizationObject = {
    type: 'bar',

    buckets: {
        measures: [{
            measure: {
                measureFilters: [{
                    listAttributeFilter: {
                        attribute: ATTRIBUTE_URI,
                        displayForm: ATTRIBUTE_DISPLAY_FORM_URI,
                        default: {
                            negativeSelection: false,
                            attributeElements: [
                                `${ATTRIBUTE_URI}?id=1`,
                                `${ATTRIBUTE_URI}?id=2`
                            ]
                        }
                    }
                }],
                objectUri: '/gdc/md/project/obj/metric.id',
                showInPercent: false,
                showPoP: false,
                title: 'Measure M1',
                type: 'metric'
            }
        }],
        categories: [],
        filters: []
    }
};

const factBasedMeasure: IVisualizationObject = {
    type: 'bar',

    buckets: {
        measures: [{
            measure: {
                measureFilters: [],
                objectUri: '/gdc/md/project/obj/fact.id',
                showInPercent: false,
                showPoP: false,
                title: 'SUM of Measure M1',
                type: 'fact',
                aggregation: 'sum'
            }
        }],
        categories: [],
        filters: []
    }
};

const attributeBasedMeasure: IVisualizationObject = {
    type: 'bar',

    buckets: {
        measures: [{
            measure: {
                measureFilters: [],
                objectUri: ATTRIBUTE_DISPLAY_FORM_URI,
                showInPercent: false,
                showPoP: false,
                title: 'COUNT of Measure M1',
                type: 'attribute',
                aggregation: 'count'
            }
        }],
        categories: [],
        filters: []
    }
};

const showInPercent: IVisualizationObject = {
    type: 'bar',

    buckets: {
        measures: [{
            measure: {
                measureFilters: [],
                objectUri: '/gdc/md/project/obj/metric.id',
                showInPercent: true,
                showPoP: false,
                title: 'Measure M1',
                type: 'metric'
            }
        }],
        categories: [{
            category: {
                type: 'attribute',
                collection: 'attribute',
                displayForm: ATTRIBUTE_DISPLAY_FORM_URI
            }
        }],
        filters: []
    }
};

const showInPercentWithDate: IVisualizationObject = {
    type: 'bar',

    buckets: {
        measures: [{
            measure: {
                measureFilters: [],
                objectUri: '/gdc/md/project/obj/metric.id',
                showInPercent: true,
                showPoP: false,
                title: 'Measure M1',
                type: 'metric'
            }
        }],
        categories: [{
            category: {
                collection: 'attribute',
                displayForm: DATE_DISPLAY_FORM_URI,
                type: 'date'
            }
        }],
        filters: []
    }
};

const measureWithSorting: IVisualizationObject = {
    type: 'bar',

    buckets: {
        measures: [{
            measure: {
                measureFilters: [],
                objectUri: '/gdc/md/project/obj/metric.id',
                showInPercent: false,
                showPoP: false,
                title: 'Measure M1',
                type: 'metric',
                sort: {
                    direction: 'desc',
                    sortByPoP: false
                }
            }
        }],
        categories: [],
        filters: []
    }
};

const popMeasure: IVisualizationObject = {
    type: 'bar',
    buckets: {
        measures: [
            {
                measure: {
                    type: 'metric',
                    objectUri: '/gdc/md/project/obj/metric.id',
                    title: 'Measure M1',
                    measureFilters: [],
                    showInPercent: false,
                    showPoP: true,
                    sort: {
                        direction: 'desc',
                        sortByPoP: false
                    }
                }
            }
        ],
        categories: [
            {
                category: {
                    type: 'date',
                    collection: 'attribute',
                    displayForm: ATTRIBUTE_DISPLAY_FORM_URI,
                    attribute: ATTRIBUTE_URI
                }
            }
        ],
        filters: []
    }
};

const popMeasureWithSorting: IVisualizationObject = {
    type: 'bar',
    buckets: {
        measures: [
            {
                measure: {
                    type: 'metric',
                    objectUri: '/gdc/md/project/obj/metric.id',
                    title: 'Measure M1',
                    measureFilters: [],
                    showInPercent: false,
                    showPoP: true,
                    sort: {
                        direction: 'desc',
                        sortByPoP: true
                    }
                }
            }
        ],
        categories: [
            {
                category: {
                    type: 'date',
                    collection: 'attribute',
                    displayForm: ATTRIBUTE_DISPLAY_FORM_URI,
                    attribute: ATTRIBUTE_URI
                }
            }
        ],
        filters: []
    }
};

const categoryWithSorting: IVisualizationObject = {
    type: 'bar',
    buckets: {
        measures: [],
        categories: [{
            category: {
                collection: 'attribute',
                displayForm: ATTRIBUTE_DISPLAY_FORM_URI,
                type: 'attribute',
                sort: 'desc'
            }
        }],
        filters: []
    }
};

const dateFilter: IVisualizationObject = {
    type: 'bar',
    buckets: {
        measures: [],
        categories: [],
        filters: [{
            dateFilter: {
                attribute: DATE_URI,
                dataset: DATE_DATA_SET_URI,
                from: -89,
                granularity: 'GDC.time.date',
                to: 0,
                type: 'relative'
            }
        }]
    }
};

const attributeFilter: IVisualizationObject = {
    type: 'bar',
    buckets: {
        measures: [],
        categories: [],
        filters: [{
            listAttributeFilter: {
                attribute: ATTRIBUTE_URI,
                displayForm: ATTRIBUTE_DISPLAY_FORM_URI,
                default: {
                    negativeSelection: false,
                    attributeElements: [
                        `${ATTRIBUTE_URI}?id=1`,
                        `${ATTRIBUTE_URI}?id=2`,
                        `${ATTRIBUTE_URI}?id=3`
                    ]
                }
            }
        },
        {
            listAttributeFilter: {
                attribute: ATTRIBUTE_URI_2,
                displayForm: ATTRIBUTE_DISPLAY_FORM_URI_2,
                default: {
                    negativeSelection: false,
                    attributeElements: []
                }
            }
        }]
    }
};

const stackingAttribute: IVisualizationObject = {
    type: 'bar',
    buckets: {
        measures: [
            {
                measure: {
                    aggregation: 'sum',
                    showInPercent: false,
                    objectUri: '/gdc/md/project/obj/metric.id',
                    showPoP: false,
                    format: '#,##0.00',
                    title: 'Sum of Bundle cost',
                    type: 'fact',
                    measureFilters: [

                    ]
                }
            }
        ],
        categories: [
            {
                category: {
                    type: 'date',
                    collection: 'attribute',
                    displayForm: DATE_DISPLAY_FORM_URI,
                    attribute: DATE_URI
                }
            },
            {
                category: {
                    type: 'attribute',
                    collection: 'stack',
                    attribute: ATTRIBUTE_URI,
                    displayForm: ATTRIBUTE_DISPLAY_FORM_URI
                }
            }
        ],
        filters: [
            {
                dateFilter: {
                    type: 'relative',
                    from: -3,
                    to: 0,
                    granularity: 'GDC.time.quarter',
                    dataset: DATE_DATA_SET_URI,
                    attribute: DATE_URI
                }
            },
            {
                listAttributeFilter: {
                    attribute: ATTRIBUTE_URI,
                    displayForm: ATTRIBUTE_DISPLAY_FORM_URI,
                    default: {
                        negativeSelection: true,
                        attributeElements: [

                        ]
                    }
                }
            }
        ]
    }
};

export const charts = {
    bar: {
        simpleMeasure,
        filteredMeasure,
        factBasedMeasure,
        attributeBasedMeasure,
        showInPercent,
        showInPercentWithDate,
        measureWithSorting,
        popMeasure,
        popMeasureWithSorting,
        categoryWithSorting,
        dateFilter,
        attributeFilter,
        stackingAttribute
    }
};
