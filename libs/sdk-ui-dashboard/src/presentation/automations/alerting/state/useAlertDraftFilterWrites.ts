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

import { getAppliedWidgetFilters, getVisibleFiltersByFilters } from "../../shared/filters/index.js";
import { type AlertAttribute, type AlertMetric } from "../types.js";
import { type IMeasureFormatMap } from "../utils/getters.js";
import { transformAlertByAttribute, transformAlertByMetric } from "../utils/transformation.js";

/**
 * Props for {@link useAlertDraftFilterWrites}.
 * @internal
 */
export interface IUseAlertDraftFilterWritesProps {
    setEditedAutomation: Dispatch<SetStateAction<IAutomationMetadataObjectDefinition | undefined>>;
    dashboardHiddenFilters: FilterContextItem[];
    commonDateFilterId?: string;
    widget?: IWidget;
    insight?: IInsight;
    availableFiltersAsVisibleFilters?: IAutomationVisibleFilter[] | undefined;
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
 * Owns the alert draft's filter writes: reconciling a new filter selection into the edited automation.
 *
 * @internal
 */
export function useAlertDraftFilterWrites({
    setEditedAutomation,
    dashboardHiddenFilters,
    commonDateFilterId,
    widget,
    insight,
    availableFiltersAsVisibleFilters,
    supportedMeasures,
    supportedAttributes,
    measureFormatMap,
    selectedMeasure,
    selectedAttribute,
    selectedValue,
    weekStart,
    timezone,
}: IUseAlertDraftFilterWritesProps): { applyFiltersToDraft: (filters: FilterContextItem[]) => void } {
    const applyFiltersToDraft = useCallback(
        (filters: FilterContextItem[]) => {
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

    return { applyFiltersToDraft };
}
