// (C) 2021-2026 GoodData Corporation

import { useCallback } from "react";

import { type IMeasureMetadataObject } from "@gooddata/sdk-model";

import { type ITab } from "../../../shared/Tabs/Tab.js";
import { type IMetricInfo } from "../metricState.data.js";

export const useOnDeleteCallback = (
    tab: ITab<IMetricInfo>,
    onDelete?: (tab: ITab<IMetricInfo>, metric: IMeasureMetadataObject) => void,
): ((metric: IMeasureMetadataObject) => void) => {
    return useCallback(
        (metric: IMeasureMetadataObject) => {
            if (onDelete) {
                onDelete(tab, metric);
            }
        },
        [onDelete, tab],
    );
};
