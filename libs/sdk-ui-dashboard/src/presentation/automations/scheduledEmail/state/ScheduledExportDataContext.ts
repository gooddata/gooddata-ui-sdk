// (C) 2026 GoodData Corporation

import { createContext, useContext } from "react";

import { missingScheduledExportStateProvider } from "./missingScheduledExportStateProvider.js";
import { type useScheduledEmailFormState } from "./useScheduledEmailFormState.js";

/**
 * The scheduled-export dialog's recipient defaults: the logged-in user as a recipient, and the
 * recipient a new schedule is seeded with, which an external-recipient override replaces.
 *
 * Changes when the current user or the override changes, so not while the draft is edited. Two
 * members is the whole of it: this dialog loads no execution data. The shape is derived from
 * `useScheduledEmailFormState`, which owns these values.
 *
 * @internal
 */
export type IScheduledExportDataContextValue = Pick<
    ReturnType<typeof useScheduledEmailFormState>,
    "defaultUser" | "defaultRecipient"
>;

const ScheduledExportDataContext = createContext<IScheduledExportDataContextValue | undefined>(undefined);
ScheduledExportDataContext.displayName = "ScheduledExportDataContext";

export const ScheduledExportDataContextProvider = ScheduledExportDataContext.Provider;

/**
 * Reads the scheduled-export dialog's recipient defaults.
 *
 * Throws outside the scheduled-export dialog's state providers, which mount only once
 * `useScheduledEmailDialogContext().isLoading` is false — a replacement for
 * `ScheduledEmailDialogComponent` must check that flag before calling this. That state is on the
 * ordinary path here: a widget export renders while its filters load.
 *
 * @internal
 */
export function useScheduledExportData(): IScheduledExportDataContextValue {
    return (
        useContext(ScheduledExportDataContext) ??
        missingScheduledExportStateProvider("useScheduledExportData")
    );
}
