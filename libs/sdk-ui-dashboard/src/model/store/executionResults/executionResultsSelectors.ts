// (C) 2021-2025 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import { ObjRef, serializeObjRef } from "@gooddata/sdk-model";

import { executionResultsAdapter } from "./executionResultsEntityAdapter.js";
import { IExecutionResultEnvelope } from "./types.js";
import {
    isNonExportableError,
    isNonExportableErrorExceptTooLarge,
} from "../../../_staging/errors/errorPredicates.js";
import { createMemoizedSelector } from "../_infra/selectors.js";
import {
    selectSupportsExportToCsv,
    selectSupportsExportToXlsx,
} from "../backendCapabilities/backendCapabilitiesSelectors.js";
import { selectSettings } from "../config/configSelectors.js";
import { selectCanExecuteRaw, selectCanExportTabular } from "../permissions/permissionsSelectors.js";
import { selectAnalyticalWidgetByRef } from "../tabs/layout/layoutSelectors.js";
import { DashboardSelector, DashboardState } from "../types.js";

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
export const selectHasSomeExecutionResult: DashboardSelector<boolean> = createSelector(
    selectExecutionResultEntities,
    (executionResults): boolean => {
        // Empty results can be resolved as error, so consider error also as resolved
        return Object.values(executionResults).filter((e) => !!e?.executionResult || !!e?.error).length >= 1;
    },
);

/**
 * @alpha
 */
export const selectExecutionResultByRef: (
    ref: ObjRef | undefined,
) => DashboardSelector<IExecutionResultEnvelope | undefined> = createMemoizedSelector(
    (ref: ObjRef | undefined) =>
        createSelector(
            selectExecutionResultEntities,
            (executionResults): IExecutionResultEnvelope | undefined => {
                if (!ref) {
                    return undefined;
                }
                const key = serializeObjRef(ref);
                return executionResults[key];
            },
        ),
);

/**
 * @alpha
 */
export const selectIsExecutionResultReadyForExportByRef: (ref: ObjRef) => DashboardSelector<boolean> =
    createMemoizedSelector((ref: ObjRef) =>
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
export const selectIsExecutionResultExportableToCsvByRef: (ref: ObjRef) => DashboardSelector<boolean> =
    createMemoizedSelector((ref: ObjRef) =>
        createSelector(
            selectSupportsExportToCsv,
            selectIsExecutionResultReadyForExportByRef(ref),
            selectCanExportTabular,
            selectCanExecuteRaw,
            selectSettings,
            (supportsCapabilityCsv, isReadyForExport, canExportTabular, canExecuteRaw, settings): boolean => {
                const isExportEnabled = Boolean(settings["enableKPIDashboardExport"] && canExportTabular);
                const isRawExportEnabled = Boolean(isExportEnabled && canExecuteRaw);
                return supportsCapabilityCsv && isReadyForExport && isRawExportEnabled;
            },
        ),
    );

/**
 * @alpha
 */
export const selectIsExecutionResultExportableToXlsxByRef: (ref: ObjRef) => DashboardSelector<boolean> =
    createMemoizedSelector((ref: ObjRef) =>
        createSelector(
            selectSupportsExportToXlsx,
            selectIsExecutionResultReadyForExportByRef(ref),
            selectCanExportTabular,
            selectSettings,
            (supportCapabilityXlsx, isReadyForExport, canExportTabular, settings): boolean => {
                const isExportEnabled = Boolean(settings["enableKPIDashboardExport"] && canExportTabular);
                return supportCapabilityXlsx && isReadyForExport && isExportEnabled;
            },
        ),
    );

/**
 * @alpha
 */
export const selectIsExecutionResultExportableToPdfByRef: (ref: ObjRef) => DashboardSelector<boolean> =
    createMemoizedSelector((ref: ObjRef) =>
        createSelector(
            selectIsExecutionResultReadyForExportByRef(ref),
            selectCanExportTabular,
            selectSettings,
            (isReadyForExport, canExportTabular, settings): boolean => {
                const isExportEnabled = Boolean(settings["enableKPIDashboardExport"] && canExportTabular);
                const isPdfExportEnabled = Boolean(settings.enableNewPdfTabularExport);
                return isReadyForExport && isExportEnabled && isPdfExportEnabled;
            },
        ),
    );

/**
 * @alpha
 */
export const selectIsExecutionResultReadyForExportRawByRef: (ref: ObjRef) => DashboardSelector<boolean> =
    createMemoizedSelector((ref: ObjRef) =>
        createSelector(
            selectExecutionResultByRef(ref),
            selectAnalyticalWidgetByRef(ref),
            (widgetExecution): boolean => {
                if (!widgetExecution) {
                    return false;
                }
                const { isLoading, error } = widgetExecution;
                return !isLoading && !isNonExportableErrorExceptTooLarge(error);
            },
        ),
    );

/**
 * @alpha
 */
export const selectIsExecutionResultExportableToCsvRawByRef: (ref: ObjRef) => DashboardSelector<boolean> =
    createMemoizedSelector((ref: ObjRef) =>
        createSelector(
            selectSupportsExportToCsv,
            selectIsExecutionResultReadyForExportRawByRef(ref),
            selectCanExportTabular,
            selectCanExecuteRaw,
            selectSettings,
            (supportsCapabilityCsv, isReadyForExport, canExportTabular, canExecuteRaw, settings): boolean => {
                const isExportEnabled = Boolean(settings["enableKPIDashboardExport"] && canExportTabular);
                const isRawExportEnabled = Boolean(isExportEnabled && canExecuteRaw);
                return supportsCapabilityCsv && isReadyForExport && isRawExportEnabled;
            },
        ),
    );
