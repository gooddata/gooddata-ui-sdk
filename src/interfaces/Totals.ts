import { VisualizationObject } from '@gooddata/typings';

export interface IIndexedTotalItem {
    alias?: string;
    type: VisualizationObject.TotalType;
    outputMeasureIndexes: number[];
}
