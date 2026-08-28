// (C) 2026 GoodData Corporation

import { createContext, useContext } from "react";

import { missingScheduledExportStateProvider } from "./missingScheduledExportStateProvider.js";
import { type IScheduledExportFiltersContextValue } from "./types.js";

const ScheduledExportFiltersContext = createContext<IScheduledExportFiltersContextValue | undefined>(
    undefined,
);
ScheduledExportFiltersContext.displayName = "ScheduledExportFiltersContext";

export const ScheduledExportFiltersContextProvider = ScheduledExportFiltersContext.Provider;

/**
 * Reads the scheduled-export dialog's filter and export-parameter model.
 *
 * Throws outside the scheduled-export dialog's state providers, which mount only once
 * `useScheduledEmailDialogContext().isLoading` is false — a replacement for
 * `ScheduledEmailDialogComponent` must check that flag before calling this. That state is on the
 * ordinary path here: a widget export renders while its filters load.
 *
 * @alpha
 */
export function useScheduledExportFilters(): IScheduledExportFiltersContextValue {
    return (
        useContext(ScheduledExportFiltersContext) ??
        missingScheduledExportStateProvider("useScheduledExportFilters")
    );
}
