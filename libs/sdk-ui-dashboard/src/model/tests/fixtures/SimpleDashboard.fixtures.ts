// (C) 2021-2023 GoodData Corporation
import { IDashboardWithReferences } from "@gooddata/sdk-backend-spi";
import {
    IFilterContext,
    IDrillToAttributeUrl,
    IDrillToCustomUrl,
    IDrillToDashboard,
    IDrillToInsight,
    IKpiWidget,
    IListedDashboard,
    idRef,
} from "@gooddata/sdk-model";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { IAvailableDrillTargets } from "@gooddata/sdk-ui";
import { ComplexDashboardIdentifier } from "./ComplexDashboard.fixtures";
import { IInaccessibleDashboard } from "../../types/inaccessibleDashboardTypes.js";

export const SimpleDashboardIdentifier = "aaRaEZRWdRpQ";
export const SimpleDashboardWithReferences = ReferenceRecordings.Recordings.metadata.dashboards
    .dash_aaRaEZRWdRpQ.obj as IDashboardWithReferences;
export const SimpleDashboardLayout = SimpleDashboardWithReferences.dashboard.layout!;
export const SimpleDashboardFilterContext = SimpleDashboardWithReferences.dashboard
    .filterContext as IFilterContext;

/**
 * drillToAttributeUrl on simple dashboard
 */
export const drillToAttributeUrlWidgetRef = (SimpleDashboardLayout.sections[2].items[0].widget as any).ref;

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
export const SimpleSortedTableWidgetInsightIdentifier =
    SimpleDashboardWithReferences.references.insights[2].insight.identifier;
export const SimpleSortedTableWidgetInsight = SimpleDashboardWithReferences.references.insights[2];
/**
 * localIdentifier of Won Measure of Simple SortedTable Widget on Simple Dashboard
 */
export const SimpleDashboardSimpleSortedTableWonMeasureLocalIdentifier = "31c22194386b408aa80ab90b966e85a7";
export const SimpleDashboardSimpleSortedTableProductAttributeLocalIdentifier =
    "3b196b9f8de04b61ba37762fa28fcf4f";

/**
 * simple dashboard drillToAttributeUrl NumOfOpportunities measure identifier
 */
export const NumOfOpportunitiesMeasureIdentifier = "8e874c44107d41809d0d5e7bbd1c19ff";

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
                    uri: "/gdc/md/referenceworkspace/obj/1272",
                    identifier: "acugFHNJgsBy",
                    ref: {
                        uri: "/gdc/md/referenceworkspace/obj/1272",
                    },
                },
            },
            attributes: [
                {
                    attributeHeader: {
                        name: "Product Name",
                        localIdentifier: "3b196b9f8de04b61ba37762fa28fcf4f",
                        uri: "/gdc/md/referenceworkspace/obj/1055",
                        identifier: "label.product.id.name",
                        formOf: {
                            name: "Product",
                            uri: "/gdc/md/referenceworkspace/obj/1054",
                            identifier: "attr.product.id",
                            ref: {
                                uri: "/gdc/md/referenceworkspace/obj/1054",
                            },
                        },
                        ref: {
                            uri: "/gdc/md/referenceworkspace/obj/1055",
                        },
                    },
                },
                {
                    attributeHeader: {
                        name: "Department",
                        localIdentifier: "d25f36e4914f4ed18ee6b057d18decd9",
                        uri: "/gdc/md/referenceworkspace/obj/1089",
                        identifier: "label.owner.department",
                        formOf: {
                            name: "Department",
                            uri: "/gdc/md/referenceworkspace/obj/1088",
                            identifier: "attr.owner.department",
                            ref: {
                                uri: "/gdc/md/referenceworkspace/obj/1088",
                            },
                        },
                        ref: {
                            uri: "/gdc/md/referenceworkspace/obj/1089",
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
                    uri: "/gdc/md/referenceworkspace/obj/1055",
                    identifier: "label.product.id.name",
                    formOf: {
                        name: "Product",
                        uri: "/gdc/md/referenceworkspace/obj/1054",
                        identifier: "attr.product.id",
                        ref: {
                            uri: "/gdc/md/referenceworkspace/obj/1054",
                        },
                    },
                    ref: {
                        uri: "/gdc/md/referenceworkspace/obj/1055",
                    },
                },
            },
            intersectionAttributes: [
                {
                    attributeHeader: {
                        name: "Product Name",
                        localIdentifier: "3b196b9f8de04b61ba37762fa28fcf4f",
                        uri: "/gdc/md/referenceworkspace/obj/1055",
                        identifier: "label.product.id.name",
                        formOf: {
                            name: "Product",
                            uri: "/gdc/md/referenceworkspace/obj/1054",
                            identifier: "attr.product.id",
                            ref: {
                                uri: "/gdc/md/referenceworkspace/obj/1054",
                            },
                        },
                        ref: {
                            uri: "/gdc/md/referenceworkspace/obj/1055",
                        },
                    },
                },
            ],
        },
    ],
};

