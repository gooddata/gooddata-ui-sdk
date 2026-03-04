// (C) 2020-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { type SourceInsightFilterObjRef, type SourceMeasureFilterObjRef } from "@gooddata/sdk-model";

import { DrillFiltersConfigSection } from "./DrillFiltersConfigSection.js";
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
    supportsExtendedFiltersConfig: boolean;
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
    supportsExtendedFiltersConfig,
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
        supportsExtendedFiltersConfig,
        onDrillFiltersChange,
    });

    return (
        <div className="gd-drill-filters-config-inner">
            <DrillFiltersConfigSection
                title={intl.formatMessage({
                    id: "configurationPanel.drillConfig.filterSelection.section.drilledDataPoint",
                })}
                options={intersectionAttributesOptions}
                selectedIds={intersectionSelection}
                onSelectionChange={onIgnoredDrillAttributesChange}
            />
            {supportsExtendedFiltersConfig ? (
                <>
                    <DrillFiltersConfigSection
                        title={intl.formatMessage({
                            id: "configurationPanel.drillConfig.filterSelection.section.dashboard",
                        })}
                        options={dashboardFiltersOptions}
                        selectedIds={dashboardSelection}
                        onSelectionChange={onDashboardSelectionChange}
                    />
                    <DrillFiltersConfigSection
                        title={intl.formatMessage({
                            id: "configurationPanel.drillConfig.filterSelection.section.visualization",
                        })}
                        options={sourceInsightFiltersOptions}
                        selectedIds={sourceInsightSelection}
                        onSelectionChange={onIncludedSourceInsightFiltersChange}
                    />
                    <DrillFiltersConfigSection
                        title={intl.formatMessage({
                            id: "configurationPanel.drillConfig.filterSelection.section.metric",
                        })}
                        options={sourceMeasureFiltersOptions}
                        selectedIds={sourceMeasureSelection}
                        onSelectionChange={onSourceMeasureSelectionChange}
                    />
                </>
            ) : null}
        </div>
    );
}
