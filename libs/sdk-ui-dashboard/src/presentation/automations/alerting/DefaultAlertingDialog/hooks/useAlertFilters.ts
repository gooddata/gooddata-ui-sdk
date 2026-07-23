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

import {
    getAppliedWidgetFilters,
    getVisibleFiltersByFilters,
} from "../../../shared/automationFilters/utils.js";
import { type AlertAttribute, type AlertMetric } from "../../types.js";
import { type IMeasureFormatMap } from "../utils/getters.js";
import { transformAlertByAttribute, transformAlertByMetric } from "../utils/transformation.js";

/**
 * Props for {@link useAlertFilters}.
 * @internal
 */
export interface IUseAlertFiltersProps {
    setEditedAutomation: Dispatch<SetStateAction<IAutomationMetadataObjectDefinition | undefined>>;
    setEditedAutomationFilters: (filters: FilterContextItem[]) => void;
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
 * Extracts the alerting dialog's filter-change reconciliation out of `useEditAlert` into a focused
 * hook. Pure refactor — scope is the mutation path only (`onFiltersChange` / `onApplyCurrentFilters`);
 * the filter *read* model (`useAutomationFiltersSelect` in the renderer) is intentionally unchanged.
 *
 * All inputs are params — the hook reads nothing from context.
 *
 * @internal
 */
export function useAlertFilters({
    setEditedAutomation,
    setEditedAutomationFilters,
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
    onFiltersChange: (filters: FilterContextItem[]) => void;
    onApplyCurrentFilters: () => void;
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

    return {
        onFiltersChange,
        onApplyCurrentFilters,
    };
}
