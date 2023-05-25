// (C) 2022 GoodData Corporation
import { useCallback } from "react";
import { IInsight, IInsightWidget, insightVisualizationType, widgetRef } from "@gooddata/sdk-model";
import { IPushData } from "@gooddata/sdk-ui";

import {
    useDashboardDispatch,
    useDashboardSelector,
    selectIsInEditMode,
    changeInsightWidgetVisProperties,
} from "../../../../../model/index.js";

function isSupportedWidgetProperties(properties: IPushData["properties"]): boolean {
    // currently we only support the columnWidths for pivot tables
    // this should be ideally driven by the PlugVis API, not hardcoded here
    return !!(properties?.controls as any)?.columnWidths;
}

export function useHandlePropertiesPushData(widget: IInsightWidget, insight: IInsight) {
    const ref = widgetRef(widget);

    const dispatch = useDashboardDispatch();
    const isInEditMode = useDashboardSelector(selectIsInEditMode);

    const visType = insightVisualizationType(insight);

    return useCallback(
        (data: IPushData): void => {
            // propagate properties from push data only for pivot tables (this is how gdc-dashboard does it)
            if (isInEditMode && isSupportedWidgetProperties(data.properties) && visType === "table") {
                dispatch(changeInsightWidgetVisProperties(ref, data.properties));
            }
        },
        [dispatch, ref, visType, isInEditMode],
    );
}
