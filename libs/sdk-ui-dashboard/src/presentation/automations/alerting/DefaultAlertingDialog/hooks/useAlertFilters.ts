// (C) 2026 GoodData Corporation

import { type Dispatch, type SetStateAction, useCallback } from "react";

import {
    type FilterContextItem,
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type IAutomationVisibleFilter,
    type IInsight,
    type IWidget,
    type WeekStart,
} from "@gooddata/sdk-model";

import { useValidateExistingAutomationFilters } from "../../../shared/automationFilters/hooks/useValidateExistingAutomationFilters.js";
import { getAppliedWidgetFilters, getVisibleFiltersByFilters } from "../../../shared/filters/index.js";
import { type AlertAttribute, type AlertMetric } from "../../types.js";
import { type IMeasureFormatMap } from "../utils/getters.js";
import { transformAlertByAttribute, transformAlertByMetric } from "../utils/transformation.js";

/**
 * Props for {@link useAlertFilters}.
 * @internal
 */
export interface IUseAlertFiltersProps {
    setEditedAutomation: Dispatch<SetStateAction<IAutomationMetadataObjectDefinition | undefined>>;
    alertToEdit?: IAutomationMetadataObject;
    editedAutomationFilters: FilterContextItem[];
    setEditedAutomationFilters: (filters: FilterContextItem[]) => void;
    availableFilters?: FilterContextItem[];
    filtersForNewAutomation: FilterContextItem[];
    availableFiltersAsVisibleFilters?: IAutomationVisibleFilter[] | undefined;
    dashboardHiddenFilters: FilterContextItem[];
    commonDateFilterId?: string;
    widget?: IWidget;
    insight?: IInsight;
    supportedMeasures: AlertMetric[];
    supportedAttributes: AlertAttribute[];
    measureFormatMap: IMeasureFormatMap;
    selectedMeasure: AlertMetric | undefined;
    selectedAttribute: AlertAttribute | undefined;
    selectedValue: string | null | undefined;
    weekStart: WeekStart;
    timezone: string | undefined;
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
export function useAlertFilters({
    setEditedAutomation,
    alertToEdit,
    editedAutomationFilters,
    setEditedAutomationFilters,
    availableFilters,
    filtersForNewAutomation,
    availableFiltersAsVisibleFilters,
    dashboardHiddenFilters,
    commonDateFilterId,
    widget,
    insight,
    supportedMeasures,
    supportedAttributes,
    measureFormatMap,
    selectedMeasure,
    selectedAttribute,
    selectedValue,
    weekStart,
    timezone,
}: IUseAlertFiltersProps): {
    selectedFilters: FilterContextItem[];
    availableFilters: FilterContextItem[] | undefined;
    onFiltersChange: (filters: FilterContextItem[]) => void;
    onApplyCurrentFilters: () => void;
    automationIsValid: boolean;
    filtersAreStale: boolean;
} {
    const onFiltersChange = useCallback(
        (filters: FilterContextItem[]) => {
            setEditedAutomationFilters(filters);
            setEditedAutomation((s) => {
                if (!s) {
                    return undefined;
                }

                const appliedFilters = getAppliedWidgetFilters(
                    filters,
                    dashboardHiddenFilters,
                    widget,
                    insight,
                    commonDateFilterId,
                    true,
                    !s.metadata?.widget,
                );
                const visibleFilters = getVisibleFiltersByFilters(
                    filters,
                    availableFiltersAsVisibleFilters,
                    true,
                );

                const updatedAutomationWithFilters = {
                    ...s,
                    alert: {
                        ...s.alert!,
                        execution: {
                            ...s.alert!.execution,
                            filters: appliedFilters,
                        },
                    },
                    metadata: {
                        ...s.metadata,
                        visibleFilters,
                    },
                };

                const updatedAutomationWithAttribute = transformAlertByAttribute(
                    supportedAttributes,
                    updatedAutomationWithFilters as IAutomationMetadataObject,
                    selectedAttribute,
                    {
                        name: selectedValue ?? "",
                        title: "",
                        value: "",
                    },
                );

                return selectedMeasure
                    ? transformAlertByMetric(
                          supportedMeasures,
                          updatedAutomationWithAttribute,
                          selectedMeasure,
                          measureFormatMap,
                          weekStart,
                          timezone,
                      )
                    : updatedAutomationWithAttribute;
            });
        },
        [
            setEditedAutomationFilters,
            setEditedAutomation,
            availableFiltersAsVisibleFilters,
            widget,
            insight,
            dashboardHiddenFilters,
            commonDateFilterId,
            //
            selectedAttribute,
            selectedValue,
            supportedAttributes,
            //
            selectedMeasure,
            supportedMeasures,
            measureFormatMap,
            //
            weekStart,
            timezone,
        ],
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
