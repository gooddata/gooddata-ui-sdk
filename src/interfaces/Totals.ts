// (C) 2007-2018 GoodData Corporation
import { VisualizationObject, Execution } from "@gooddata/typings";

export interface IIndexedTotalItem {
    alias?: string;
    type: VisualizationObject.TotalType;
    outputMeasureIndexes: number[];
}

export interface ITotalWithData extends IIndexedTotalItem {
    values: Execution.DataValue[];
}
