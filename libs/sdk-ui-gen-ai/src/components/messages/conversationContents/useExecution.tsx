// (C) 2024-2026 GoodData Corporation

import { useMemo } from "react";

import { type IChatVisualisationDefinition } from "@gooddata/sdk-backend-spi";
import {
    type IAttribute,
    type IFilter,
    type IMeasure,
    type IMeasureDefinition,
    type ISortItem,
} from "@gooddata/sdk-model";

export interface IExecution {
    vis?: IChatVisualisationDefinition;
    metrics: IMeasure<IMeasureDefinition>[];
    dimensions: IAttribute[];
    filters: IFilter[];
    sorts: ISortItem[];
}

export const useExecution = (vis?: IChatVisualisationDefinition): IExecution => {
    return useMemo(() => {
        //TODO: s.hacker Visualisation
        return {
            vis,
            metrics: [],
            dimensions: [],
            filters: [],
            sorts: [],
        };
    }, [vis]);
};
