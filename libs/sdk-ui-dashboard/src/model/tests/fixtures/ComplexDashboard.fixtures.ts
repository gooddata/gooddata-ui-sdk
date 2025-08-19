// (C) 2021-2025 GoodData Corporation
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { IDashboardWithReferences } from "@gooddata/sdk-backend-spi";
import {
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    IFilterContext,
    IInsightWidget,
    IKpiWidget,
    IListedDashboard,
    idRef,
} from "@gooddata/sdk-model";

/**
 * A more complex dashboard that has 3 sections (rows).
 *
 * Two attribute filters: Region & Product
 * First row: 6 KPIs, first three without date filtering, second three with full filtering
 * Second row: two tables; same tables, each with 3 measures. first without any filtering whatsoever but with all drills; second with date filter and no attribute filtering, no drills
 * Third row: single heatmap with all filters applied
 */
export const ComplexDashboardIdentifier = "e6473e57-1914-46ec-9cb9-5611f1298100";
export const ComplexDashboardWithReferences = ReferenceRecordings.Recordings.metadata?.dashboards
    ?.dash_e6473e57_1914_46ec_9cb9_5611f1298100.obj as IDashboardWithReferences;
export const ComplexDashboardFilterContext = ComplexDashboardWithReferences.dashboard
    .filterContext! as IFilterContext;

/**
 * Contains breakdown of the complex dashboard's filters context. There is date filter and
 * two attribute filters. For each attribute filter the entry contains both the full filter
 * definition and then uriRef and idRef of the display form used in the attribute filter.
 */
export const ComplexDashboardFilters = {
    Date: ComplexDashboardFilterContext.filters[0] as IDashboardDateFilter,
    FirstAttribute: {
        filter: ComplexDashboardFilterContext.filters[1] as IDashboardAttributeFilter,
        idRef: idRef("f_owner.region_id"),
        sampleElementValue: "East Coast",
    },
    SecondAttribute: {
        filter: ComplexDashboardFilterContext.filters[2] as IDashboardAttributeFilter,
        idRef: idRef("attr.f_product.product"),
    },
};

export const ComplexDashboardLayout = ComplexDashboardWithReferences.dashboard.layout!;

export const ComplexDashboardWidgets = {
    FirstSection: {
        /**
         * KPI with date filter disabled
         */
        FirstKpi: ComplexDashboardWithReferences.dashboard.layout!.sections[0].items[0].widget! as IKpiWidget,
        /**
         * KPI with all filters disabled
         */
        ThirdKpi: ComplexDashboardWithReferences.dashboard.layout!.sections[0].items[2].widget! as IKpiWidget,
        /**
         * KPI with all filters enabled
         */
        LastKpi: ComplexDashboardWithReferences.dashboard.layout!.sections[0].items[5].widget! as IKpiWidget,
    },
    SecondSection: {
        FirstTable: ComplexDashboardWithReferences.dashboard.layout!.sections[1].items[0]
            .widget! as IInsightWidget,
        SecondTable: ComplexDashboardWithReferences.dashboard.layout!.sections[1].items[1]
            .widget! as IInsightWidget,
    },
    ThirdSection: {
        Heatmap: ComplexDashboardWithReferences.dashboard.layout!.sections[2].items[0]
            .widget! as IInsightWidget,
    },
};

export const ComplexDashboardListed: IListedDashboard = {
    ref: ComplexDashboardWithReferences.dashboard.ref,
    identifier: ComplexDashboardWithReferences.dashboard.identifier,
    uri: ComplexDashboardWithReferences.dashboard.uri,
    title: ComplexDashboardWithReferences.dashboard.title,
    description: ComplexDashboardWithReferences.dashboard.description,
    updated: ComplexDashboardWithReferences.dashboard.updated,
    created: ComplexDashboardWithReferences.dashboard.created,
    tags: ComplexDashboardWithReferences.dashboard.tags,
    shareStatus: ComplexDashboardWithReferences.dashboard.shareStatus,
    availability: "full",
};
