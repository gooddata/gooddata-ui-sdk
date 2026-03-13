// (C) 2020-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { type SourceInsightFilterObjRef, type SourceMeasureFilterObjRef } from "@gooddata/sdk-model";

import { DrillFiltersConfigSection } from "./DrillFiltersConfigSection.js";
import { messages } from "./messages.js";
import { type IDrillFiltersConfigOption } from "./types.js";
import { useDrillFiltersConfigInner } from "./useDrillFiltersConfigInner.js";
import { type IDrillFiltersConfigExtended } from "../../../../drill/types.js";

interface IDrillFiltersConfigInnerProps {
    intersectionAttributesOptions: IDrillFiltersConfigOption[];
    sourceInsightFiltersOptions: IDrillFiltersConfigOption[];
    sourceMeasureFiltersOptions: IDrillFiltersConfigOption[];
    dashboardFiltersOptions: IDrillFiltersConfigOption[];
    drillIntersectionIgnoredAttributes: string[];
    includedSourceInsightFiltersObjRefs: SourceInsightFilterObjRef[];
    ignoredDashboardFilters: string[];
    includedSourceMeasureFiltersObjRefs: SourceMeasureFilterObjRef[];
    onDrillFiltersChange: (
        selection: Partial<
            IDrillFiltersConfigExtended & {
                drillIntersectionIgnoredAttributes: string[];
            }
        >,
    ) => void;
}

export function DrillFiltersConfigInner({
    intersectionAttributesOptions,
    sourceInsightFiltersOptions,
    sourceMeasureFiltersOptions,
    dashboardFiltersOptions,
    drillIntersectionIgnoredAttributes,
    includedSourceInsightFiltersObjRefs,
    ignoredDashboardFilters,
    includedSourceMeasureFiltersObjRefs,
    onDrillFiltersChange,
}: IDrillFiltersConfigInnerProps) {
    const intl = useIntl();
    const {
        intersectionSelection,
        sourceInsightSelection,
        sourceMeasureSelection,
        dashboardSelection,
        onIgnoredDrillAttributesChange,
        onIncludedSourceInsightFiltersChange,
        onSourceMeasureSelectionChange,
        onDashboardSelectionChange,
    } = useDrillFiltersConfigInner({
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

    return (
        <div className="gd-drill-filters-config-inner">
            <DrillFiltersConfigSection
                dataTestId="drill-filters-data-point-section"
                title={intl.formatMessage(messages.drillFiltersDrilledDataPointSectionTitle)}
                options={intersectionAttributesOptions}
                selectedIds={intersectionSelection}
                onSelectionChange={onIgnoredDrillAttributesChange}
            />
            <DrillFiltersConfigSection
                dataTestId="drill-filters-dashboard-section"
                title={intl.formatMessage(messages.drillFiltersDashboardSectionTitle)}
                options={dashboardFiltersOptions}
                selectedIds={dashboardSelection}
                onSelectionChange={onDashboardSelectionChange}
            />
            <DrillFiltersConfigSection
                dataTestId="drill-filters-visualization-section"
                title={intl.formatMessage(messages.drillFiltersVisualizationSectionTitle)}
                options={sourceInsightFiltersOptions}
                selectedIds={sourceInsightSelection}
                onSelectionChange={onIncludedSourceInsightFiltersChange}
            />
            <DrillFiltersConfigSection
                dataTestId="drill-filters-metric-section"
                title={intl.formatMessage(messages.drillFiltersMetricSectionTitle)}
                options={sourceMeasureFiltersOptions}
                selectedIds={sourceMeasureSelection}
                onSelectionChange={onSourceMeasureSelectionChange}
            />
        </div>
    );
}
