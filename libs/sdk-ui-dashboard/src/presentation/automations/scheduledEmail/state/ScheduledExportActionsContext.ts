// (C) 2026 GoodData Corporation

import { createContext, useContext } from "react";

import { type useScheduleTimezone } from "../DefaultScheduledEmailDialog/hooks/useScheduleTimezone.js";

import { missingScheduledExportStateProvider } from "./missingScheduledExportStateProvider.js";
import { type useScheduledEmailExportSettings } from "./useScheduledEmailExportSettings.js";
import { type useScheduledEmailFormState } from "./useScheduledEmailFormState.js";

/**
 * The scheduled-export dialog's draft mutators: the form fields' change handlers, the raw draft
 * setter, and the attachment handlers, which rebuild the automation's export definitions while
 * carrying the stored export-parameter wire across the rebuild.
 *
 * Every handler holds its identity across a keystroke, so a consumer that only mutates does not
 * re-render while the draft changes. The two attachment handlers are rebuilt when the filters they
 * write into a new export definition change. The shape is derived from `useScheduledEmailFormState`
 * and `useScheduledEmailExportSettings`, which own these handlers.
 *
 * @internal
 */
export type IScheduledExportActionsContextValue = Pick<
    ReturnType<typeof useScheduledEmailFormState>,
    | "setEditedAutomation"
    | "onTitleChange"
    | "onRecurrenceChange"
    | "onEvaluationModeChange"
    | "onDestinationChange"
    | "onRecipientsChange"
    | "onSubjectChange"
    | "onMessageChange"
> &
    Pick<
        ReturnType<typeof useScheduledEmailExportSettings>,
        | "onDashboardAttachmentsChange"
        | "onWidgetAttachmentsChange"
        | "onXlsxSettingsChange"
        | "onPdfSettingsChange"
        | "onCsvSettingsChange"
        | "onCsvRawSettingsChange"
        | "onSlidesTemplateIdChange"
    > &
    Pick<ReturnType<typeof useScheduleTimezone>, "onScheduleTimezoneChange" | "applyCurrentScheduleTimezone">;

const ScheduledExportActionsContext = createContext<IScheduledExportActionsContextValue | undefined>(
    undefined,
);
ScheduledExportActionsContext.displayName = "ScheduledExportActionsContext";

export const ScheduledExportActionsContextProvider = ScheduledExportActionsContext.Provider;

/**
 * Reads the scheduled-export dialog's draft mutators.
 *
 * Throws outside the scheduled-export dialog's state providers, which mount only once
 * `useScheduledEmailDialogContext().isLoading` is false — a replacement for
 * `ScheduledEmailDialogComponent` must check that flag before calling this. That state is on the
 * ordinary path here: a widget export renders while its filters load.
 *
 * @internal
 */
export function useScheduledExportActions(): IScheduledExportActionsContextValue {
    return (
        useContext(ScheduledExportActionsContext) ??
        missingScheduledExportStateProvider("useScheduledExportActions")
    );
}
