// (C) 2026 GoodData Corporation

import { useCallback, useMemo, useRef } from "react";

import type { IExecutionResult } from "@gooddata/sdk-backend-spi";
import { type IInsight, type IWidget, serializeObjRef } from "@gooddata/sdk-model";

import {
    createAlert as createAlertCmd,
    saveAlert as saveAlertCmd,
} from "../../../../model/commands/alerts.js";
import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import { selectExecutionResultEntities } from "../../../../model/store/executionResults/executionResultsSelectors.js";
import {
    selectAutomationCommonDateFilterId,
    selectAutomationDefaultSelectedFilters,
    selectDashboardHiddenFilters,
} from "../../../../model/store/filtering/dashboardFilterSelectors.js";
import { selectDashboardId, selectEvaluationFrequency } from "../../../../model/store/meta/metaSelectors.js";
import { selectWidgetLocalIdToTabIdMap } from "../../../../model/store/tabs/layout/layoutSelectors.js";
import { selectAutomationParameterValuesForWidget } from "../../../../model/store/tabs/parameters/parametersSelectors.js";
import { getWidgetTitle } from "../../../../model/utils/dashboardItemUtils.js";
import type { IAlertingDialogContextValue } from "../../contexts/AlertingDialogContext.js";

import { useCommandAsPromise, useDeleteAutomation } from "./useCommandAsPromise.js";

export interface IUseBuildAlertingDialogContextOpts {
    mode: "create" | "edit";
    widget?: IWidget;
    insight?: IInsight;
}

export function useBuildAlertingDialogContext(
    opts: IUseBuildAlertingDialogContextOpts,
): IAlertingDialogContextValue {
    const { mode, widget, insight } = opts;

    const dashboardFilters = useDashboardSelector(selectAutomationDefaultSelectedFilters);
    const hiddenFilters = useDashboardSelector(selectDashboardHiddenFilters);
    const dashboardId = useDashboardSelector(selectDashboardId);
    const widgetLocalIdToTabIdMap = useDashboardSelector(selectWidgetLocalIdToTabIdMap);
    const executionResultEntities = useDashboardSelector(selectExecutionResultEntities);
    const commonDateFilterId = useDashboardSelector(selectAutomationCommonDateFilterId);
    const dashboardEvaluationFrequency = useDashboardSelector(selectEvaluationFrequency);
    const parameterValues = useDashboardSelector(selectAutomationParameterValuesForWidget(widget?.ref));

    const widgetTitle = useMemo(() => {
        if (widget) {
            return getWidgetTitle(widget);
        }
        return undefined;
    }, [widget]);

    // Keep a ref so the callback below is stable and doesn't cause alertingCtx to
    // change on every execution result arrival (which would reset the Overlay alignment timer).
    const executionResultEntitiesRef = useRef(executionResultEntities);
    executionResultEntitiesRef.current = executionResultEntities;

    const executionResultByRef = useCallback(
        (
            ref: Parameters<IAlertingDialogContextValue["executionResultByRef"]>[0],
        ): { executionResult?: IExecutionResult } | undefined => {
            if (!ref) {
                return undefined;
            }
            const key = serializeObjRef(ref);
            // Return the store envelope directly. Allocating a fresh wrapper object here
            // would give a new reference on every render, making the consumer's
            // useAttributeValuesFromExecResults useEffect([execResult]) re-fire each render
            // (readAll -> setState -> re-render -> ...), an infinite loop that keeps the
            // alerting dialog Overlay from ever stabilizing (it stays hidden).
            return executionResultEntitiesRef.current[key];
        },
        [],
    );

    const createAlert = useCommandAsPromise({
        commandCreator: createAlertCmd,
        successEvent: "GDC.DASH/EVT.ALERT.CREATED",
        resolveWith: (event) => event.payload.alert,
    });

    const saveAlert = useCommandAsPromise({
        commandCreator: saveAlertCmd,
        successEvent: "GDC.DASH/EVT.ALERT.SAVED",
        resolveWith: (event) => event.payload.alert,
    });

    const deleteAlert = useDeleteAutomation();

    return useMemo(
        () => ({
            mode,
            widget,
            insight,
            widgetTitle,
            dashboardId,
            dashboardFilters,
            hiddenFilters,
            widgetLocalIdToTabIdMap,
            executionResultByRef,
            parameterValues,
            commonDateFilterId,
            dashboardEvaluationFrequency,
            createAlert,
            saveAlert,
            deleteAlert,
        }),
        [
            mode,
            widget,
            insight,
            widgetTitle,
            dashboardId,
            dashboardFilters,
            hiddenFilters,
            widgetLocalIdToTabIdMap,
            executionResultByRef,
            parameterValues,
            commonDateFilterId,
            dashboardEvaluationFrequency,
            createAlert,
            saveAlert,
            deleteAlert,
        ],
    );
}
