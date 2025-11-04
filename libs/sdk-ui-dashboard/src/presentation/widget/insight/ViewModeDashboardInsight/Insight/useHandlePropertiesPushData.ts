// (C) 2022-2025 GoodData Corporation

import { useCallback } from "react";

import { IInsight, IInsightWidget, insightVisualizationType, widgetRef } from "@gooddata/sdk-model";
import { IPushData } from "@gooddata/sdk-ui";

import {
    changeInsightWidgetVisProperties,
    selectIsInEditMode,
    selectSettings,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../../model/index.js";

function isSupportedWidgetProperties(
    properties: IPushData["properties"],
    isInEditMode: boolean,
    enableNewPivotTable: boolean,
): boolean {
    // currently we only support the columnWidths and textWrapping for pivot tables
    // this should be ideally driven by the PlugVis API, not hardcoded here
    const controls = properties?.controls as any;

    const hasColumnWidths = !!controls?.columnWidths;
    const hasTextWrapping = !!controls?.textWrapping;

    if (enableNewPivotTable) {
        return hasColumnWidths || hasTextWrapping;
    }

    if (isInEditMode) {
        return hasColumnWidths;
    }

    return false;
}

export function useHandlePropertiesPushData(widget: IInsightWidget, insight: IInsight) {
    const ref = widgetRef(widget);

    const dispatch = useDashboardDispatch();
    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const settings = useDashboardSelector(selectSettings);
    const enableNewPivotTable = settings?.enableNewPivotTable ?? true;

    const visType = insightVisualizationType(insight);

    return useCallback(
        (data: IPushData): void => {
            // propagate properties from push data only for pivot tables (this is how gdc-dashboard does it)
            if (
                isSupportedWidgetProperties(data.properties, isInEditMode, enableNewPivotTable) &&
                visType === "table"
            ) {
                dispatch(changeInsightWidgetVisProperties(ref, data.properties));
            }
        },
        [dispatch, ref, visType, isInEditMode, enableNewPivotTable],
    );
}
