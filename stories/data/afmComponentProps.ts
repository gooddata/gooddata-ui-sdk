import { AFM } from '@gooddata/typings';

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

const ATTRIBUTE: AFM.IAttribute = {
    localIdentifier: 'a1',
    displayForm: {
        uri: '/gdc/md/storybook/obj/4.df'
    }
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
                    type: 'avg',
                    attributeIdentifier: ATTRIBUTE.localIdentifier
                }
            ]
        },
        {
            itemIdentifiers: ['measureGroup']
        }
    ]
};
