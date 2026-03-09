// (C) 2020-2026 GoodData Corporation

import { useMemo } from "react";

import { type InsightDrillDefinition } from "@gooddata/sdk-model";

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

export function useDrillFiltersCount(item: IDrillConfigItem, onUpdateDrillItem: OnUpdateDrillItem): number {
    const {
        supportsExtendedFiltersConfig,
        intersectionAttributesOptions,
        sourceInsightFiltersOptions,
        sourceMeasureFiltersOptions,
        dashboardFiltersOptions,
        drillIntersectionIgnoredAttributes,
        includedSourceInsightFiltersObjRefs,
        ignoredDashboardFilters,
        includedSourceMeasureFiltersObjRefs,
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
            supportsExtendedFiltersConfig,
            onDrillFiltersChange,
        });

    return useMemo(
        () =>
            intersectionSelection.length +
            dashboardSelection.length +
            sourceInsightSelection.length +
            sourceMeasureSelection.length,
        [intersectionSelection, dashboardSelection, sourceInsightSelection, sourceMeasureSelection],
    );
}
