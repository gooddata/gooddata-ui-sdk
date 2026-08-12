// (C) 2026 GoodData Corporation

import { createContext, useContext } from "react";

import { missingAlertStateProvider } from "./missingAlertStateProvider.js";
import { type useAlertFormState } from "./useAlertFormState.js";

/**
 * The alerting dialog's edit draft: the automation being edited, the baseline it is compared
 * against, and the form-level warning and title-validity flag that move with it.
 *
 * Changes on every keystroke; consumers re-render by design. The shape is derived from
 * `useAlertFormState`, which owns these values.
 *
 * @internal
 */
export type IAlertDraftContextValue = Pick<
    ReturnType<typeof useAlertFormState>,
    "editedAutomation" | "originalAutomation" | "warningMessage" | "isTitleValid"
>;

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
 * @internal
 */
export function useAlertDraft(): IAlertDraftContextValue {
    return useContext(AlertDraftContext) ?? missingAlertStateProvider("useAlertDraft");
}
