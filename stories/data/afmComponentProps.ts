// (C) 2007-2018 GoodData Corporation
import { AFM, VisualizationObject } from '@gooddata/typings';

const MEASURE_1: AFM.IMeasure = {
    localIdentifier: 'm1',
    definition: {
        measure: {
            item: {
                uri: '/gdc/md/storybook/obj/1'
            }
        }
    }
};

const MEASURE_1_POP: AFM.IMeasure = {
    localIdentifier: 'm1_pop',
    definition: {
        popMeasure: {
            measureIdentifier: 'm1',
            popAttribute: {
                uri: '/gdc/md/storybook/obj/3.df'
            }
        }
    }
};

const MEASURE_1_DUPLICATE: AFM.IMeasure = {
    ...MEASURE_1,
    localIdentifier: 'm2'
};

const MEASURE_2: AFM.IMeasure = {
    localIdentifier: 'm2',
    definition: {
        measure: {
            item: {
                uri: '/gdc/md/storybook/obj/2'
            }
        }
    }
};

const MEASURE_2_POP: AFM.IMeasure = {
    localIdentifier: 'm2_pop',
    definition: {
        popMeasure: {
            measureIdentifier: 'm2',
            popAttribute: {
                uri: '/gdc/md/storybook/obj/3.df'
            }
        }
    }
};

const ATTRIBUTE_CITIES: AFM.IAttribute = {
    localIdentifier: 'a1',
    displayForm: {
        uri: '/gdc/md/storybook/obj/3.df'
    }
};

const ATTRIBUTE: AFM.IAttribute = {
    localIdentifier: 'a1',
    displayForm: {
        uri: '/gdc/md/storybook/obj/4.df'
    }
};

const ATTRIBUTE_COLOURS: AFM.IAttribute = {
    localIdentifier: 'a1',
    displayForm: {
        uri: '/gdc/md/storybook/obj/4.df'
    }
};

const ATTRIBUTE_POPULARITY: AFM.IAttribute = {
    localIdentifier: 'a2',
    displayForm: {
        uri: '/gdc/md/storybook/obj/5.df'
    }
};

export const AFM_ONE_MEASURE: AFM.IAfm = {
    measures: [{
        ...MEASURE_1
    }]
};

export const AFM_ONE_RENAMED_MEASURE: AFM.IAfm = {
    measures: [{
        ...MEASURE_1,
        alias: 'My Alias'
    }]
};

export const AFM_ONE_MEASURE_ONE_ATTRIBUTE: AFM.IAfm = {
    measures: [
        MEASURE_1
    ],
    attributes: [
        ATTRIBUTE
    ]
};

export const AFM_ONE_MEASURE_TWO_ATTRIBUTES: AFM.IAfm = {
    measures: [
        MEASURE_1
    ],
    attributes: [
        ATTRIBUTE_POPULARITY,
        ATTRIBUTE_COLOURS
    ]
};

export const AFM_ONE_RENAMED_MEASURE_ONE_RENAMED_ATTRIBUTE: AFM.IAfm = {
    measures: [{
        ...MEASURE_1,
        alias: 'My Measure Alias'
    }],
    attributes: [{
        ...ATTRIBUTE,
        alias: 'My Attribute Alias'
    }]
};

export const AFM_TWO_MEASURES: AFM.IAfm = {
    measures: [
        MEASURE_1,
        MEASURE_2
    ]
};

export const AFM_TWO_MEASURES_ONE_ATTRIBUTE: AFM.IAfm = {
    measures: [
        MEASURE_1,
        MEASURE_2
    ],
    attributes: [
        ATTRIBUTE
    ]
};

export const AFM_TWO_MEASURES_ONE_ATTRIBUTE_POP: AFM.IAfm = {
    measures: [
        MEASURE_1_POP,
        MEASURE_1,
        MEASURE_2,
        MEASURE_2_POP
    ],
    attributes: [
        ATTRIBUTE
    ]
};

export const AFM_TWO_MEASURES_ONE_RENAMED_ATTRIBUTE: AFM.IAfm = {
    measures: [
        MEASURE_1,
        MEASURE_2
    ],
    attributes: [{
        ...ATTRIBUTE,
        alias: 'a'
    }]
};

export const AFM_TWO_MEASURES_ONE_ATTRIBUTE_CITIES_TOTALS: AFM.IAfm = {
    measures: [
        MEASURE_1,
        MEASURE_1_DUPLICATE
    ],
    attributes: [
        ATTRIBUTE_CITIES
    ],
    nativeTotals: [
        {
            measureIdentifier: MEASURE_1_DUPLICATE.localIdentifier,
            attributeIdentifiers: []
        }
    ]
};

export const RESULT_SPEC_TWO_MEASURES_ONE_ATTRIBUTE_CITIES_TOTALS: AFM.IResultSpec = {
    dimensions: [
        {
            itemIdentifiers: [ATTRIBUTE_CITIES.localIdentifier],
            totals: [
                {
                    measureIdentifier: MEASURE_1.localIdentifier,
                    type: 'sum',
                    attributeIdentifier: ATTRIBUTE_CITIES.localIdentifier
                },
                {
                    measureIdentifier: MEASURE_1_DUPLICATE.localIdentifier,
                    type: 'nat',
                    attributeIdentifier: ATTRIBUTE_CITIES.localIdentifier
                }
            ]
        },
        {
            itemIdentifiers: ['measureGroup']
        }
    ]
};

