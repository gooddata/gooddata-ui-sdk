// (C) 2020-2025 GoodData Corporation
import { ReferenceData, ReferenceMd } from "@gooddata/reference-workspace";
import {
    type IInsightDefinition,
    type IMeasureDescriptor,
    modifyAttribute,
    newAttribute,
    newBucket,
    newInsightDefinition,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    uriRef,
} from "@gooddata/sdk-model";
import { type IDrillEventIntersectionElement, type IDrillIntersectionAttributeItem } from "@gooddata/sdk-ui";

const { Department, Region, Won } = ReferenceMd;

export const targetUri = "target-uri";

export const insightDefinitionWithStackBy: IInsightDefinition = newInsightDefinition(
    "visualizationClass-url",
    (b) => {
        return b
            .title("sourceInsight")
            .buckets([
                newBucket("measure", Won),
                newBucket("stack", Region.Default),
                newBucket("view", Department.Default),
            ])
            .filters([newNegativeAttributeFilter(Department.Default, [])]);
    },
);

export const insightDefinition: IInsightDefinition = newInsightDefinition("visualizationClass-url", (b) => {
    return b
        .title("sourceInsight")
        .buckets([newBucket("measure", Won), newBucket("view", Department.Default, Region.Default)])
        .filters([newNegativeAttributeFilter(Department.Default, [])]);
});

const departmentUri = "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/1027";
const regionUri = "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/1024";

const westCoastUri = ReferenceData.Region.WestCoast.uri;
const directSalesUri = ReferenceData.Department.DirectSales.uri;

export const expectedInsightDefinitionWithStackByDrillToDepartment: IInsightDefinition = newInsightDefinition(
    "visualizationClass-url",
    (b) => {
        return b
            .title("sourceInsight")
            .buckets([
                newBucket("measure", Won),
                newBucket("stack", Region.Default),
                newBucket(
                    "view",
                    newAttribute(uriRef(targetUri), (b) =>
                        b.localId(Department.Default.attribute.localIdentifier),
                    ),
                ),
            ])
            .filters([
                newNegativeAttributeFilter(Department.Default, []),
                newPositiveAttributeFilter(
                    modifyAttribute(Department.Default, (a) => a.displayForm(uriRef(departmentUri))),
                    { uris: [directSalesUri] },
                ),
            ]);
    },
);

export const expectedInsightDefinitionWithStackByDrillToRegion: IInsightDefinition = newInsightDefinition(
    "visualizationClass-url",
    (b) => {
        return b
            .title("sourceInsight")
            .buckets([
                newBucket("measure", Won),
                newBucket(
                    "stack",
                    newAttribute(uriRef(targetUri), (b) =>
                        b.localId(Region.Default.attribute.localIdentifier),
                    ),
                ),
                newBucket("view", Department.Default),
            ])
            .filters([
                newNegativeAttributeFilter(Department.Default, []),
                newPositiveAttributeFilter(
                    modifyAttribute(Region.Default, (a) => a.displayForm(uriRef(regionUri))),
                    { uris: [westCoastUri] },
                ),
                newPositiveAttributeFilter(
                    modifyAttribute(Department.Default, (a) => a.displayForm(uriRef(departmentUri))),
                    { uris: [directSalesUri] },
                ),
            ]);
    },
);

export const expectedInsightDefinitionDrillToRegion: IInsightDefinition = newInsightDefinition(
    "visualizationClass-url",
    (b) => {
        return b
            .title("sourceInsight")
            .buckets([
                newBucket("measure", Won),
                newBucket(
                    "view",
                    newAttribute(uriRef(targetUri), (b) =>
                        b.localId(Region.Default.attribute.localIdentifier),
                    ),
                ),
            ])
            .filters([
                newNegativeAttributeFilter(Department.Default, []),
                newPositiveAttributeFilter(
                    modifyAttribute(Region.Default, (a) => a.displayForm(uriRef(regionUri))),
                    { uris: [westCoastUri] },
                ),
            ]);
    },
);

export const measureHeader: IMeasureDescriptor = {
    measureHeaderItem: {
        name: Won.measure.title!,
        format: "#,##0.00",
        localIdentifier: Won.measure.localIdentifier,
        uri: "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/9203",
        identifier: null,
    },
};

export const westCoastHeader: IDrillIntersectionAttributeItem = {
    attributeHeaderItem: {
        name: "West Coast",
        uri: westCoastUri,
    },
    attributeHeader: {
        name: Region.Default.attribute.alias!,
        localIdentifier: Region.Default.attribute.localIdentifier,
        uri: regionUri,
        ref: {
            uri: regionUri,
        },
        identifier: null,
        formOf: null,
        primaryLabel: {
            uri: regionUri,
        },
    },
};

export const directSalesHeader: IDrillIntersectionAttributeItem = {
    attributeHeaderItem: {
        name: "Direct Sales",
        uri: directSalesUri,
    },
    attributeHeader: {
        name: Department.Default.attribute.alias!,
        localIdentifier: Department.Default.attribute.localIdentifier,
        uri: departmentUri,
        ref: {
            uri: departmentUri,
        },
        identifier: null,
        formOf: null,
        primaryLabel: {
            uri: departmentUri,
        },
    },
};

export const intersection: IDrillEventIntersectionElement[] = [
    {
        header: measureHeader,
    },
    {
        header: directSalesHeader,
    },
    {
        header: westCoastHeader,
    },
];
