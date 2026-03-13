// (C) 2020-2026 GoodData Corporation

import { type InsightDrillDefinition } from "@gooddata/sdk-model";

import { DrillFiltersConfigInner } from "./DrillFiltersConfigInner.js";
import { useDrillFiltersConfig } from "./useDrillFiltersConfig.js";
import {
    type IDrillConfigItem,
    type IDrillDownAttributeHierarchyDefinition,
} from "../../../../drill/types.js";

interface IDrillFiltersConfigProps {
    item: IDrillConfigItem;
    onUpdateDrillItem: (
        drill: InsightDrillDefinition | IDrillDownAttributeHierarchyDefinition,
        changedItem: IDrillConfigItem,
    ) => void;
}

export function DrillFiltersConfig({ item, onUpdateDrillItem }: IDrillFiltersConfigProps) {
    const {
        intersectionAttributesOptions,
        sourceInsightFiltersOptions,
        sourceMeasureFiltersOptions,
        dashboardFiltersOptions,
        drillIntersectionIgnoredAttributes,
        includedSourceInsightFiltersObjRefs,
        ignoredDashboardFilters,
        includedSourceMeasureFiltersObjRefs,
        onDrillFiltersChange,
    } = useDrillFiltersConfig({ item, onUpdateDrillItem });

    return (
        <DrillFiltersConfigInner
            intersectionAttributesOptions={intersectionAttributesOptions}
            sourceInsightFiltersOptions={sourceInsightFiltersOptions}
            sourceMeasureFiltersOptions={sourceMeasureFiltersOptions}
            dashboardFiltersOptions={dashboardFiltersOptions}
            drillIntersectionIgnoredAttributes={drillIntersectionIgnoredAttributes}
            includedSourceInsightFiltersObjRefs={includedSourceInsightFiltersObjRefs}
            ignoredDashboardFilters={ignoredDashboardFilters}
            includedSourceMeasureFiltersObjRefs={includedSourceMeasureFiltersObjRefs}
            onDrillFiltersChange={onDrillFiltersChange}
        />
    );
}
