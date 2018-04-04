// (C) 2007-2018 GoodData Corporation
import { AFM } from '@gooddata/typings';
import {
    Granularities
} from '../constants/granularities';
import { INormalizedAFM } from '../utils/AfmUtils';

const DATE_DATASET_URI = '/gdc/md/project/obj/727';

export const absoluteDateFilter1: AFM.IAbsoluteDateFilter = {
    absoluteDateFilter: {
        dataSet: {
            uri: DATE_DATASET_URI
        },
        from: '2014-01-01',
        to: '2016-01-01'
    }
};

export const absoluteDateFilter2: AFM.IAbsoluteDateFilter = {
    absoluteDateFilter: {
        dataSet: {
            uri: DATE_DATASET_URI
        },
        from: '2017-01-01',
        to: '2018-01-01'
    }
};

export const relativeDateFilter: AFM.IRelativeDateFilter = {
    relativeDateFilter: {
        dataSet: {
            uri: DATE_DATASET_URI
        },
        from: -10,
        to: -9,
        granularity: Granularities.YEAR
    }
};

export const metricSum: AFM.IMeasure = {
    localIdentifier: 'metric_sum',
    definition: {
        measure: {
            item: {
                uri: '/gdc/md/measure/obj/1'
            },
            aggregation: 'sum'
        }
    }
};

export const metricSum2: AFM.IMeasure = {
    localIdentifier: 'metric_sum_2',
    definition: {
        measure: {
            item: {
                uri: '/gdc/md/measure/obj/2'
            },
            filters: [relativeDateFilter],
            aggregation: 'sum'
        }
    }
};

export const metricSum3: AFM.IMeasure = {
    localIdentifier: 'metric_sum_3',
    definition: {
        measure: {
            item: {
                uri: '/gdc/md/measure/obj/3'
            },
            filters: [absoluteDateFilter2],
            aggregation: 'sum'
        }
    }
};

export const metricSum4: AFM.IMeasure = {
    localIdentifier: 'metric_sum_4',
    definition: {
        measure: {
            item: {
                uri: '/gdc/md/measure/obj/4'
            },
            filters: [absoluteDateFilter1],
            aggregation: 'sum'
        }
    }
};

export const metricInPercent: AFM.IMeasure = {
    localIdentifier: 'measure_in_percent',
    definition: {
        measure: {
            item: {
                uri: 'measure_identifier'
            },
            showInPercent: true,
            filters: [
                relativeDateFilter
            ]
        }
    }
};

export const metricInPercentPop: AFM.IMeasure = {
    localIdentifier: 'measure_pop',
    definition: {
        popMeasure: {
            measureIdentifier: 'measure_in_percent',
            popAttribute: {
                identifier: 'attribute_display_form_identifier'
            }
        }
    }
};

export const afmWithMetricDateFilter: INormalizedAFM = {
    attributes: [],
    nativeTotals: [],
    measures: [
        metricSum,
        metricSum2
    ],
    filters: [
        absoluteDateFilter1
    ]
};

export const afmWithoutMetricDateFilters: INormalizedAFM = {
    attributes: [],
    nativeTotals: [],
    measures: [
        metricSum,
        {
            localIdentifier: 'metric4_sum',
            definition: {
                measure: {
                    item: {
                        uri: '/gdc/md/measure/obj/4'
                    },
                    filters: [],
                    aggregation: 'sum'
                }
            }
        }, {
            localIdentifier: 'metric5_sum',
            definition: {
                measure: {
                    item: {
                        uri: '/gdc/md/measure/obj/5'
                    },
                    filters: [],
                    aggregation: 'sum'
                }
            }
        }],
    filters: [
        absoluteDateFilter1
    ]
};