export const AFM_TWO_MEASURES_ONE_ATTRIBUTE_TOTALS: AFM.IAfm = {
    measures: [
        MEASURE_1,
        MEASURE_2
    ],
    attributes: [
        ATTRIBUTE
    ],
    nativeTotals: [
        {
            measureIdentifier: MEASURE_2.localIdentifier,
            attributeIdentifiers: []
        }
    ]
};

export const RESULT_SPEC_TWO_MEASURES_ONE_ATTRIBUTE_TOTALS: AFM.IResultSpec = {
    dimensions: [
        {
            itemIdentifiers: [ATTRIBUTE.localIdentifier],
            totals: [
                {
                    measureIdentifier: MEASURE_1.localIdentifier,
                    type: 'sum',
                    attributeIdentifier: ATTRIBUTE.localIdentifier
                },
                {
                    measureIdentifier: MEASURE_2.localIdentifier,
                    type: 'nat',
                    attributeIdentifier: ATTRIBUTE.localIdentifier
                }
            ]
        },
        {
            itemIdentifiers: ['measureGroup']
        }
    ]
};

export const AFM_TWO_MEASURES_ONE_ATTRIBUTE_COMBO_MD_OBJECT: VisualizationObject.IVisualizationObjectContent = {
    buckets: [
        {
            localIdentifier: 'measures',
            items: [
                {
                    measure: {
                        localIdentifier: MEASURE_1.localIdentifier,
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: ((MEASURE_1.definition as AFM.ISimpleMeasureDefinition)
                                        .measure.item as AFM.IObjUriQualifier).uri
                                }
                            }
                        },
                        title: 'Lost'
                    }
                }
            ]
        },
        {
            localIdentifier: 'secondary_measures',
            items: [
                {
                    measure: {
                        localIdentifier: MEASURE_2.localIdentifier,
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: ((MEASURE_2.definition as AFM.ISimpleMeasureDefinition)
                                        .measure.item as AFM.IObjUriQualifier).uri
                                }
                            }
                        },
                        title: 'Won'
                    }
                }
            ]
        },
        {
            localIdentifier: 'view',
            items: [
                {
                    visualizationAttribute: {
                        localIdentifier: ATTRIBUTE.localIdentifier,
                        displayForm: {
                            uri: (ATTRIBUTE.displayForm as AFM.IObjUriQualifier).uri
                        }
                    }
                }
            ]
        }
    ],
    filters: [],
    visualizationClass: {
        uri: '/gdc/md/x3k4294x4k00lrz5degxnc6nykynhh52/obj/76038'
    }
};

export const AFM_ONE_BAR_MEASURE_ONE_ATTRIBUTE_COMBO_MD_OBJECT: VisualizationObject.IVisualizationObjectContent = {
    buckets: [
        {
            localIdentifier: 'measures',
            items: [
                {
                    measure: {
                        localIdentifier: MEASURE_1.localIdentifier,
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: ((MEASURE_1.definition as AFM.ISimpleMeasureDefinition)
                                        .measure.item as AFM.IObjUriQualifier).uri
                                }
                            }
                        },
                        title: 'Lost'
                    }
                }
            ]
        },
        {
            localIdentifier: 'secondary_measures',
            items: []
        },
        {
            localIdentifier: 'view',
            items: [
                {
                    visualizationAttribute: {
                        localIdentifier: ATTRIBUTE.localIdentifier,
                        displayForm: {
                            uri: (ATTRIBUTE.displayForm as AFM.IObjUriQualifier).uri
                        }
                    }
                }
            ]
        }
    ],
    filters: [],
    visualizationClass: {
        uri: '/gdc/md/x3k4294x4k00lrz5degxnc6nykynhh52/obj/76038'
    }
};

export const AFM_ONE_LINE_MEASURE_ONE_ATTRIBUTE_COMBO_MD_OBJECT: VisualizationObject.IVisualizationObjectContent = {
    buckets: [
        {
            localIdentifier: 'measures',
            items: []
        },
        {
            localIdentifier: 'secondary_measures',
            items: [{
                measure: {
                    localIdentifier: MEASURE_1.localIdentifier,
                    definition: {
                        measureDefinition: {
                            item: {
                                uri: ((MEASURE_1.definition as AFM.ISimpleMeasureDefinition)
                                    .measure.item as AFM.IObjUriQualifier).uri
                            }
                        }
                    },
                    title: 'Lost'
                }
            }]
        },
        {
            localIdentifier: 'view',
            items: [
                {
                    visualizationAttribute: {
                        localIdentifier: ATTRIBUTE.localIdentifier,
                        displayForm: {
                            uri: (ATTRIBUTE.displayForm as AFM.IObjUriQualifier).uri
                        }
                    }
                }
            ]
        }
    ],
    filters: [],
    visualizationClass: {
        uri: '/gdc/md/x3k4294x4k00lrz5degxnc6nykynhh52/obj/76038'
    }
};
