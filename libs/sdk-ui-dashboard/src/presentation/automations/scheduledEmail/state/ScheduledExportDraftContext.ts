// (C) 2026 GoodData Corporation

import { createContext, useContext } from "react";

import { missingScheduledExportStateProvider } from "./missingScheduledExportStateProvider.js";
import { type useScheduledEmailFormState } from "./useScheduledEmailFormState.js";

/**
 * The scheduled-export dialog's edit draft: the automation being edited, the baseline it is
 * compared against for the submit gate, the normalized start date, and the per-field validity
 * flags the form fields report back.
 *
 * Changes on every keystroke; consumers re-render by design. The shape is derived from
 * `useScheduledEmailFormState`, which owns these values.
 *
 * @internal
 */
export type IScheduledExportDraftContextValue = Pick<
    ReturnType<typeof useScheduledEmailFormState>,
    | "editedAutomation"
    | "originalAutomation"
    | "startDate"
    | "isCronValid"
    | "isTitleValid"
    | "isSubjectValid"
    | "isOnMessageValid"
>;

const ScheduledExportDraftContext = createContext<IScheduledExportDraftContextValue | undefined>(undefined);
ScheduledExportDraftContext.displayName = "ScheduledExportDraftContext";

export const ScheduledExportDraftContextProvider = ScheduledExportDraftContext.Provider;

/**
 * Reads the scheduled-export dialog's edit draft.
 *
 * Throws outside the scheduled-export dialog's state providers, which mount only once
 * `useScheduledEmailDialogContext().isLoading` is false — a replacement for
 * `ScheduledEmailDialogComponent` must check that flag before calling this. That state is on the
 * ordinary path here: a widget export renders while its filters load.
 *
 * @internal
 */
export function useScheduledExportDraft(): IScheduledExportDraftContextValue {
    return (
        useContext(ScheduledExportDraftContext) ??
        missingScheduledExportStateProvider("useScheduledExportDraft")
    );
}
