// (C) 2021 GoodData Corporation

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import {
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    IDashboardLayoutItem,
    IDashboardLayoutSectionHeader,
    IDashboardWithReferences,
    IDrillToDashboard,
    IInsightWidget,
    IKpiWidget,
    IListedDashboard,
} from "@gooddata/sdk-backend-spi";
import { idRef, IInsight, insightId, isObjRef, ObjRef, uriRef } from "@gooddata/sdk-model";
import { InsightPlaceholderWidget, KpiPlaceholderWidget } from "../types/layoutTypes";
import { recordedInsight } from "@gooddata/sdk-backend-mockingbird";
import { IAvailableDrillTargets } from "@gooddata/sdk-ui";
import { IDrillToInsight } from "@gooddata/sdk-backend-spi";

//
// Basic constants and building blocks used in tests
//

export const TestCorrelation = "testCorrelationId";
export const TestStash = "testStash";
export const BeforeTestCorrelation = "beforeTestId";

export const TestSectionHeader: IDashboardLayoutSectionHeader = {
    title: "Test Section",
    description: "Section added for test purposes",
};

//
// Pointers into reference workspace entities. For convenience and unification.
//

export const SimpleDashboardIdentifier = "aaRaEZRWdRpQ";
export const SimpleDashboardWithReferences = ReferenceRecordings.Recordings.metadata.dashboards
    .dash_aaRaEZRWdRpQ.obj as IDashboardWithReferences;
export const SimpleDashboardLayout = SimpleDashboardWithReferences.dashboard.layout!;

/**
 * First widget from first section
 */
export const KpiWidgetRef = (SimpleDashboardLayout.sections[0].items[0].widget as IKpiWidget).ref;

/**
 * First widget from second section
 */
export const SimpleSortedTableWidgetRef = (SimpleDashboardLayout.sections[1].items[0].widget as any).ref;
export const SimpleSortedTableWidgetInsightRef =
    SimpleDashboardWithReferences.references.insights[2].insight.ref;
export const SimpleSortedTableWidgetInsightIdentifer =
    SimpleDashboardWithReferences.references.insights[2].insight.identifier;
export const SimpleSortedTableWidgetInsight = SimpleDashboardWithReferences.references.insights[2];

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

export const ComplexDashboardFilterContext = ComplexDashboardWithReferences.dashboard.filterContext!;

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

/**
 * Basic dashboard aimed at testing the widget filters query.
 */
export const FilterTestingDashboardIdentifier = "abr8vSe5exU7";
export const FilterTestingDashboardWithReferences = ReferenceRecordings.Recordings.metadata.dashboards
    .dash_abr8vSe5exU7.obj as IDashboardWithReferences;
export const FilterTestingDashboardWidgets = {
    NoIgnoredFilters: {
        Insight: FilterTestingDashboardWithReferences.dashboard.layout!.sections[0].items[0]
            .widget as IInsightWidget,
        Kpi: FilterTestingDashboardWithReferences.dashboard.layout!.sections[0].items[1].widget as IKpiWidget,
    },
    IgnoredAttributeFilter: {
        Insight: FilterTestingDashboardWithReferences.dashboard.layout!.sections[1].items[0]
            .widget as IInsightWidget,
        Kpi: FilterTestingDashboardWithReferences.dashboard.layout!.sections[1].items[1].widget as IKpiWidget,
    },
    IgnoredDateFilter: {
        Insight: FilterTestingDashboardWithReferences.dashboard.layout!.sections[2].items[0]
            .widget as IInsightWidget,
        Kpi: FilterTestingDashboardWithReferences.dashboard.layout!.sections[2].items[1].widget as IKpiWidget,
    },
};

/**
 * More advanced dashboard aimed at testing the widget filters query.
 */
export const AdvancedFilterTestingDashboardIdentifier = "aaQ8QjLVhNOG";
export const AdvancedFilterTestingDashboardWithReferences = ReferenceRecordings.Recordings.metadata.dashboards
    .dash_aaQ8QjLVhNOG.obj as IDashboardWithReferences;
