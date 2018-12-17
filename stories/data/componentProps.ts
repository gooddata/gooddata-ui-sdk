// (C) 2007-2018 GoodData Corporation
import { VisualizationObject, AFM } from '@gooddata/typings';

export const MEASURE_1: VisualizationObject.IMeasure = {
    measure: {
        localIdentifier: 'm1',
        definition: {
            measureDefinition: {
                item: {
                    uri: '/gdc/md/storybook/obj/1'
                }
            }
        }
    }
};

export const MEASURE_2: VisualizationObject.IMeasure = {
    measure: {
        localIdentifier: 'm2',
        definition: {
            measureDefinition: {
                item: {
                    uri: '/gdc/md/storybook/obj/2'
                }
            }
        }
    }
};

export const MEASURE_AM_1_2: VisualizationObject.IMeasure = {
    measure: {
        localIdentifier: 'am1',
        definition: {
            arithmeticMeasure: {
                measureIdentifiers: ['m1', 'm2'],
                operator: 'sum'
            }
        }
    }
};

export const MEASURE_3: VisualizationObject.IMeasure = {
    measure: {
        localIdentifier: 'm3',
        definition: {
            measureDefinition: {
                item: {
                    uri: '/gdc/md/storybook/obj/3'
                }
            }
        }
    }
};

export const MEASURE_1_POP: VisualizationObject.IMeasure = {
    measure: {
        localIdentifier: 'm1_pop',
        definition: {
            popMeasureDefinition: {
                measureIdentifier: 'm1',
                popAttribute: {
                    uri: '/gdc/md/storybook/obj/3.df'
                }
            }
        },
        alias: 'Previous period'
    }
};

export const MEASURE_1_PREVIOUS_PERIOD: VisualizationObject.IMeasure = {
    measure: {
        localIdentifier: 'm1_previous_period',
        definition: {
            previousPeriodMeasure: {
                measureIdentifier: 'm1',
                dateDataSets: [{
                    dataSet: {
                        uri: '/gdc/md/storybook/obj/3.df'
                    },
                    periodsAgo: 1
                }]
            }
        },
        alias: 'Previous period'
    }
};

export const MEASURE_1_WITH_ALIAS: VisualizationObject.IMeasure = {
    measure: {
        ...MEASURE_1.measure,
        alias: 'My measure alias'
    }
};

export const MEASURE_WITH_FORMAT: VisualizationObject.IMeasure = {
    measure: {
        localIdentifier: 'm3',
        definition: {
            measureDefinition: {
                item: {
                    uri: '/gdc/md/storybook/obj/4'
                }
            }
        }
    }
};

export const MEASURE_2_WITH_FORMAT: VisualizationObject.IMeasure = {
    measure: {
        localIdentifier: 'm2',
        definition: {
            measureDefinition: {
                item: {
                    uri: '/gdc/md/storybook/obj/2'
                }
            }
        },
        format: '[backgroundColor=ffff00][green]#,##0.00 €'
    }
};

export const MEASURE_WITH_NULLS: VisualizationObject.IMeasure = {
    measure: {
        localIdentifier: 'm4',
        definition: {
            measureDefinition: {
                item: {
                    uri: '/gdc/md/storybook/obj/9'
                }
            }
        }
    }
};

export const ARITHMETIC_MEASURE_SIMPLE_OPERANDS: VisualizationObject.IMeasure = {
    measure: {
        localIdentifier: 'arithmetic_measure_1',
        definition: {
            arithmeticMeasure: {
                measureIdentifiers: ['m1', 'm2'],
                operator: 'sum'
            }
        },
        alias: 'Sum of m1 and m2'
    }
};

export const ARITHMETIC_MEASURE_USING_ARITHMETIC: VisualizationObject.IMeasure = {
    measure: {
        localIdentifier: 'arithmetic_measure_2',
        definition: {
            arithmeticMeasure: {
                measureIdentifiers: ['arithmetic_measure_1', 'm2'],
                operator: 'difference'
            }
        },
        alias: 'Difference of arithmetic_measure_1 and m2'
    }
};

export const FORMATTED_ARITHMETIC_MEASURE: VisualizationObject.IMeasure = {
    measure: {
        localIdentifier: 'arithmetic_measure_3',
        definition: {
            arithmeticMeasure: {
                measureIdentifiers: ['m1', 'm2'],
                operator: 'sum'
            }
        },
        format: '[backgroundColor=ffff00][green]#,##0.00 €',
        alias: 'Formatted sum of m1 and m2'
    }
};

export const ATTRIBUTE_1: VisualizationObject.IVisualizationAttribute = {
    visualizationAttribute: {
        localIdentifier: 'a1',
        displayForm: {
            uri: '/gdc/md/storybook/obj/4.df'
        }
    }
};

export const ATTRIBUTE_COUNTRY: VisualizationObject.IVisualizationAttribute = {
    visualizationAttribute: {
        localIdentifier: 'country',
        displayForm: {
            uri: '/gdc/md/storybook/obj/3.df'
        }
    }
};

export const ATTRIBUTE_POPULARITY: VisualizationObject.IVisualizationAttribute = {
    visualizationAttribute: {
        localIdentifier: 'Popularity',
        displayForm: {
            uri: '/gdc/md/storybook/obj/5.df'
        }
    }
};

export const ATTRIBUTE_1_WITH_ALIAS: VisualizationObject.IVisualizationAttribute = {
    visualizationAttribute: {
        ...ATTRIBUTE_1.visualizationAttribute,
        alias: 'My attribute alias'
    }
};

export const ATTRIBUTE_2: VisualizationObject.IVisualizationAttribute = {
    visualizationAttribute: {
        localIdentifier: 'a2',
        displayForm: {
            uri: '/gdc/md/storybook/obj/5.df'
        }
    }
};

export const ATTRIBUTE_3: VisualizationObject.IVisualizationAttribute = {
    visualizationAttribute: {
        localIdentifier: 'a3',
        displayForm: {
            uri: '/gdc/md/storybook/obj/6.df'
        }
    }
};

export const TOTAL_M1_A1: VisualizationObject.IVisualizationTotal = {
    measureIdentifier: MEASURE_1.measure.localIdentifier,
    type: 'sum',
    attributeIdentifier: ATTRIBUTE_1.visualizationAttribute.localIdentifier
};

export const TOTAL_M2_A1: VisualizationObject.IVisualizationTotal = {
    measureIdentifier: MEASURE_2.measure.localIdentifier,
    type: 'nat',
    attributeIdentifier: ATTRIBUTE_1.visualizationAttribute.localIdentifier
};

export const ATTRIBUTE_1_SORT_ITEM: AFM.IAttributeSortItem = {
    attributeSortItem: {
        direction: 'asc',
        attributeIdentifier: ATTRIBUTE_1.visualizationAttribute.localIdentifier
    }
};

export const MEASURE_2_SORT_ITEM: AFM.IMeasureSortItem = {
    measureSortItem: {
        direction: 'asc',
        locators: [{
            measureLocatorItem: {
                measureIdentifier: MEASURE_2.measure.localIdentifier
            }
        }]
    }
};
