// (C) 2026 GoodData Corporation

import { createContext, useContext } from "react";

import { missingAlertStateProvider } from "./missingAlertStateProvider.js";
import { type IAlertFiltersContextValue } from "./types.js";

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
 * @alpha
 */
export function useAlertFilters(): IAlertFiltersContextValue {
    return useContext(AlertFiltersContext) ?? missingAlertStateProvider("useAlertFilters");
}
