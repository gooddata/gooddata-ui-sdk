// (C) 2026 GoodData Corporation

import { createContext, useContext } from "react";

import { missingScheduledExportStateProvider } from "./missingScheduledExportStateProvider.js";
import { type IScheduledExportActionsContextValue } from "./types.js";

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
 * @alpha
 */
export function useScheduledExportActions(): IScheduledExportActionsContextValue {
    return (
        useContext(ScheduledExportActionsContext) ??
        missingScheduledExportStateProvider("useScheduledExportActions")
    );
}
