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
 * Throws outside the alerting dialog's state providers, which mount only once
 * `useAlertingDialogContext().isLoading` is false — a replacement for `AlertingDialogComponent`
 * must check that flag before calling this. On the alerting side that state is reached only by an
 * automations refresh while the dialog is open, so it will not appear in manual testing.
 *
 * @alpha
 */
export function useAlertActions(): IAlertActionsContextValue {
    return useContext(AlertActionsContext) ?? missingAlertStateProvider("useAlertActions");
}
