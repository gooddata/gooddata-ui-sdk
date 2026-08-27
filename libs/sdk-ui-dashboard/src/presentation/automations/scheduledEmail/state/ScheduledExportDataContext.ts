// (C) 2026 GoodData Corporation

import { createContext, useContext } from "react";

import { missingScheduledExportStateProvider } from "./missingScheduledExportStateProvider.js";
import { type IScheduledExportDataContextValue } from "./types.js";

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
