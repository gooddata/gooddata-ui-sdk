// (C) 2020-2021 GoodData Corporation

import {
    IInsightDefinition,
    newAttribute,
    newBucket,
    newInsightDefinition,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    uriRef,
} from "@gooddata/sdk-model";
import { ReferenceData, ReferenceMd } from "@gooddata/reference-workspace";
import { IDrillEventIntersectionElement } from "@gooddata/sdk-ui";

const regionUri = "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/1024";
const departmentUri = "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/1027";
const westCoastUri = ReferenceData.Region.WestCoast.uri;
const directSalesUri = ReferenceData.Department.DirectSales.uri;
const { Department, Region, Won } = ReferenceMd;

export const targetUri = "target-uri";

export const intersection: IDrillEventIntersectionElement[] = [
    {
        header: {
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
        },
    },
    {
        header: {
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
        },
    },
    {
        header: {
            measureHeaderItem: {
                name: Won.measure.title,
                format: "#,##0.00",
                localIdentifier: Won.measure.localIdentifier,
                uri: "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/9203",
                identifier: null,
            },
        },
    },
];

export const sourceInsightDef: IInsightDefinition = newInsightDefinition("visualizationClass-url", (b) => {
    return b
        .title("sourceInsight")
        .buckets([newBucket("measure", Won), newBucket("view", Department), newBucket("segment", Region)])
        .filters([newNegativeAttributeFilter(Department, [])]);
});

const replacedAttributeRegion = newAttribute(uriRef(targetUri), (b) =>
    b.localId(Region.attribute.localIdentifier),
);

const replacedAttributeDepartment = newAttribute(uriRef(targetUri), (b) =>
    b.localId(Department.attribute.localIdentifier),
);

export const expectedInsightDefRegion: IInsightDefinition = newInsightDefinition(
    "visualizationClass-url",
    (b) => {
        return b
            .title("sourceInsight")
            .buckets([
                newBucket("measure", Won),
                newBucket("view", Department),
                newBucket("segment", replacedAttributeRegion),
            ])
            .filters([
                newNegativeAttributeFilter(Department, []),
                newPositiveAttributeFilter(newAttribute(uriRef(regionUri)), {
                    uris: [westCoastUri],
                }),
                newPositiveAttributeFilter(newAttribute(uriRef(departmentUri)), {
                    uris: [directSalesUri],
                }),
            ]);
    },
);

export const expectedInsightDefDepartment: IInsightDefinition = newInsightDefinition(
    "visualizationClass-url",
    (b) => {
        return b
            .title("sourceInsight")
            .buckets([
                newBucket("measure", Won),
                newBucket("view", replacedAttributeDepartment),
                newBucket("segment", Region),
            ])
            .filters([
                newNegativeAttributeFilter(Department, []),
                newPositiveAttributeFilter(newAttribute(uriRef(departmentUri)), {
                    uris: [directSalesUri],
                }),
            ]);
    },
);
