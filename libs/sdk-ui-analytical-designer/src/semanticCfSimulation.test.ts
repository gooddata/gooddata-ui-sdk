// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { dummyBackendEmptyData } from "@gooddata/sdk-backend-base";
import {
    type IAttributeDescriptor,
    type IDimensionDescriptor,
    type IMeasureDescriptor,
    type ISemanticConditionalFormatting,
    idRef,
} from "@gooddata/sdk-model";

import {
    type SemanticCfSimConfig,
    injectSemanticConditionalFormatting,
    withSemanticCfSimulation,
} from "./semanticCfSimulation.js";

function buildAttributeDescriptor(
    localIdentifier: string,
    conditionalFormatting?: ISemanticConditionalFormatting,
): IAttributeDescriptor {
    return {
        attributeHeader: {
            uri: `/gdc/md/demo/obj/${localIdentifier}`,
            identifier: `${localIdentifier}.id`,
            localIdentifier,
            ref: idRef(`${localIdentifier}.id`),
            name: localIdentifier,
            formOf: {
                ref: idRef(`attr.${localIdentifier}`),
                uri: `/gdc/md/demo/obj/attr.${localIdentifier}`,
                identifier: `attr.${localIdentifier}`,
                name: localIdentifier,
            },
            primaryLabel: idRef(`${localIdentifier}.id`),
            ...(conditionalFormatting ? { conditionalFormatting } : {}),
        },
    };
}

function buildMeasureDescriptor(
    localIdentifier: string,
    conditionalFormatting?: ISemanticConditionalFormatting,
): IMeasureDescriptor {
    return {
        measureHeaderItem: {
            localIdentifier,
            name: localIdentifier,
            format: "#,##0.00",
            ref: idRef(localIdentifier),
            ...(conditionalFormatting ? { conditionalFormatting } : {}),
        },
    };
}

const semantic: ISemanticConditionalFormatting = {
    conditions: [
        {
            id: "c1",
            operator: "EQUAL_TO",
            value: { kind: "literal", value: "5" },
            format: { backgroundColor: "#E54D40", scope: "cell" },
        },
    ],
};

describe("injectSemanticConditionalFormatting", () => {
    it("injects conditionalFormatting onto a matching measure descriptor", () => {
        const dimensions: IDimensionDescriptor[] = [
            { headers: [{ measureGroupHeader: { items: [buildMeasureDescriptor("m1")] } }] },
        ];
        const config: SemanticCfSimConfig = { m1: semantic };
        const result = injectSemanticConditionalFormatting(dimensions, config);
        const measureGroup = result[0].headers[0];
        expect("measureGroupHeader" in measureGroup && measureGroup.measureGroupHeader.items[0]).toEqual(
            buildMeasureDescriptor("m1", semantic),
        );
    });

    it("injects conditionalFormatting onto a matching attribute descriptor", () => {
        const dimensions: IDimensionDescriptor[] = [{ headers: [buildAttributeDescriptor("a1")] }];
        const config: SemanticCfSimConfig = { a1: semantic };
        const result = injectSemanticConditionalFormatting(dimensions, config);
        expect(result[0].headers[0]).toEqual(buildAttributeDescriptor("a1", semantic));
    });

    it("leaves a descriptor untouched when its localId isn't in the config", () => {
        const dimensions: IDimensionDescriptor[] = [
            { headers: [buildAttributeDescriptor("a1")] },
            { headers: [{ measureGroupHeader: { items: [buildMeasureDescriptor("m1")] } }] },
        ];
        const result = injectSemanticConditionalFormatting(dimensions, { other: semantic });
        expect(result).toEqual(dimensions);
    });

    it("handles measure and attribute descriptors in the same call, matched independently", () => {
        const dimensions: IDimensionDescriptor[] = [
            { headers: [buildAttributeDescriptor("a1")] },
            { headers: [{ measureGroupHeader: { items: [buildMeasureDescriptor("m1")] } }] },
        ];
        const config: SemanticCfSimConfig = { a1: semantic };
        const result = injectSemanticConditionalFormatting(dimensions, config);
        expect(result[0].headers[0]).toEqual(buildAttributeDescriptor("a1", semantic));
        const measureGroup = result[1].headers[0];
        expect("measureGroupHeader" in measureGroup && measureGroup.measureGroupHeader.items[0]).toEqual(
            buildMeasureDescriptor("m1"),
        );
    });
});

describe("withSemanticCfSimulation", () => {
    it("returns the backend unchanged when no config is provided", () => {
        const backend = dummyBackendEmptyData();
        expect(withSemanticCfSimulation(backend, undefined)).toBe(backend);
    });
});
