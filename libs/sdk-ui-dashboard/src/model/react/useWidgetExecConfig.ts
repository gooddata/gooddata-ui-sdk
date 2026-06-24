// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { type IExecutionConfig, type IInsightDefinition, type ObjRef } from "@gooddata/sdk-model";

import { resolveEffectiveParameterValuesForInsight } from "../store/tabs/parameters/parametersHelpers.js";
import { selectWidgetParameterContext } from "../store/tabs/parameters/parametersSelectors.js";
import { selectExecutionTimestamp } from "../store/ui/uiSelectors.js";

import { useDashboardSelector } from "./DashboardStoreProvider.js";

/**
 * Single shared source of a widget's insight execution config, so the dashboard insight and its
 * drill overlay execute consistently instead of each duplicating (and drifting) the logic.
 *
 * @param ref - source widget whose tab provides the parameter overrides
 * @param insight - the insight being executed (the drill target, not `ref`'s own insight); its metrics
 *   decide which parameters apply
 * @internal
 */
export function useWidgetExecConfig(ref: ObjRef, insight: IInsightDefinition): IExecutionConfig {
    const executionTimestamp = useDashboardSelector(selectExecutionTimestamp);
    const parameterContext = useDashboardSelector(selectWidgetParameterContext(ref));
    const parameterValues = useMemo(
        () => resolveEffectiveParameterValuesForInsight(parameterContext, insight),
        [parameterContext, insight],
    );
    return useMemo(
        () => ({
            timestamp: executionTimestamp,
            // omit when empty so it does not bust the execution's defFingerprint
            ...(parameterValues.length > 0 ? { parameterValues } : {}),
        }),
        [executionTimestamp, parameterValues],
    );
}