export const AdvancedFilterTestingDashboardWidgets = {
    InsightWithOwnAttributeFilter: AdvancedFilterTestingDashboardWithReferences.dashboard.layout!.sections[0]
        .items[0].widget as IInsightWidget,
    InsightWithOwnDateFilter: AdvancedFilterTestingDashboardWithReferences.dashboard.layout!.sections[0]
        .items[1].widget as IInsightWidget,
    InsightWithOwnRankingFilter: AdvancedFilterTestingDashboardWithReferences.dashboard.layout!.sections[0]
        .items[2].widget as IInsightWidget,
    InsightWithOwnMeasureValueFilter: AdvancedFilterTestingDashboardWithReferences.dashboard.layout!
        .sections[0].items[3].widget as IInsightWidget,

    InsightWithAllMeasuresFilteredByDate: AdvancedFilterTestingDashboardWithReferences.dashboard.layout!
        .sections[1].items[0].widget as IInsightWidget,
    InsightWithSomeMeasuresFilteredByDate: AdvancedFilterTestingDashboardWithReferences.dashboard.layout!
        .sections[1].items[1].widget as IInsightWidget,

    InsightConnectedToDifferentDateDimensionThanIsUsedInItsOwnFilter:
        AdvancedFilterTestingDashboardWithReferences.dashboard.layout!.sections[2].items[0]
            .widget as IInsightWidget,
};

//
//
//

export const EmptyDashboardIdentifier = "emptyDashboard";
export const EmptyDashboardWithReferences = ReferenceRecordings.Recordings.metadata.dashboards
    .dash_emptyDashboard.obj as IDashboardWithReferences;

export const PivotTableWithRowAndColumnAttributes = recordedInsight(
    ReferenceRecordings.Insights.PivotTable.SingleMeasureWithTwoRowAndTwoColumnAttributes,
);

export const PivotTableWithDateFilter = recordedInsight(
    ReferenceRecordings.Insights.PivotTable.WithDateFilter,
);

export const PivotTableWithTwoSameDates = recordedInsight(
    ReferenceRecordings.Insights.PivotTable.WithTwoSameDates,
);

export const TreemapWithSingleMeasureAndViewByFilteredToOneElement = recordedInsight(
    ReferenceRecordings.Insights.Treemap.SingleMeasureAndViewByFilteredToOneElement,
);

export const TreemapWithOneMeasureAndViewByDateAndSegmentByDate = recordedInsight(
    ReferenceRecordings.Insights.Treemap.WithOneMeasureAndViewByDateAndSegmentByDate,
);

//
// Test placeholders
//

export const TestKpiPlaceholderWidget: KpiPlaceholderWidget = {
    type: "kpiPlaceholder",
};

export const TestKpiPlaceholderItem: IDashboardLayoutItem<KpiPlaceholderWidget> = {
    type: "IDashboardLayoutItem",
    widget: TestKpiPlaceholderWidget,
    size: {
        xl: {
            gridWidth: 2,
        },
    },
};

export const TestInsightPlaceholderWidget: InsightPlaceholderWidget = {
    type: "insightPlaceholder",
};

export const TestInsightPlaceholderItem: IDashboardLayoutItem<InsightPlaceholderWidget> = {
    type: "IDashboardLayoutItem",
    widget: TestInsightPlaceholderWidget,
    size: {
        xl: {
            gridWidth: 2,
        },
    },
};

//
//
//

export const TestInsightItem: IDashboardLayoutItem<IInsightWidget> = createTestInsightItem(
    PivotTableWithRowAndColumnAttributes,
);

export function createTestInsightItem(
    insightOrInsightRef: IInsight | ObjRef,
): IDashboardLayoutItem<IInsightWidget> {
    const insightRef = isObjRef(insightOrInsightRef)
        ? insightOrInsightRef
        : idRef(insightId(insightOrInsightRef), "insight");

    return {
        type: "IDashboardLayoutItem",
        widget: {
            type: "insight",
            insight: insightRef,
            ref: idRef("newWidget"),
            uri: "newWidgetUri",
            identifier: "newWidgetIdentifier",
            ignoreDashboardFilters: [],
            drills: [],
            title: "Test Insight Item",
            description: "",
        },
        size: {
            xl: {
                gridWidth: 2,
            },
        },
    };
}

/**
 * localIdentifier of Won Measure of Simple SortedTable Widget on Simple Dashboard
 */
export const SimpleDashboardSimpleSortedTableWonMeasureLocalIdentifier = "31c22194386b408aa80ab90b966e85a7";

export const SimpleDashboardSimpleSortedTableProductAttributeLocalIdentifier =
    "3b196b9f8de04b61ba37762fa28fcf4f";

/**
 * This mock is real reported drillTargets after firs render
 */
