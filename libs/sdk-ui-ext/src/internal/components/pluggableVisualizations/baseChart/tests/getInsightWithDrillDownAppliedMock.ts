// (C) 2020-2021 GoodData Corporation

import {
    newAttribute,
    IInsightDefinition,
    newInsightDefinition,
    newBucket,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    uriRef,
} from "@gooddata/sdk-model";
import { ReferenceData, ReferenceMd } from "@gooddata/reference-workspace";
import { IDrillEventIntersectionElement } from "@gooddata/sdk-ui";

const { Department, Region, Won } = ReferenceMd;
const regionUri = "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/1024";
const departmentUri = "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/1027";
const westCoastUri = ReferenceData.Region.WestCoast.uri;
const directSalesUri = ReferenceData.Department.DirectSales.uri;

export const targetUri = "target-uri";

export const intersection: IDrillEventIntersectionElement[] = [
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
];

export const sourceInsightDef: IInsightDefinition = newInsightDefinition("visualizationClass-url", (b) => {
    return b
        .title("sourceInsight")
        .buckets([newBucket("measure", Won), newBucket("view", Region, Department)])
        .filters([newNegativeAttributeFilter(Department, [])]);
});

const replacedAttributeRegion = newAttribute(uriRef(targetUri), (b) =>
    b.localId(Region.attribute.localIdentifier),
);

export const expectedInsightDefRegion: IInsightDefinition = newInsightDefinition(
    "visualizationClass-url",
    (b) => {
        return b
            .title("sourceInsight")
            .buckets([newBucket("measure", Won), newBucket("view", replacedAttributeRegion, Department)])
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
