// (C) 2024-2026 GoodData Corporation

import { useMemo } from "react";

import { type IChatConversationVisualisationContent } from "@gooddata/sdk-backend-spi";
import { type IBucket, type IFilter, type ISortItem } from "@gooddata/sdk-model";

export interface IExecution {
    buckets: IBucket[];
    filters: IFilter[];
    sorts: ISortItem[];
}

export const useExecution = (
    visualisation?: IChatConversationVisualisationContent["visualization"],
): IExecution => {
    return useMemo(() => {
        if (!visualisation) {
            return {
                buckets: [],
                filters: [],
                sorts: [],
            };
        }
        return {
            buckets: visualisation.insight.buckets,
            filters: visualisation.insight.filters,
            sorts: visualisation.insight.sorts,
        };
    }, [visualisation]);
};
