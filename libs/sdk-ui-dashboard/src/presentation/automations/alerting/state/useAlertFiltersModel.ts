// (C) 2026 GoodData Corporation

import { useCallback } from "react";

import {
    type FilterContextItem,
    type IAutomationMetadataObject,
    type IInsight,
    type IWidget,
} from "@gooddata/sdk-model";

import { useValidateExistingAutomationFilters } from "../../shared/automationFilters/hooks/useValidateExistingAutomationFilters.js";

import { type IAlertFiltersModel } from "./types.js";

/**
 * Props for {@link useAlertFiltersModel}.
 * @internal
 */
export interface IUseAlertFiltersModelProps {
    alertToEdit?: IAutomationMetadataObject;
    editedAutomationFilters: FilterContextItem[];
    setEditedAutomationFilters: (filters: FilterContextItem[]) => void;
    availableFilters?: FilterContextItem[];
    filtersForNewAutomation: FilterContextItem[];
    widget?: IWidget;
    insight?: IInsight;
    applyFiltersToDraft: (filters: FilterContextItem[]) => void;
}

/**
 * Owns the alerting dialog's single filter model: the current selection and available filters,
 * `onFiltersChange`/`onApplyCurrentFilters` to mutate the edited filters and mirror the result into
 * the alert draft. `automationIsValid` gates the repair / apply-current-filters dialog: it is false
 * whenever the saved filters no longer match the dashboard, or the automation's saved parameters
 * are stale, or both — it does not distinguish which. `filtersAreStale` reports only whether saved
 * filters no longer match the dashboard.
 *
 * All inputs are params; this hook reads no context directly — `useValidateExistingAutomationFilters`
 * reads context internally.
 *
 * @internal
 */
export function useAlertFiltersModel({
    alertToEdit,
    editedAutomationFilters,
    setEditedAutomationFilters,
    availableFilters,
    filtersForNewAutomation,
    widget,
    insight,
    applyFiltersToDraft,
}: IUseAlertFiltersModelProps): IAlertFiltersModel {
    const onFiltersChange = useCallback(
        (filters: FilterContextItem[]) => {
            setEditedAutomationFilters(filters);
            applyFiltersToDraft(filters);
        },
        [setEditedAutomationFilters, applyFiltersToDraft],
    );

    const onApplyCurrentFilters = useCallback(() => {
        onFiltersChange(filtersForNewAutomation);
    }, [filtersForNewAutomation, onFiltersChange]);

    const { isValid: automationIsValid, filtersAreStale = false } = useValidateExistingAutomationFilters({
        automationToEdit: alertToEdit,
        widget,
        insight,
    });

    return {
        selectedFilters: editedAutomationFilters,
        availableFilters,
        onFiltersChange,
        onApplyCurrentFilters,
        automationIsValid,
        filtersAreStale,
    };
}
