// (C) 2022-2026 GoodData Corporation

import { useCallback } from "react";

import { type IInsight, type IInsightWidget, insightVisualizationType, widgetRef } from "@gooddata/sdk-model";
import { type IPushData } from "@gooddata/sdk-ui";

import { changeInsightWidgetVisProperties } from "../../../../../model/commands/insight.js";
import {
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../../model/react/DashboardStoreProvider.js";
import { selectSettings } from "../../../../../model/store/config/configSelectors.js";
import { selectIsInEditMode } from "../../../../../model/store/renderMode/renderModeSelectors.js";

/**
 * Exported for direct unit testing - the surrounding hook needs a full dashboard store to render.
 * @internal
 */
export function isSupportedWidgetProperties(
    properties: IPushData["properties"],
    isInEditMode: boolean,
    enableNewPivotTable: boolean,
): boolean {
    // currently we only support the columnWidths, textWrapping and totals (rename/reset of an
    // existing total's alias - see PluggablePivotTableNext.persistTotalsOverride) for pivot tables
    // this should be ideally driven by the PlugVis API, not hardcoded here
    const controls = properties?.controls as any;

    const hasColumnWidths = !!controls?.columnWidths;
    const hasTextWrapping = !!controls?.textWrapping;
    const hasTotals = !!controls?.totals;

    if (enableNewPivotTable) {
        return hasColumnWidths || hasTextWrapping || hasTotals;
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
