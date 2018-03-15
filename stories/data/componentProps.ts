import { VisualizationObject } from '@gooddata/typings';

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

export const MEASURE_1_WITH_ALIAS: VisualizationObject.IMeasure = {
    measure: {
        ...MEASURE_1.measure,
        alias: 'My measure alias'
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

export const ATTRIBUTE_1: VisualizationObject.IVisualizationAttribute = {
    visualizationAttribute: {
        localIdentifier: 'a1',
        displayForm: {
            uri: '/gdc/md/storybook/obj/4.df'
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
