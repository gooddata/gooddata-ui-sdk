// (C) 2026 GoodData Corporation

import { createContext, useContext } from "react";

import { missingAlertStateProvider } from "./missingAlertStateProvider.js";
import { type IAlertDraftContextValue } from "./types.js";

const AlertDraftContext = createContext<IAlertDraftContextValue | undefined>(undefined);
AlertDraftContext.displayName = "AlertDraftContext";

export const AlertDraftContextProvider = AlertDraftContext.Provider;

/**
 * Reads the alerting dialog's edit draft.
 *
 * Throws outside the alerting dialog's state providers, which mount only once
 * `useAlertingDialogContext().isLoading` is false — a replacement for `AlertingDialogComponent`
 * must check that flag before calling this. On the alerting side that state is reached only by an
 * automations refresh while the dialog is open, so it will not appear in manual testing.
 *
 * @alpha
 */
export function useAlertDraft(): IAlertDraftContextValue {
    return useContext(AlertDraftContext) ?? missingAlertStateProvider("useAlertDraft");
}
