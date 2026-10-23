// (C) 2021-2026 GoodData Corporation

import { useCallback } from "react";

import { type IMeasureMetadataObject } from "@gooddata/sdk-model";

import { type ITab } from "../../../shared/Tabs/Tab.js";
import { type ISaveMetricInfo } from "../../metric/saveInfo.js";
import { type IMetricInfo } from "../metricState.data.js";

export const useOnSaveCallback = (
    tab: ITab<IMetricInfo>,
    onSave?: (
        tab: ITab<IMetricInfo>,
        metric: IMeasureMetadataObject,
        info: ISaveMetricInfo,
        err: Error | null,
    ) => Promise<void> | void,
): ((metric: IMeasureMetadataObject, info: ISaveMetricInfo, err: Error | null) => void) => {
    return useCallback(
        (metric: IMeasureMetadataObject, info: ISaveMetricInfo, err: Error | null) => {
            if (onSave) {
                onSave(tab, metric, info, err);
            }
        },
        [onSave, tab],
    );
};
