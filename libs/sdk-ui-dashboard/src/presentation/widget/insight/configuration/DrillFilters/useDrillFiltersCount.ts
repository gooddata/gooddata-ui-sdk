// (C) 2020-2026 GoodData Corporation

import { useMemo } from "react";

import { type InsightDrillDefinition } from "@gooddata/sdk-model";

import { isDrillFiltersConfigOptionSelected } from "./types.js";
import { useDrillFiltersConfig } from "./useDrillFiltersConfig.js";
import { useDrillFiltersConfigInner } from "./useDrillFiltersConfigInner.js";
import {
    type IDrillConfigItem,
    type IDrillDownAttributeHierarchyDefinition,
} from "../../../../drill/types.js";

type OnUpdateDrillItem = (
    drill: InsightDrillDefinition | IDrillDownAttributeHierarchyDefinition,
    changedItem: IDrillConfigItem,
) => void;

interface IUseDrillFiltersCountResult {
    count: number;
    isLoading: boolean;
}

export function useDrillFiltersCount(
    item: IDrillConfigItem,
    onUpdateDrillItem: OnUpdateDrillItem,
): IUseDrillFiltersCountResult {
    const {
        intersectionAttributesOptions,
        sourceInsightFiltersOptions,
        sourceMeasureFiltersOptions,
        dashboardFiltersOptions,
        drillIntersectionIgnoredAttributes,
        includedSourceInsightFiltersObjRefs,
        ignoredDashboardFilters,
        includedSourceMeasureFiltersObjRefs,
        isLoading,
        onDrillFiltersChange,
    } = useDrillFiltersConfig({
        item,
        onUpdateDrillItem,
    });

    const { intersectionSelection, sourceInsightSelection, sourceMeasureSelection, dashboardSelection } =
        useDrillFiltersConfigInner({
            intersectionAttributesOptions,
            sourceInsightFiltersOptions,
            sourceMeasureFiltersOptions,
            dashboardFiltersOptions,
            drillIntersectionIgnoredAttributes,
            includedSourceInsightFiltersObjRefs,
            ignoredDashboardFilters,
            includedSourceMeasureFiltersObjRefs,
            onDrillFiltersChange,
        });

    const count = useMemo(
        () =>
            intersectionAttributesOptions.filter((option) =>
                isDrillFiltersConfigOptionSelected(option, intersectionSelection),
            ).length +
            dashboardFiltersOptions.filter((option) =>
                isDrillFiltersConfigOptionSelected(option, dashboardSelection),
            ).length +
            sourceInsightFiltersOptions.filter((option) =>
                isDrillFiltersConfigOptionSelected(option, sourceInsightSelection),
            ).length +
            sourceMeasureFiltersOptions.filter((option) =>
                isDrillFiltersConfigOptionSelected(option, sourceMeasureSelection),
            ).length,
        [
            intersectionAttributesOptions,
            intersectionSelection,
            dashboardFiltersOptions,
            dashboardSelection,
            sourceInsightFiltersOptions,
            sourceInsightSelection,
            sourceMeasureFiltersOptions,
            sourceMeasureSelection,
        ],
    );

    return {
        count,
        isLoading,
    };
}
