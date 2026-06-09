// (C) 2021-2026 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import { type IExecutionResultLimitBreak, type ObjRef, serializeObjRef } from "@gooddata/sdk-model";

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
import { type DashboardSelector, type DashboardState } from "../types.js";

import { executionResultsAdapter } from "./executionResultsEntityAdapter.js";
import { type IExecutionResultEnvelope } from "./types.js";

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
 * Selects the execution result limit breaks for the widget with the given ref.
 *
 * @remarks
 * Limit breaks indicate that the widget's execution hit a row/column/cell limit and only partial
 * data was returned. Returns an empty array when there are no limit breaks or the result is not available.
 *
 * @alpha
 */
export const selectExecutionResultLimitBreaksByRef: (
    ref: ObjRef | undefined,
) => DashboardSelector<IExecutionResultLimitBreak[]> = createMemoizedSelector((ref: ObjRef | undefined) =>
    createSelector(
        selectExecutionResultByRef(ref),
        (widgetExecution): IExecutionResultLimitBreak[] => widgetExecution?.limitBreaks ?? [],
    ),
);

/**
 * Selects whether the widget with the given ref returned partial data because an execution limit was reached.
 *
 * @alpha
 */
export const selectHasExecutionResultLimitBreaksByRef: (
    ref: ObjRef | undefined,
) => DashboardSelector<boolean> = createMemoizedSelector((ref: ObjRef | undefined) =>
    createSelector(
        selectExecutionResultLimitBreaksByRef(ref),
        (limitBreaks): boolean => limitBreaks.length > 0,
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