export const SimpleDashboardSimpleSortedTableWidgetDrillTargets: IAvailableDrillTargets = {
    measures: [
        {
            measure: {
                measureHeaderItem: {
                    name: "Won",
                    format: "$#,##0.00",
                    localIdentifier: SimpleDashboardSimpleSortedTableWonMeasureLocalIdentifier,
                    uri: "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1272",
                    identifier: "acugFHNJgsBy",
                    ref: {
                        uri: "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1272",
                    },
                },
            },
            attributes: [
                {
                    attributeHeader: {
                        name: "Product Name",
                        localIdentifier: "3b196b9f8de04b61ba37762fa28fcf4f",
                        uri: "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1055",
                        identifier: "label.product.id.name",
                        formOf: {
                            name: "Product",
                            uri: "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1054",
                            identifier: "attr.product.id",
                            ref: {
                                uri: "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1054",
                            },
                        },
                        ref: {
                            uri: "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1055",
                        },
                    },
                },
                {
                    attributeHeader: {
                        name: "Department",
                        localIdentifier: "d25f36e4914f4ed18ee6b057d18decd9",
                        uri: "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1089",
                        identifier: "label.owner.department",
                        formOf: {
                            name: "Department",
                            uri: "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1088",
                            identifier: "attr.owner.department",
                            ref: {
                                uri: "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1088",
                            },
                        },
                        ref: {
                            uri: "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1089",
                        },
                    },
                },
            ],
        },
    ],
    attributes: [
        {
            attribute: {
                attributeHeader: {
                    name: "Product Name",
                    localIdentifier: SimpleDashboardSimpleSortedTableProductAttributeLocalIdentifier,
                    uri: "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1055",
                    identifier: "label.product.id.name",
                    formOf: {
                        name: "Product",
                        uri: "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1054",
                        identifier: "attr.product.id",
                        ref: {
                            uri: "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1054",
                        },
                    },
                    ref: {
                        uri: "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1055",
                    },
                },
            },
            intersectionAttributes: [
                {
                    attributeHeader: {
                        name: "Product Name",
                        localIdentifier: "3b196b9f8de04b61ba37762fa28fcf4f",
                        uri: "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1055",
                        identifier: "label.product.id.name",
                        formOf: {
                            name: "Product",
                            uri: "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1054",
                            identifier: "attr.product.id",
                            ref: {
                                uri: "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1054",
                            },
                        },
                        ref: {
                            uri: "/gdc/md/l32xdyl4bjuzgf9kkqr2avl55gtuyjwf/obj/1055",
                        },
                    },
                },
            ],
        },
    ],
};

export const drillToDashboardFromWonMeasureDefinition: IDrillToDashboard = {
    type: "drillToDashboard",
    origin: {
        type: "drillFromMeasure",
        measure: {
            localIdentifier: SimpleDashboardSimpleSortedTableWonMeasureLocalIdentifier,
        },
    },
    target: {
        identifier: ComplexDashboardIdentifier,
    },
    transition: "in-place",
};

export const drillToDashboardFromProductAttributeDefinition: IDrillToDashboard = {
    type: "drillToDashboard",
    origin: {
        type: "drillFromAttribute",
        attribute: {
            localIdentifier: SimpleDashboardSimpleSortedTableProductAttributeLocalIdentifier,
        },
    },
    target: {
        identifier: ComplexDashboardIdentifier,
    },
    transition: "in-place",
};

export const drillToToInsightFromWonMeasureDefinition: IDrillToInsight = {
    type: "drillToInsight",
    origin: {
        type: "drillFromMeasure",
        measure: {
            localIdentifier: SimpleDashboardSimpleSortedTableWonMeasureLocalIdentifier,
        },
    },
    transition: "pop-up",
    target: SimpleSortedTableWidgetInsightRef,
};

const ComplexDashboardListed: IListedDashboard = {
    ref: ComplexDashboardWithReferences.dashboard.ref,
    identifier: ComplexDashboardWithReferences.dashboard.identifier,
    uri: ComplexDashboardWithReferences.dashboard.uri,
    title: ComplexDashboardWithReferences.dashboard.title,
    description: ComplexDashboardWithReferences.dashboard.description,
    updated: ComplexDashboardWithReferences.dashboard.updated,
    created: ComplexDashboardWithReferences.dashboard.created,
    tags: ComplexDashboardWithReferences.dashboard.tags,
};

const SimpleDashboardListed: IListedDashboard = {
    ref: SimpleDashboardWithReferences.dashboard.ref,
    identifier: SimpleDashboardWithReferences.dashboard.identifier,
    uri: SimpleDashboardWithReferences.dashboard.uri,
    title: SimpleDashboardWithReferences.dashboard.title,
    description: SimpleDashboardWithReferences.dashboard.description,
    updated: SimpleDashboardWithReferences.dashboard.updated,
    created: SimpleDashboardWithReferences.dashboard.created,
    tags: SimpleDashboardWithReferences.dashboard.tags,
};

export const dashboardsList: IListedDashboard[] = [SimpleDashboardListed, ComplexDashboardListed];
