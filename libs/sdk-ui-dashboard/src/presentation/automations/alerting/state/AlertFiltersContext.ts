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
 * Throws outside the alerting dialog's state providers, which mount the state model on the first
 * render where `useAlertingDialogContext().isLoading` is false and keep it mounted from then on —
 * a replacement for `AlertingDialogComponent` must check that flag before reading state while the
 * dialog first loads. An automations refresh flips `isLoading` back without unmounting the model,
 * so the draft survives and this accessor keeps serving through it.
 *
 * @beta
 */
export function useAlertFilters(): IAlertFiltersContextValue {
    return useContext(AlertFiltersContext) ?? missingAlertStateProvider("useAlertFilters");
}