export const SimpleDashboarddrillToAttributeUrlWidgetDrillTargets: IAvailableDrillTargets = {
    measures: [
        {
            measure: {
                measureHeaderItem: {
                    name: "# Of Opportunities",
                    format: "#,##0.00",
                    localIdentifier: "8e874c44107d41809d0d5e7bbd1c19ff",
                    uri: "/gdc/md/referenceworkspace/obj/1268",
                    identifier: "abQgDWx4gOUu",
                    ref: {
                        uri: "/gdc/md/referenceworkspace/obj/1268",
                    },
                },
            },
            attributes: [
                {
                    attributeHeader: {
                        name: "Opportunity Name",
                        localIdentifier: "a75a78a7e2194c339b4f6b8694777803",
                        uri: "/gdc/md/referenceworkspace/obj/1067",
                        identifier: "label.opportunity.id.name",
                        formOf: {
                            name: "Opportunity",
                            uri: "/gdc/md/referenceworkspace/obj/1066",
                            identifier: "attr.opportunity.id",
                            ref: {
                                uri: "/gdc/md/referenceworkspace/obj/1066",
                            },
                        },
                        ref: {
                            uri: "/gdc/md/referenceworkspace/obj/1067",
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
                    name: "Opportunity Name",
                    localIdentifier: "a75a78a7e2194c339b4f6b8694777803",
                    uri: "/gdc/md/referenceworkspace/obj/1067",
                    identifier: "label.opportunity.id.name",
                    formOf: {
                        name: "Opportunity",
                        uri: "/gdc/md/referenceworkspace/obj/1066",
                        identifier: "attr.opportunity.id",
                        ref: {
                            uri: "/gdc/md/referenceworkspace/obj/1066",
                        },
                    },
                    ref: {
                        uri: "/gdc/md/referenceworkspace/obj/1067",
                    },
                },
            },
            intersectionAttributes: [
                {
                    attributeHeader: {
                        name: "Opportunity Name",
                        localIdentifier: "a75a78a7e2194c339b4f6b8694777803",
                        uri: "/gdc/md/referenceworkspace/obj/1067",
                        identifier: "label.opportunity.id.name",
                        formOf: {
                            name: "Opportunity",
                            uri: "/gdc/md/referenceworkspace/obj/1066",
                            identifier: "attr.opportunity.id",
                            ref: {
                                uri: "/gdc/md/referenceworkspace/obj/1066",
                            },
                        },
                        ref: {
                            uri: "/gdc/md/referenceworkspace/obj/1067",
                        },
                    },
                },
            ],
        },
    ],
};

export const DrillToDashboardFromWonMeasureDefinition: IDrillToDashboard = {
    type: "drillToDashboard",
    origin: {
        type: "drillFromMeasure",
        measure: {
            localIdentifier: SimpleDashboardSimpleSortedTableWonMeasureLocalIdentifier,
        },
    },
    target: {
        identifier: ComplexDashboardIdentifier,
        type: "analyticalDashboard",
    },
    transition: "in-place",
};

export const DrillToDashboardFromProductAttributeDefinition: IDrillToDashboard = {
    type: "drillToDashboard",
    origin: {
        type: "drillFromAttribute",
        attribute: {
            localIdentifier: SimpleDashboardSimpleSortedTableProductAttributeLocalIdentifier,
        },
    },
    target: {
        identifier: ComplexDashboardIdentifier,
        type: "analyticalDashboard",
    },
    transition: "in-place",
};

export const DrillToToInsightFromWonMeasureDefinition: IDrillToInsight = {
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

export const DrillToCustomUrlFromMeasureDefinition: IDrillToCustomUrl = {
    type: "drillToCustomUrl",
    transition: "new-window",
    origin: {
        type: "drillFromMeasure",
        measure: {
            localIdentifier: SimpleDashboardSimpleSortedTableWonMeasureLocalIdentifier,
        },
    },
    target: {
        url: "https://www.example.org?dep={attribute_title(label.owner.department)}",
    },
};

export const DrillToAttributeUrlFromMeasureDefinition: IDrillToAttributeUrl = {
    type: "drillToAttributeUrl",
    transition: "new-window",
    origin: {
        type: "drillFromMeasure",
        measure: {
            localIdentifier: NumOfOpportunitiesMeasureIdentifier,
        },
    },
    target: {
        displayForm: {
            uri: "/gdc/md/referenceworkspace/obj/1067",
        },
        hyperlinkDisplayForm: {
            uri: "/gdc/md/referenceworkspace/obj/1069",
        },
    },
};

export const InaccessibleDashboard: IInaccessibleDashboard = {
    title: "Inaccessible Dashboard",
    ref: idRef("inaccessibleDashboardId"),
    uri: "inaccessibleDashboardUri",
    identifier: "inaccessibleDashboardId",
};

export const SimpleDashboardListed: IListedDashboard = {
    ref: SimpleDashboardWithReferences.dashboard.ref,
    identifier: SimpleDashboardWithReferences.dashboard.identifier,
    uri: SimpleDashboardWithReferences.dashboard.uri,
    title: SimpleDashboardWithReferences.dashboard.title,
    description: SimpleDashboardWithReferences.dashboard.description,
    updated: SimpleDashboardWithReferences.dashboard.updated,
    created: SimpleDashboardWithReferences.dashboard.created,
    tags: SimpleDashboardWithReferences.dashboard.tags,
    shareStatus: SimpleDashboardWithReferences.dashboard.shareStatus,
    availability: "full",
};
