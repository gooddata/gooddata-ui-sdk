// (C) 2021-2023 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { ObjRef, serializeObjRef } from "@gooddata/sdk-model";

import { DashboardSelector, DashboardState } from "../types.js";
import { createMemoizedSelector } from "../_infra/selectors.js";
import { executionResultsAdapter } from "./executionResultsEntityAdapter.js";
import { IExecutionResultEnvelope } from "./types.js";
import { selectAnalyticalWidgetByRef } from "../layout/layoutSelectors.js";
import { isNonExportableError } from "../../../_staging/errors/errorPredicates.js";
import { selectCanExportTabular, selectCanExecuteRaw } from "../permissions/permissionsSelectors.js";
import { selectSettings } from "../config/configSelectors.js";
import {
    selectSupportsExportToXlsx,
    selectSupportsExportToCsv,
} from "../backendCapabilities/backendCapabilitiesSelectors.js";

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
export const selectExecutionResultByRef: (
    ref: ObjRef,
) => DashboardSelector<IExecutionResultEnvelope | undefined> = createMemoizedSelector((ref: ObjRef) =>
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
                const isExportEnabled = Boolean(settings.enableKPIDashboardExport && canExportTabular);
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
                const isExportEnabled = Boolean(settings.enableKPIDashboardExport && canExportTabular);
                return supportCapabilityXlsx && isReadyForExport && isExportEnabled;
            },
        ),
    );
