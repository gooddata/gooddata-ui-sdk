// (C) 2020-2022 GoodData Corporation
import {
    IInsightDefinition,
    modifyAttribute,
    newAttribute,
    newBucket,
    newInsightDefinition,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    uriRef,
    IMeasureDescriptor,
} from "@gooddata/sdk-model";
import { ReferenceData, ReferenceMd } from "@gooddata/reference-workspace";
import { IDrillEventIntersectionElement, IDrillIntersectionAttributeItem } from "@gooddata/sdk-ui";

const { Department, Region, Won } = ReferenceMd;

export const targetUri = "target-uri";

export const insightDefinitionWithStackBy: IInsightDefinition = newInsightDefinition(
    "visualizationClass-url",
    (b) => {
        return b
            .title("sourceInsight")
            .buckets([newBucket("measure", Won), newBucket("stack", Region), newBucket("view", Department)])
            .filters([newNegativeAttributeFilter(Department, [])]);
    },
);

export const insightDefinition: IInsightDefinition = newInsightDefinition("visualizationClass-url", (b) => {
    return b
        .title("sourceInsight")
        .buckets([newBucket("measure", Won), newBucket("view", Department, Region)])
        .filters([newNegativeAttributeFilter(Department, [])]);
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
                newBucket("stack", Region),
                newBucket(
                    "view",
                    newAttribute(uriRef(targetUri), (b) => b.localId(Department.attribute.localIdentifier)),
                ),
            ])
            .filters([
                newNegativeAttributeFilter(Department, []),
                newPositiveAttributeFilter(
                    modifyAttribute(Department, (a) => a.displayForm(uriRef(departmentUri))),
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
                    newAttribute(uriRef(targetUri), (b) => b.localId(Region.attribute.localIdentifier)),
                ),
                newBucket("view", Department),
            ])
            .filters([
                newNegativeAttributeFilter(Department, []),
                newPositiveAttributeFilter(
                    modifyAttribute(Region, (a) => a.displayForm(uriRef(regionUri))),
                    { uris: [westCoastUri] },
                ),
                newPositiveAttributeFilter(
                    modifyAttribute(Department, (a) => a.displayForm(uriRef(departmentUri))),
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
                    newAttribute(uriRef(targetUri), (b) => b.localId(Region.attribute.localIdentifier)),
                ),
            ])
            .filters([
                newNegativeAttributeFilter(Department, []),
                newPositiveAttributeFilter(
                    modifyAttribute(Region, (a) => a.displayForm(uriRef(regionUri))),
                    { uris: [westCoastUri] },
                ),
            ]);
    },
);

export const measureHeader: IMeasureDescriptor = {
    measureHeaderItem: {
        name: Won.measure.title,
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
        name: Region.attribute.alias,
        localIdentifier: Region.attribute.localIdentifier,
        uri: regionUri,
        ref: {
            uri: regionUri,
        },
        identifier: null,
        formOf: null,
    },
};

export const directSalesHeader: IDrillIntersectionAttributeItem = {
    attributeHeaderItem: {
        name: "Direct Sales",
        uri: directSalesUri,
    },
    attributeHeader: {
        name: Department.attribute.alias,
        localIdentifier: Department.attribute.localIdentifier,
        uri: departmentUri,
        ref: {
            uri: departmentUri,
        },
        identifier: null,
        formOf: null,
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
