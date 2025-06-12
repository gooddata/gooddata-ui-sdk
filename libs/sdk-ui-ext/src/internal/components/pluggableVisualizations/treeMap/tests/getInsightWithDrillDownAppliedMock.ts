// (C) 2020-2024 GoodData Corporation

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
        },
    },
    {
        header: {
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
        },
    },
    {
        header: {
            measureHeaderItem: {
                name: Won.measure.title!,
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
        .buckets([
            newBucket("measure", Won),
            newBucket("view", Department.Default),
            newBucket("segment", Region.Default),
        ])
        .filters([newNegativeAttributeFilter(Department.Default, [])]);
});

const replacedAttributeRegion = newAttribute(uriRef(targetUri), (b) =>
    b.localId(Region.Default.attribute.localIdentifier),
);

const replacedAttributeDepartment = newAttribute(uriRef(targetUri), (b) =>
    b.localId(Department.Default.attribute.localIdentifier),
);

export const expectedInsightDefRegion: IInsightDefinition = newInsightDefinition(
    "visualizationClass-url",
    (b) => {
        return b
            .title("sourceInsight")
            .buckets([
                newBucket("measure", Won),
                newBucket("view", Department.Default),
                newBucket("segment", replacedAttributeRegion),
            ])
            .filters([
                newNegativeAttributeFilter(Department.Default, []),
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
                newBucket("segment", Region.Default),
            ])
            .filters([
                newNegativeAttributeFilter(Department.Default, []),
                newPositiveAttributeFilter(newAttribute(uriRef(departmentUri)), {
                    uris: [directSalesUri],
                }),
            ]);
    },
);
