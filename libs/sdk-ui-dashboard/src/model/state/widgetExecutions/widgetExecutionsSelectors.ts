// (C) 2021 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { areObjRefsEqual, ObjRef, serializeObjRef } from "@gooddata/sdk-model";
import { isInsightWidget } from "@gooddata/sdk-backend-spi";

import { DashboardState } from "../types";
import { createMemoizedSelector } from "../_infra/selectors";
import { widgetExecutionsAdapter } from "./widgetExecutionsEntityAdapter";
import { IWidgetExecution } from "./types";
import { selectWidgetByRef } from "../layout/layoutSelectors";
import { isNonExportableError } from "../../../_staging/errors/errorPredicates";
import { selectPermissions } from "../permissions/permissionsSelectors";
import { selectSettings } from "../config/configSelectors";
import { DRILL_MODAL_EXECUTION_PSEUDO_REF } from "./constants";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state._widgetExecutions,
);

const adapterSelectors = widgetExecutionsAdapter.getSelectors(selectSelf);

const selectWidgetExecutionEntities = adapterSelectors.selectEntities;

/**
 * @internal
 */
export const selectWidgetExecutionByWidgetRef = createMemoizedSelector((ref: ObjRef) =>
    createSelector(selectWidgetExecutionEntities, (widgetExecutions): IWidgetExecution | undefined => {
        const key = serializeObjRef(ref);
        return widgetExecutions[key];
    }),
);

/**
 * @internal
 */
export const selectWidgetIsReadyForExportByWidgetRef = createMemoizedSelector((ref: ObjRef) =>
    createSelector(
        selectWidgetExecutionByWidgetRef(ref),
        selectWidgetByRef(ref),
        (widgetExecution, widget): boolean => {
            if (
                !(isInsightWidget(widget) || areObjRefsEqual(ref, DRILL_MODAL_EXECUTION_PSEUDO_REF)) ||
                !widgetExecution
            ) {
                return false;
            }

            const { isLoading, error, executionResult } = widgetExecution;
            return !!executionResult && !isLoading && !isNonExportableError(error);
        },
    ),
);

/**
 * @internal
 */
export const selectWidgetIsExportableToCsvByWidgetRef = createMemoizedSelector((ref: ObjRef) =>
    createSelector(
        selectWidgetIsReadyForExportByWidgetRef(ref),
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
 * @internal
 */
export const selectWidgetIsExportableToXlsxByWidgetRef = createMemoizedSelector((ref: ObjRef) =>
    createSelector(
        selectWidgetIsReadyForExportByWidgetRef(ref),
        selectPermissions,
        selectSettings,
        (isReadyForExport, permissions, settings): boolean => {
            const isExportEnabled = Boolean(settings.enableKPIDashboardExport && permissions.canExportReport);
            return isReadyForExport && isExportEnabled;
        },
    ),
);
