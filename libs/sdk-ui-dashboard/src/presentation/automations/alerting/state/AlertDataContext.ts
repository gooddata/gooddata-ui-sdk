// (C) 2026 GoodData Corporation

import { createContext, useContext } from "react";

import { missingAlertStateProvider } from "./missingAlertStateProvider.js";
import { type IAlertDataContextValue } from "./types.js";

const AlertDataContext = createContext<IAlertDataContextValue | undefined>(undefined);
AlertDataContext.displayName = "AlertDataContext";

export const AlertDataContextProvider = AlertDataContext.Provider;

/**
 * Reads the data the alerting dialog loads asynchronously.
 *
 * Throws outside the alerting dialog's state providers, which mount the state model on the first
 * render where `useAlertingDialogContext().isLoading` is false and keep it mounted from then on —
 * a replacement for `AlertingDialogComponent` must check that flag before reading state while the
 * dialog first loads. An automations refresh flips `isLoading` back without unmounting the model,
 * so the draft survives and this accessor keeps serving through it.
 *
 * @alpha
 */
export function useAlertData(): IAlertDataContextValue {
    return useContext(AlertDataContext) ?? missingAlertStateProvider("useAlertData");
}
