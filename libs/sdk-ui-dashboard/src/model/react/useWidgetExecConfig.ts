// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { type IExecutionConfig, type ObjRef } from "@gooddata/sdk-model";

import { selectEffectiveParameterValuesForWidget } from "../store/tabs/parameters/parametersSelectors.js";
import { selectExecutionTimestamp } from "../store/ui/uiSelectors.js";

import { useDashboardSelector } from "./DashboardStoreProvider.js";

/**
 * Single shared source of a widget's insight execution config, so the dashboard insight and its
 * drill overlay execute consistently instead of each duplicating (and drifting) the logic.
 *
 * @param ref - ref of the source widget whose parameter values to resolve
 * @internal
 */
export function useWidgetExecConfig(ref: ObjRef): IExecutionConfig {
    const executionTimestamp = useDashboardSelector(selectExecutionTimestamp);
    const parameterValues = useDashboardSelector(selectEffectiveParameterValuesForWidget(ref));
    return useMemo(
        () => ({
            timestamp: executionTimestamp,
            // omit when empty so it does not bust the execution's defFingerprint
            ...(parameterValues.length > 0 ? { parameterValues } : {}),
        }),
        [executionTimestamp, parameterValues],
    );
}
