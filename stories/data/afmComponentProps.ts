import { Afm, Transformation } from '@gooddata/data-layer';

const MEASURE_1: Afm.IMeasure = {
    id: 'm1',
    definition: {
        baseObject: {
            id: '/gdc/md/storybook/obj/1'
        }
    }
};

const MEASURE_2: Afm.IMeasure = {
    id: 'm2',
    definition: {
        baseObject: {
            id: '/gdc/md/storybook/obj/2'
        }
    }
};

const ATTRIBUTE_COLOURS: Afm.IAttribute = {
    id: '/gdc/md/storybook/obj/4.df',
    type: 'attribute'
};

export const TRANSFORMATION_ONE_MEASURE: Transformation.ITransformation = {
    measures: [{
        id: 'm1',
        title: 'My first measure'
    }]
};

export const TRANSFORMATION_TWO_MEASURES: Transformation.ITransformation = {
    measures: [{
        id: 'm1',
        title: 'My first measure'
    }, {
        id: 'm2',
        title: 'My second measure'
    }]
};

export const AFM_ONE_MEASURE_ONE_ATTRIBUTE: Afm.IAfm = {
    measures: [MEASURE_1],
    attributes: [ATTRIBUTE_COLOURS]
};

export const AFM_TWO_MEASURES: Afm.IAfm = {
    measures: [MEASURE_1, MEASURE_2],
};

export const AFM_TWO_MEASURES_ONE_ATTRIBUTE: Afm.IAfm = {
    measures: [MEASURE_1, MEASURE_2],
    attributes: [ATTRIBUTE_COLOURS]
};
