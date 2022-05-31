// (C) 2021-2022 GoodData Corporation
import { IDashboardWithReferences } from "@gooddata/sdk-backend-spi";
import {
    idRef,
    uriRef,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    IKpiWidget,
    IInsightWidget,
    IListedDashboard,
    IFilterContext,
} from "@gooddata/sdk-model";
import { ReferenceRecordings } from "@gooddata/reference-workspace";

/**
 * A more complex dashboard that has 3 sections (rows).
 *
 * Two attribute filters: Region & Product
 * First row: 6 KPIs, first three without date filtering, second three with full filtering
 * Second row: two tables; same tables, each with 3 measures. first without any filtering whatsoever but with all drills; second with date filter and no attribute filtering, no drills
 * Third row: single heatmap with all filters applied
 */
export const ComplexDashboardIdentifier = "aeis6NlXcL7X";
export const ComplexDashboardWithReferences = ReferenceRecordings.Recordings.metadata.dashboards
    .dash_aeis6NlXcL7X.obj as IDashboardWithReferences;
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
        uriRef: uriRef("/gdc/md/referenceworkspace/obj/1087"),
        idRef: idRef("label.owner.region"),
        sampleElementUri: "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1086/elements?id=460489",
    },
    SecondAttribute: {
        filter: ComplexDashboardFilterContext.filters[2] as IDashboardAttributeFilter,
        uriRef: uriRef("/gdc/md/referenceworkspace/obj/1055"),
        idRef: idRef("label.product.id.name"),
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
