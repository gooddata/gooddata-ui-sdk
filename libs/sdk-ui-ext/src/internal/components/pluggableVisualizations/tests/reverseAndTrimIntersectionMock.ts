// (C) 2020-2025 GoodData Corporation

import { ReferenceData, ReferenceMd } from "@gooddata/reference-workspace";
import { type IAttributeDescriptorBody, localIdRef } from "@gooddata/sdk-model";
import { type IDrillEventIntersectionElement } from "@gooddata/sdk-ui";

import { type IDrillDownDefinition } from "../../../interfaces/Visualization.js";

const { Department, Region, Won } = ReferenceMd;
const drillConfigRegion: IDrillDownDefinition = {
    type: "drillDown",
    origin: localIdRef(Region.Default.attribute.localIdentifier),
    target: Department.Default.attribute.displayForm,
};

const regionUri = "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/1024";
const departmentUri = "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/1027";
const westCoastUri = ReferenceData.Region.WestCoast.uri;
const directSalesUri = ReferenceData.Department.DirectSales.uri;

const directSalesHeader: IDrillEventIntersectionElement = {
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
        } as IAttributeDescriptorBody,
    },
};

const westCoastHeader: IDrillEventIntersectionElement = {
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
        } as IAttributeDescriptorBody,
    },
};

const measureHeader: IDrillEventIntersectionElement = {
    header: {
        measureHeaderItem: {
            name: Won.measure.title,
            format: "#,##0.00",
            localIdentifier: Won.measure.localIdentifier,
            uri: "/gdc/md/lmnivlu3sowt63jvr2mo1wlse5fyv203/obj/9203",
            identifier: null,
        },
    },
};

const intersectionWithOuterDepartment: IDrillEventIntersectionElement[] = [
    directSalesHeader,
    westCoastHeader,
    measureHeader,
];

const intersectionWithOuterRegion: IDrillEventIntersectionElement[] = [
    westCoastHeader,
    directSalesHeader,
    measureHeader,
];

const intersectionWithOuterDepartmentResult: IDrillEventIntersectionElement[] = [
    westCoastHeader,
    directSalesHeader,
];

const intersectionWithOuterRegionResult: IDrillEventIntersectionElement[] = [westCoastHeader];

export const reverseAndTrimIntersectionMock = {
    drillConfigRegion,
    intersectionWithOuterDepartment,
    intersectionWithOuterRegion,
    intersectionWithOuterDepartmentResult,
    intersectionWithOuterRegionResult,
};
