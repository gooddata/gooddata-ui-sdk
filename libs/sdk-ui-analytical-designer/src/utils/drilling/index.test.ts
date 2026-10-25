// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type IAttributeDescriptor, type IMeasureDescriptor, idRef } from "@gooddata/sdk-model";
import { type IDrillEventIntersectionElement, type IDrillIntersectionAttributeItem } from "@gooddata/sdk-ui";

import { convertTableDrillIntersectionToLegacy, createDrillIntersectionElement } from "./index.js";

const labelHeader: IAttributeDescriptor = {
    attributeHeader: {
        uri: "",
        identifier: "label.owner.name",
        ref: idRef("label.owner.name", "displayForm"),
        formOf: {
            identifier: "attr.owner",
            name: "Owner",
            uri: "",
            ref: idRef("attr.owner", "attribute"),
        },
        localIdentifier: "a1",
        name: "Owner Name",
        primaryLabel: idRef("attr.owner", "displayForm"),
    },
};

// a computed attribute has no labels: its display form ref IS the computed attribute ref
const computedAttributeHeader: IAttributeDescriptor = {
    attributeHeader: {
        uri: "",
        identifier: "ca.id",
        ref: idRef("ca.id", "computedAttribute"),
        formOf: {
            identifier: "ca.id",
            name: "Computed",
            uri: "",
            ref: idRef("ca.id", "computedAttribute"),
        },
        localIdentifier: "a2",
        name: "Computed",
        primaryLabel: idRef("ca.id", "computedAttribute"),
    },
};

const measureHeader: IMeasureDescriptor = {
    measureHeaderItem: {
        localIdentifier: "m1",
        name: "Won",
        format: "#,##0",
        identifier: "metric.id",
        ref: idRef("metric.id", "measure"),
    },
};

const attributeItem = (header: IAttributeDescriptor, value: string): IDrillEventIntersectionElement => ({
    header: {
        ...header,
        attributeHeaderItem: { uri: value, name: value },
    } as IDrillIntersectionAttributeItem,
});

describe("legacy drill intersection", () => {
    it("types every object header from its ref and leaves element entries untyped", () => {
        const legacy = convertTableDrillIntersectionToLegacy(
            [
                attributeItem(labelHeader, "Trevor"),
                attributeItem(computedAttributeHeader, "High"),
                { header: measureHeader },
            ],
            {},
        );

        expect(legacy.map((element) => element.header)).toEqual([
            { uri: "Trevor", identifier: "" },
            { uri: "", identifier: "label.owner.name", type: "displayForm" },
            { uri: "High", identifier: "" },
            { uri: "", identifier: "ca.id", type: "computedAttribute" },
            { uri: "", identifier: "metric.id", type: "measure" },
        ]);
    });

    it("emits only the documented header types", () => {
        const factMeasureHeader: IMeasureDescriptor = {
            measureHeaderItem: {
                ...measureHeader.measureHeaderItem,
                identifier: "fact.id",
                ref: idRef("fact.id", "fact"),
            },
        };
        const oddlyTypedAttributeHeader: IAttributeDescriptor = {
            attributeHeader: { ...labelHeader.attributeHeader, ref: idRef("label.owner.name", "attribute") },
        };

        const legacy = convertTableDrillIntersectionToLegacy(
            [attributeItem(oddlyTypedAttributeHeader, "Trevor"), { header: factMeasureHeader }],
            {},
        );

        expect(legacy.map((element) => element.header)).toEqual([
            { uri: "Trevor", identifier: "" },
            { uri: "", identifier: "label.owner.name" },
            { uri: "", identifier: "fact.id", type: "fact" },
        ]);
    });

    it("carries the type on a directly created element only when provided", () => {
        expect(
            createDrillIntersectionElement("id", "title", "", "ca.id", "computedAttribute").header,
        ).toEqual({
            uri: "",
            identifier: "ca.id",
            type: "computedAttribute",
        });
        expect(createDrillIntersectionElement("id", "title", "", "label.id").header).toEqual({
            uri: "",
            identifier: "label.id",
        });
    });
});
