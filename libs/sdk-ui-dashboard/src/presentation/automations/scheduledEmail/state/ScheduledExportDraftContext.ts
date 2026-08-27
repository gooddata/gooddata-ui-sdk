// (C) 2026 GoodData Corporation

import { createContext, useContext } from "react";

import { missingScheduledExportStateProvider } from "./missingScheduledExportStateProvider.js";
import { type IScheduledExportDraftContextValue } from "./types.js";

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
