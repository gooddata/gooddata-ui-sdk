// (C) 2026 GoodData Corporation

import { useCallback } from "react";

import {
    type FilterContextItem,
    type IAutomationMetadataObject,
    type IDashboardExportParameter,
    type IInsight,
    type IWidget,
} from "@gooddata/sdk-model";

import type { IAutomationFiltersTab } from "../../../../model/store/filtering/types.js";
import { useScheduledEmailDialogContext } from "../../contexts/ScheduledEmailDialogContext.js";
import { useValidateExistingAutomationFilters } from "../../shared/automationFilters/hooks/useValidateExistingAutomationFilters.js";
import { useAutomationExportParameters } from "../../shared/automationFilters/useAutomationExportParameters.js";
import { getDefaultSelectedFiltersFromFiltersByTab } from "../../shared/automationFilters/useAutomationFiltersSelect.js";
import { useShallowStable } from "../../shared/hooks/useShallowStable.js";

import { type IScheduledExportFiltersContextValue } from "./types.js";

export interface IUseScheduledEmailFiltersModelProps {
    scheduledExportToEdit?: IAutomationMetadataObject;
    widget?: IWidget;
    insight?: IInsight;
    editedAutomationFilters: FilterContextItem[];
    setEditedAutomationFilters: (filters: FilterContextItem[]) => void;
    editedAutomationFiltersByTab?: Record<string, FilterContextItem[]>;
    setEditedAutomationFiltersByTab?: (filters: Record<string, FilterContextItem[]>) => void;
    availableFilters?: FilterContextItem[];
    filtersByTab?: IAutomationFiltersTab[] | undefined;
    storeFilters: boolean;
    setStoreFilters: (storeFilters: boolean) => void;
    filtersForNewAutomation: FilterContextItem[];
    setParametersWire: (wire: Record<string, IDashboardExportParameter[]> | undefined) => void;
    applyFiltersToDraft: (filters: FilterContextItem[], storeFiltersParam?: boolean) => void;
    applyFiltersByTabToDraft: (
        newFiltersByTab: Record<string, FilterContextItem[]>,
        storeFiltersParam?: boolean,
    ) => void;
}

/**
 * The scheduled-email dialog's single filter model: the current selection and available filters
 * (flat and per-tab), the handlers that mutate them and mirror the result into the draft, the
 * `automationIsValid`/`filtersAreStale` staleness gate for a saved schedule, and the absorbed
 * export-parameters model (chips, add/change/delete handlers, apply-latest and store-toggle).
 * `automationIsValid` gates the repair / apply-current-filters dialog: it is false whenever the
 * saved filters no longer match the dashboard, or the saved parameters are stale, or both — it does
 * not distinguish which. `filtersAreStale` reports only whether saved filters no longer match.
 * Parameters live here — rather than in form-state, as on the alerting side — because they have no
 * draft dependency of their own; they only need `storeFilters` (the read model) and `setParametersWire`
 * (from {@link useScheduledEmailExportSettings}).
 *
 * @internal
 */
export function useScheduledEmailFiltersModel({
    scheduledExportToEdit,
    widget,
    insight,
    editedAutomationFilters,
    setEditedAutomationFilters,
    editedAutomationFiltersByTab,
    setEditedAutomationFiltersByTab,
    availableFilters,
    filtersByTab,
    storeFilters,
    setStoreFilters,
    filtersForNewAutomation,
    setParametersWire,
    applyFiltersToDraft,
    applyFiltersByTabToDraft,
}: IUseScheduledEmailFiltersModelProps): IScheduledExportFiltersContextValue {
    const { exportParametersByTab } = useScheduledEmailDialogContext();

    const onFiltersChange = useCallback(
        (filters: FilterContextItem[], storeFiltersParam?: boolean) => {
            setEditedAutomationFilters(filters);
            applyFiltersToDraft(filters, storeFiltersParam);
        },
        [setEditedAutomationFilters, applyFiltersToDraft],
    );

    // Callback for per-tab filter changes - updates state and forwards the draft write
    const onFiltersByTabChange = useCallback(
        (newFiltersByTab: Record<string, FilterContextItem[]>, storeFiltersParam?: boolean) => {
            // Update the editedFiltersByTab state
            setEditedAutomationFiltersByTab?.(newFiltersByTab);
            applyFiltersByTabToDraft(newFiltersByTab, storeFiltersParam);
        },
        [setEditedAutomationFiltersByTab, applyFiltersByTabToDraft],
    );

    const onApplyCurrentFilters = useCallback(() => {
        // Widget schedules should never use per-tab filters, only dashboard schedules can have tabs
        const filtersByTabForNewAutomation = widget
            ? undefined
            : getDefaultSelectedFiltersFromFiltersByTab(filtersByTab);
        if (filtersByTabForNewAutomation) {
            onFiltersByTabChange(filtersByTabForNewAutomation);
        } else {
            onFiltersChange(filtersForNewAutomation ?? [], widget ? true : storeFilters);
        }
    }, [filtersForNewAutomation, storeFilters, onFiltersChange, onFiltersByTabChange, widget, filtersByTab]);

    const { isValid: automationIsValid, filtersAreStale = false } = useValidateExistingAutomationFilters({
        automationToEdit: scheduledExportToEdit,
        widget,
        insight,
    });

    const parameters = useAutomationExportParameters({
        automationToEdit: scheduledExportToEdit,
        widget,
        storeParameters: storeFilters,
        setParametersWire,
        effectiveParametersByTab: exportParametersByTab,
    });
    const { onStoreParametersChange } = parameters;

    // The store-filters toggle gates parameter persistence as well, and this hook owns both sides of
    // it, so no caller has to remember the parameters half. `value` is forwarded explicitly to every
    // side because `storeFilters` still holds the old one at call time.
    const onStoreFiltersChange = useCallback(
        (
            value: boolean,
            filters?: FilterContextItem[],
            filtersByTabParam?: Record<string, FilterContextItem[]>,
        ) => {
            setStoreFilters(value);

            // If filtersByTab is provided, use onFiltersByTabChange, otherwise use onFiltersChange
            if (filtersByTabParam) {
                // Trigger filtersByTab change which handles the sync
                onFiltersByTabChange(filtersByTabParam, value);
            }
            if (filters) {
                // Use regular filters change
                onFiltersChange(filters, value);
            }

            onStoreParametersChange(value);
        },
        [onFiltersChange, onFiltersByTabChange, setStoreFilters, onStoreParametersChange],
    );

    // Held stable member-wise, not just internally: this whole object is the filter context's value,
    // so its identity is what every consumer re-renders on. The model never reads the draft, so a
    // keystroke changes no member — and without this a fresh literal would re-render every consumer.
    return useShallowStable<IScheduledExportFiltersContextValue>({
        selectedFilters: editedAutomationFilters,
        availableFilters,
        storeFilters,
        filtersByTab,
        editedFiltersByTab: editedAutomationFiltersByTab,
        onFiltersChange,
        onFiltersByTabChange,
        onApplyCurrentFilters,
        onStoreFiltersChange,
        automationIsValid,
        filtersAreStale,
        ...parameters,
    });
}
