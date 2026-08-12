// (C) 2026 GoodData Corporation

import { createContext, useContext } from "react";

import { missingAlertStateProvider } from "./missingAlertStateProvider.js";
import { type useAlertFiltersModel } from "./useAlertFiltersModel.js";
import { type useAlertFormState } from "./useAlertFormState.js";

/**
 * The alerting dialog's filter and export-parameter model: the current selection, the available
 * filters, the two filter mutators and the staleness flags, plus the automation's execution
 * parameters and their mutators.
 *
 * Changes when a filter or a parameter is edited. The shape is derived from
 * `useAlertFiltersModel` and from the parameter members `useAlertFormState` re-exports.
 *
 * @internal
 */
export type IAlertFiltersContextValue = Pick<
    ReturnType<typeof useAlertFiltersModel>,
    | "selectedFilters"
    | "availableFilters"
    | "onFiltersChange"
    | "onApplyCurrentFilters"
    | "automationIsValid"
    | "filtersAreStale"
> &
    Pick<
        ReturnType<typeof useAlertFormState>,
        | "automationParameters"
        | "availableParameters"
        | "onParameterChange"
        | "onParameterDelete"
        | "onParameterAdd"
        | "dropStaleParameters"
    >;

const AlertFiltersContext = createContext<IAlertFiltersContextValue | undefined>(undefined);
AlertFiltersContext.displayName = "AlertFiltersContext";

export const AlertFiltersContextProvider = AlertFiltersContext.Provider;

/**
 * Reads the alerting dialog's filter and export-parameter model.
 *
 * Throws outside the alerting dialog's state providers, which mount only once
 * `useAlertingDialogContext().isLoading` is false — a replacement for `AlertingDialogComponent`
 * must check that flag before calling this. On the alerting side that state is reached only by an
 * automations refresh while the dialog is open, so it will not appear in manual testing.
 *
 * @internal
 */
export function useAlertFilters(): IAlertFiltersContextValue {
    return useContext(AlertFiltersContext) ?? missingAlertStateProvider("useAlertFilters");
}
