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
 * Throws outside the scheduled-export dialog's state providers, which mount the state model on
 * the first render where `useScheduledEmailDialogContext().isLoading` is false and keep it
 * mounted from then on — a replacement for `ScheduledEmailDialogComponent` must check that flag
 * before reading state while the dialog first loads. That state is on the ordinary path here: a
 * widget export renders while its filters load. An automations refresh flips `isLoading` back
 * without unmounting the model, so the draft survives and this accessor keeps serving through it.
 *
 * @beta
 */
export function useScheduledExportData(): IScheduledExportDataContextValue {
    return (
        useContext(ScheduledExportDataContext) ??
        missingScheduledExportStateProvider("useScheduledExportData")
    );
}
