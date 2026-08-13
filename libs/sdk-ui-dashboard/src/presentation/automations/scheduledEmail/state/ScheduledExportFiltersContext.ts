// (C) 2026 GoodData Corporation

import { createContext, useContext } from "react";

import { missingScheduledExportStateProvider } from "./missingScheduledExportStateProvider.js";
import { type useScheduledEmailFiltersModel } from "./useScheduledEmailFiltersModel.js";

/**
 * The scheduled-export dialog's filter and export-parameter model: the current selection and the
 * available filters, flat and per-tab, the handlers that mutate them and mirror the result into the
 * draft, the store-filters toggle, the staleness gate that opens the apply-current-filters dialog,
 * and the parameter chips with their add, change, delete and apply-latest handlers.
 *
 * The model's whole return is the context value rather than a selection from it, because the model
 * is the unit a replacement reads: a member cannot be dropped from it.
 *
 * @internal
 */
export type IScheduledExportFiltersContextValue = ReturnType<typeof useScheduledEmailFiltersModel>;

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
 * @internal
 */
export function useScheduledExportFilters(): IScheduledExportFiltersContextValue {
    return (
        useContext(ScheduledExportFiltersContext) ??
        missingScheduledExportStateProvider("useScheduledExportFilters")
    );
}
