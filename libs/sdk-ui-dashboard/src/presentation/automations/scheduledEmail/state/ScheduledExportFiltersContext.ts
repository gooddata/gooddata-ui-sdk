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
 * Throws outside the scheduled-export dialog's state providers, which mount the state model on
 * the first render where `useScheduledEmailDialogContext().isLoading` is false and keep it
 * mounted from then on — a replacement for `ScheduledEmailDialogComponent` must check that flag
 * before reading state while the dialog first loads. That state is on the ordinary path here: a
 * widget export renders while its filters load. An automations refresh flips `isLoading` back
 * without unmounting the model, so the draft survives and this accessor keeps serving through it.
 *
 * @beta
 */
export function useScheduledExportFilters(): IScheduledExportFiltersContextValue {
    return (
        useContext(ScheduledExportFiltersContext) ??
        missingScheduledExportStateProvider("useScheduledExportFilters")
    );
}
