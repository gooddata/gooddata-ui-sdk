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
 * Owns the alerting dialog's filter changes: `onFiltersChange` and `onApplyCurrentFilters` update the
 * edited filters and mirror the result into the alert draft.
 *
 * Mutation only. The matching read model lives elsewhere — the renderer derives it through
 * `useAutomationFiltersSelect` — so the two directions are not yet unified behind a single hook.
 *
 * All inputs are params; this hook reads no context.
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
