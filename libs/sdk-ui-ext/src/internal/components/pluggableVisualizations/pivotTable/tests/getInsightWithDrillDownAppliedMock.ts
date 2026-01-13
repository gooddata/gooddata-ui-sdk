// (C) 2020-2025 GoodData Corporation

import { ReferenceData, ReferenceMd } from "@gooddata/reference-workspace";
import {
    type IFilter,
    type IInsight,
    type IInsightDefinition,
    type IMeasureDescriptor,
    type ISortItem,
    bucketSetTotals,
    localIdRef,
    modifyAttribute,
    newAttribute,
    newAttributeSort,
    newBucket,
    newInsightDefinition,
    newPositiveAttributeFilter,
    newTotal,
    uriRef,
} from "@gooddata/sdk-model";
import { type IDrillEventIntersectionElement, type IDrillIntersectionAttributeItem } from "@gooddata/sdk-ui";
import { newWidthForAllMeasureColumns, newWidthForAttributeColumn } from "@gooddata/sdk-ui-pivot";

import {
    type IDrillDownDefinition,
    type IVisualizationProperties,
} from "../../../../interfaces/Visualization.js";

const { Department, Region, Status, Won } = ReferenceMd;
const properties: IVisualizationProperties = {
    controls: {
        columnWidths: [
            newWidthForAttributeColumn(Region.Default, 131, false),
            newWidthForAttributeColumn(Status, 125, false),
            newWidthForAttributeColumn(Department.Default, 97, false),
            newWidthForAllMeasureColumns(270),
        ],
    },
    sortItems: [newAttributeSort(Region.Default, "desc"), newAttributeSort(Status)],
};

const filters: IFilter[] = [newPositiveAttributeFilter(Department.Default, ["Inside Sales"])];
const sorts: ISortItem[] = [newAttributeSort(Department.Default)];
const sourceInsightDefinition: IInsightDefinition = newInsightDefinition("visualizationClass-url", (b) => {
    return b
        .title("sourceInsight")
        .buckets([
            newBucket(
                "attribute",
                Region.Default,
                modifyAttribute(Status, (attr) => attr.alias("status alias")),
                Department.Default,
            ),
            bucketSetTotals(newBucket("measure", Won), []),
        ])
        .filters(filters)
        .sorts(sorts)
        .properties(properties);
});

const sourceInsightDefinitionWithTotals: IInsightDefinition = newInsightDefinition(
    "visualizationClass-url",
    (b) => {
        return b
            .title("sourceInsight")
            .buckets([
                newBucket("attribute", Region.Default, Status, Department.Default),
                newBucket("measure", Won, newTotal("nat", Won, Region.Default), newTotal("nat", Won, Status)),
            ])
            .filters(filters)
            .sorts(sorts)
            .properties(properties);
    },
);

const sourceInsight: IInsight = {
    ...sourceInsightDefinition,
    insight: {
        ...sourceInsightDefinition.insight,
        identifier: "sourceInsightIdentifier",
        uri: "/sourceInsightUri",
        ref: uriRef("/sourceInsightUri"),
    },
};

const sourceInsightWithTotals: IInsight = {
    ...sourceInsightDefinitionWithTotals,
    insight: {
        ...sourceInsight.insight,
        ...sourceInsightDefinitionWithTotals.insight,
    },
};

const implicitTargetDF = uriRef("implicitDrillDown-target-uri");
const drillConfig: IDrillDownDefinition = {
    type: "drillDown",
    origin: localIdRef(Status.attribute.localIdentifier),
    target: implicitTargetDF,
};

const measureHeader: IMeasureDescriptor = {
    measureHeaderItem: {
        name: Won.measure.title!,
        format: "#,##0.00",
        localIdentifier: Won.measure.localIdentifier,
        uri: "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/9203",
        identifier: undefined,
    },
};

const departmentDirectSalesUri = ReferenceData.Department.DirectSales.uri!;
const departmentHeaderAttributeUri = "departmentHeaderAttributeUri";
const departmentHeader: IDrillIntersectionAttributeItem = {
    attributeHeaderItem: {
        name: "Direct Sales",
        uri: departmentDirectSalesUri,
    },
    attributeHeader: {
        name: Department.Default.attribute.alias!,
        localIdentifier: Department.Default.attribute.localIdentifier,
        uri: departmentHeaderAttributeUri,
        ref: {
            uri: departmentHeaderAttributeUri,
        },
        identifier: "mock-identifier",
        formOf: {
            identifier: "mock-attribute",
            name: "Mock Attribute",
            ref: { uri: departmentHeaderAttributeUri },
            uri: departmentHeaderAttributeUri,
        },
        primaryLabel: {
            uri: departmentHeaderAttributeUri,
        },
    },
};

