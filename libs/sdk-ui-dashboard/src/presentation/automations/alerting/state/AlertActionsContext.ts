// (C) 2026 GoodData Corporation

import { createContext, useContext } from "react";

import { missingAlertStateProvider } from "./missingAlertStateProvider.js";
import { type IAlertActionsContextValue } from "./types.js";

const AlertActionsContext = createContext<IAlertActionsContextValue | undefined>(undefined);
AlertActionsContext.displayName = "AlertActionsContext";

export const AlertActionsContextProvider = AlertActionsContext.Provider;

/**
 * Reads the alerting dialog's mutators.
 *
 * Throws outside the alerting dialog's state providers, which mount the state model on the first
 * render where `useAlertingDialogContext().isLoading` is false and keep it mounted from then on —
 * a replacement for `AlertingDialogComponent` must check that flag before reading state while the
 * dialog first loads. An automations refresh flips `isLoading` back without unmounting the model,
 * so the draft survives and this accessor keeps serving through it.
 *
 * @beta
 */
export function useAlertActions(): IAlertActionsContextValue {
    return useContext(AlertActionsContext) ?? missingAlertStateProvider("useAlertActions");
}
