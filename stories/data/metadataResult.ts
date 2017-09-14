import { VisualizationObject } from '@gooddata/data-layer';
import { VisType } from '../../src/components/afm/SimpleDataAdapterProvider';

function getMeasure1(withIdentifiers: boolean): VisualizationObject.IMeasure {
    return {
        measure: {
            measureFilters: [],
            objectUri: withIdentifiers ? '1' : '/gdc/md/storybook/obj/1',
            showInPercent: false,
            showPoP: false,
            title: 'My first measure',
            type: 'metric'
        }
    };
}

function getMeasure2(withIdentifiers: boolean): VisualizationObject.IMeasure {
    return {
        measure: {
            measureFilters: [],
            objectUri: withIdentifiers ? '2' : '/gdc/md/storybook/obj/2',
            showInPercent: false,
            showPoP: false,
            title: 'My second measure',
            type: 'metric'
        }
    };
}

function getCategory(): VisualizationObject.ICategory {
    return {
        category: {
            type: 'attribute',
            collection: 'attribute',
            displayForm: '/gdc/md/storybook/obj/3.df'
        }
    };
}

export function getMdResultWithTwoMeasures(visualizationType: VisType, withIdentifiers: boolean = false)
    : VisualizationObject.IVisualizationObject {

    return {
        content: {
            type: visualizationType,
            buckets: {
                measures: [getMeasure1(withIdentifiers), getMeasure2(withIdentifiers)],
                categories: [],
                filters: []
            }
        },
        meta: {
            title: 'Metadata result with two measures'
        }
    };
}

export function getMdResultWithOneMeasureAndOneAttribute(visualizationType: VisType, withIdentifiers: boolean = false)
    : VisualizationObject.IVisualizationObject {

    return {
        content: {
            type: visualizationType,
            buckets: {
                measures: [getMeasure1(withIdentifiers)],
                categories: [getCategory()],
                filters: []
            }
        },
        meta: {
            title: 'Metadata result with one measure and one attribute'
        }
    };
}

export function getMdResultWithTwoMeasuresAndOneAttribute(visualizationType: VisType, withIdentifiers: boolean = false)
    : VisualizationObject.IVisualizationObject {

    return {
        content: {
            type: visualizationType,
            buckets: {
                measures: [getMeasure1(withIdentifiers), getMeasure2(withIdentifiers)],
                categories: [getCategory()],
                filters: []
            }
        },
        meta: {
            title: 'Metadata result with two measures and one attribute'
        }
    };
}