const statusLostUri = ReferenceData.Status.Lost.uri!;
const statusHeaderAttributeUri = "statusHeaderAttributeUri";
const statusHeader: IDrillIntersectionAttributeItem = {
    attributeHeaderItem: {
        name: "Lost",
        uri: statusLostUri,
    },
    attributeHeader: {
        name: Status.attribute.alias!,
        localIdentifier: Status.attribute.localIdentifier,
        uri: statusHeaderAttributeUri,
        ref: {
            uri: statusHeaderAttributeUri,
        },
        identifier: "mock-identifier",
        formOf: {
            identifier: "mock-attribute",
            name: "Mock Attribute",
            ref: { uri: statusHeaderAttributeUri },
            uri: statusHeaderAttributeUri,
        },
        primaryLabel: {
            uri: statusHeaderAttributeUri,
        },
    },
};

const regionEastCoastUri = ReferenceData.Region.EastCoast.uri!;
const regionHeaderAttributeUri = "regionHeaderAttributeUri";
const regionHeader: IDrillIntersectionAttributeItem = {
    attributeHeaderItem: {
        name: "East Coast",
        uri: regionEastCoastUri,
    },
    attributeHeader: {
        name: Region.Default.attribute.alias!,
        localIdentifier: Region.Default.attribute.localIdentifier,
        uri: regionHeaderAttributeUri,
        ref: {
            uri: regionHeaderAttributeUri,
        },
        identifier: "mock-identifier",
        formOf: {
            identifier: "mock-attribute",
            name: "Mock Attribute",
            ref: { uri: regionHeaderAttributeUri },
            uri: regionHeaderAttributeUri,
        },
        primaryLabel: {
            uri: regionHeaderAttributeUri,
        },
    },
};

const intersection: IDrillEventIntersectionElement[] = [
    {
        header: measureHeader,
    },
    {
        header: departmentHeader,
    },
    {
        header: statusHeader,
    },
    {
        header: regionHeader,
    },
];

const expectedProperties: IVisualizationProperties = {
    ...sourceInsight.insight.properties,
    controls: {
        columnWidths: [
            newWidthForAttributeColumn(Status, 125, false),
            newWidthForAttributeColumn(Department.Default, 97, false),
            newWidthForAllMeasureColumns(270),
        ],
    },
    sortItems: [newAttributeSort(Region.Default, "desc"), newAttributeSort(Status)],
};

const expectedFilters: IFilter[] = [
    newPositiveAttributeFilter(Department.Default, ["Inside Sales"]),
    newPositiveAttributeFilter(
        modifyAttribute(Department.Default, (a) => a.displayForm(uriRef(departmentHeaderAttributeUri))),
        { uris: [departmentDirectSalesUri] },
    ),
    newPositiveAttributeFilter(
        modifyAttribute(Status, (a) => a.displayForm(uriRef(statusHeaderAttributeUri))),
        { uris: [statusLostUri] },
    ),
    newPositiveAttributeFilter(
        modifyAttribute(Region.Default, (a) => a.displayForm(uriRef(regionHeaderAttributeUri))),
        { uris: [regionEastCoastUri] },
    ),
];

const expectedInsightDefinition: IInsightDefinition = newInsightDefinition(
    sourceInsight.insight.visualizationUrl,
    (b) => {
        return b
            .title(sourceInsight.insight.title)
            .buckets([
                newBucket(
                    "attribute",
                    newAttribute(implicitTargetDF, (attr) => attr.localId(Status.attribute.localIdentifier)),
                    Department.Default,
                ),
                bucketSetTotals(newBucket("measure", Won), []),
            ])
            .filters(expectedFilters)
            .sorts([newAttributeSort(Department.Default)])
            .properties(expectedProperties);
    },
);

const expectedInsightDefinitionWithTotals: IInsightDefinition = newInsightDefinition(
    sourceInsight.insight.visualizationUrl,
    (b) => {
        return b
            .title(sourceInsight.insight.title)
            .buckets([
                newBucket(
                    "attribute",
                    newAttribute(implicitTargetDF, (attr) => attr.localId(Status.attribute.localIdentifier)),
                    Department.Default,
                ),
                newBucket("measure", Won, newTotal("nat", Won, Status)),
            ])
            .filters(expectedFilters)
            .sorts([newAttributeSort(Department.Default)])
            .properties(expectedProperties);
    },
);

const expectedInsight: IInsight = {
    ...expectedInsightDefinition,
    insight: {
        ...expectedInsightDefinition.insight,
        identifier: sourceInsight.insight.identifier,
        uri: sourceInsight.insight.uri,
        ref: uriRef(sourceInsight.insight.uri),
    },
};

const expectedInsightWithTotals: IInsight = {
    ...expectedInsightDefinitionWithTotals,
    insight: {
        ...expectedInsightDefinitionWithTotals.insight,
        identifier: sourceInsight.insight.identifier,
        uri: sourceInsight.insight.uri,
        ref: uriRef(sourceInsight.insight.uri),
    },
};

export const getInsightWithDrillDownApplied = {
    properties,
    sourceInsight,
    sourceInsightWithTotals,
    drillConfig,
    expectedInsight,
    expectedInsightWithTotals,
    intersection,
};
