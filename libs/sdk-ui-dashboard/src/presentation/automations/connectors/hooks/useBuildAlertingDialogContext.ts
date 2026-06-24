// (C) 2026 GoodData Corporation

import { useCallback, useMemo, useRef } from "react";

import type { IExecutionResult } from "@gooddata/sdk-backend-spi";
import {
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type IInsight,
    type IWidget,
    serializeObjRef,
} from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { createAlert, saveAlert } from "../../../../model/commands/alerts.js";
import type { IDashboardAlertSaved } from "../../../../model/events/alerts.js";
import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import { useDashboardCommandProcessing } from "../../../../model/react/useDashboardCommandProcessing.js";
import { selectExecutionResultEntities } from "../../../../model/store/executionResults/executionResultsSelectors.js";
import {
    selectAutomationCommonDateFilterId,
    selectAutomationDefaultSelectedFilters,
    selectDashboardHiddenFilters,
} from "../../../../model/store/filtering/dashboardFilterSelectors.js";
import { selectDashboardId, selectEvaluationFrequency } from "../../../../model/store/meta/metaSelectors.js";
import { selectWidgetLocalIdToTabIdMap } from "../../../../model/store/tabs/layout/layoutSelectors.js";
import { selectEffectiveParameterValuesForWidget } from "../../../../model/store/tabs/parameters/parametersSelectors.js";
import { getWidgetTitle } from "../../../../model/utils/dashboardItemUtils.js";
import type { IAlertingDialogContextValue } from "../../contexts/AlertingDialogContext.js";

import { sanitizeAutomationForSave } from "./sanitizeAutomationForSave.js";

export interface IUseBuildAlertingDialogContextOpts {
    mode: "create" | "edit";
    widget?: IWidget;
    insight?: IInsight;
}

export function useBuildAlertingDialogContext(
    opts: IUseBuildAlertingDialogContextOpts,
): IAlertingDialogContextValue {
    const { mode, widget, insight } = opts;

    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    const dashboardFilters = useDashboardSelector(selectAutomationDefaultSelectedFilters);
    const hiddenFilters = useDashboardSelector(selectDashboardHiddenFilters);
    const dashboardId = useDashboardSelector(selectDashboardId);
    const widgetLocalIdToTabIdMap = useDashboardSelector(selectWidgetLocalIdToTabIdMap);
    const executionResultEntities = useDashboardSelector(selectExecutionResultEntities);
    const commonDateFilterId = useDashboardSelector(selectAutomationCommonDateFilterId);
    const dashboardEvaluationFrequency = useDashboardSelector(selectEvaluationFrequency);
    const parameterValues = useDashboardSelector(selectEffectiveParameterValuesForWidget(widget?.ref));

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

    const createPendingRef = useRef<{
        resolve: (a: IAutomationMetadataObject) => void;
        reject: (e: Error) => void;
    } | null>(null);

    const { run: runCreate } = useDashboardCommandProcessing({
        commandCreator: createAlert,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.ALERT.CREATED",
        onSuccess: (event) => {
            createPendingRef.current?.resolve(event.payload.alert);
            createPendingRef.current = null;
        },
        onError: (event) => {
            const error = event.payload.error ?? new Error(event.payload.message);
            createPendingRef.current?.reject(error);
            createPendingRef.current = null;
        },
    });

    const createAlertFn = useCallback(
        (alert: IAutomationMetadataObjectDefinition): Promise<IAutomationMetadataObject> => {
            return new Promise<IAutomationMetadataObject>((resolve, reject) => {
                createPendingRef.current = { resolve, reject };
                runCreate(sanitizeAutomationForSave(alert));
            });
        },
        [runCreate],
    );

    const savePendingRef = useRef<{
        resolve: (a: IAutomationMetadataObject) => void;
        reject: (e: Error) => void;
    } | null>(null);

    const { run: runSave } = useDashboardCommandProcessing({
        commandCreator: saveAlert,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.ALERT.SAVED",
        onSuccess: (event: IDashboardAlertSaved) => {
            savePendingRef.current?.resolve(event.payload.alert);
            savePendingRef.current = null;
        },
        onError: (event) => {
            const error = event.payload.error ?? new Error(event.payload.message);
            savePendingRef.current?.reject(error);
            savePendingRef.current = null;
        },
    });

    const saveAlertFn = useCallback(
        (alert: IAutomationMetadataObject): Promise<IAutomationMetadataObject> => {
            return new Promise<IAutomationMetadataObject>((resolve, reject) => {
                savePendingRef.current = { resolve, reject };
                runSave(sanitizeAutomationForSave(alert));
            });
        },
        [runSave],
    );

    const deleteAlertFn = useCallback(
        async (alert: IAutomationMetadataObject): Promise<void> => {
            const automationService = backend.workspace(workspace).automations();
            await automationService.deleteAutomation(alert.id);
        },
        [backend, workspace],
    );

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
            createAlert: createAlertFn,
            saveAlert: saveAlertFn,
            deleteAlert: deleteAlertFn,
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
            createAlertFn,
            saveAlertFn,
            deleteAlertFn,
        ],
    );
}
