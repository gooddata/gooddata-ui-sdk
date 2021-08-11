// (C) 2021 GoodData Corporation
import {
    IDashboardWithReferences,
    IDrillToDashboard,
    IDrillToInsight,
    IKpiWidget,
    IListedDashboard,
} from "@gooddata/sdk-backend-spi";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { IAvailableDrillTargets } from "@gooddata/sdk-ui";
import { ComplexDashboardIdentifier } from "./ComplexDashboard.fixtures";

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
export const SimpleDashboardListed: IListedDashboard = {
    ref: SimpleDashboardWithReferences.dashboard.ref,
    identifier: SimpleDashboardWithReferences.dashboard.identifier,
    uri: SimpleDashboardWithReferences.dashboard.uri,
    title: SimpleDashboardWithReferences.dashboard.title,
    description: SimpleDashboardWithReferences.dashboard.description,
    updated: SimpleDashboardWithReferences.dashboard.updated,
    created: SimpleDashboardWithReferences.dashboard.created,
    tags: SimpleDashboardWithReferences.dashboard.tags,
};
