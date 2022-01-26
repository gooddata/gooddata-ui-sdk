// (C) 2021 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { ObjRef, serializeObjRef } from "@gooddata/sdk-model";

import { DashboardState } from "../types";
import { createMemoizedSelector } from "../_infra/selectors";
import { executionResultsAdapter } from "./executionResultsEntityAdapter";
import { IExecutionResultEnvelope } from "./types";
import { selectAnalyticalWidgetByRef } from "../layout/layoutSelectors";
import { isNonExportableError } from "../../../_staging/errors/errorPredicates";
import { selectPermissions } from "../permissions/permissionsSelectors";
import { selectSettings } from "../config/configSelectors";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.executionResults,
);

const adapterSelectors = executionResultsAdapter.getSelectors(selectSelf);

const selectExecutionResultEntities = adapterSelectors.selectEntities;

/**
 * @alpha
 */
export const selectExecutionResult = adapterSelectors.selectById;

/**
 * @alpha
 */
export const selectExecutionResultByRef = createMemoizedSelector((ref: ObjRef) =>
    createSelector(
        selectExecutionResultEntities,
        (executionResults): IExecutionResultEnvelope | undefined => {
            const key = serializeObjRef(ref);
            return executionResults[key];
        },
    ),
);

/**
 * @alpha
 */
export const selectIsExecutionResultReadyForExportByRef = createMemoizedSelector((ref: ObjRef) =>
    createSelector(
        selectExecutionResultByRef(ref),
        selectAnalyticalWidgetByRef(ref),
        (widgetExecution): boolean => {
            if (!widgetExecution) {
                return false;
            }

            const { isLoading, error, executionResult } = widgetExecution;
            return !!executionResult && !isLoading && !isNonExportableError(error);
        },
    ),
);

/**
 * @alpha
 */
export const selectIsExecutionResultExportableToCsvByRef = createMemoizedSelector((ref: ObjRef) =>
    createSelector(
        selectIsExecutionResultReadyForExportByRef(ref),
        selectPermissions,
        selectSettings,
        (isReadyForExport, permissions, settings): boolean => {
            const isExportEnabled = Boolean(settings.enableKPIDashboardExport && permissions.canExportReport);
            const isRawExportEnabled = Boolean(isExportEnabled && permissions.canExecuteRaw);
            return isReadyForExport && isRawExportEnabled;
        },
    ),
);

/**
 * @alpha
 */
export const selectIsExecutionResultExportableToXlsxByRef = createMemoizedSelector((ref: ObjRef) =>
    createSelector(
        selectIsExecutionResultReadyForExportByRef(ref),
        selectPermissions,
        selectSettings,
        (isReadyForExport, permissions, settings): boolean => {
            const isExportEnabled = Boolean(settings.enableKPIDashboardExport && permissions.canExportReport);
            return isReadyForExport && isExportEnabled;
        },
    ),
);
