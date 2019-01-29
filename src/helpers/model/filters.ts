// (C) 2018 GoodData Corporation
import { VisualizationObject } from '@gooddata/typings';
import { getQualifierObject } from './utils';

export const positiveAttributeFilter = (
    qualifier: string,
    inValues: string[]
): VisualizationObject.IVisualizationObjectPositiveAttributeFilter => ({
    positiveAttributeFilter: {
        displayForm: getQualifierObject(qualifier),
        in: inValues
    }
});

export const negativeAttributeFilter = (
    qualifier: string,
    notInValues: string[]
): VisualizationObject.IVisualizationObjectNegativeAttributeFilter => ({
    negativeAttributeFilter: {
        displayForm: getQualifierObject(qualifier),
        notIn: notInValues
    }
});

export const absoluteDateFilter = (
    dataSet: string,
    from?: string,
    to?: string
): VisualizationObject.IVisualizationObjectAbsoluteDateFilter => ({
    absoluteDateFilter: {
        dataSet: getQualifierObject(dataSet),
        from,
        to
    }
});

export const relativeDateFilter = (
    dataSet: string,
    granularity: string,
    from?: number,
    to?: number
): VisualizationObject.IVisualizationObjectRelativeDateFilter => ({
    relativeDateFilter: {
        dataSet: getQualifierObject(dataSet),
        granularity,
        from,
        to
    }
});
