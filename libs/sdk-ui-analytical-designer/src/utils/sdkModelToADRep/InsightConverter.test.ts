// (C) 2026 GoodData Corporation

// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
    type AccessGranularPermission,
    type IInsight,
    type IInsightDefinition,
    type IInsightParameterValue,
    idRef,
    uriRef,
} from "@gooddata/sdk-model";

import { convertInsightContent, convertModelInsightToADRep } from "./InsightConverter.js";

function makeInsightDefinition(parameters?: IInsightParameterValue[]): IInsightDefinition {
    return {
        insight: {
            title: "t",
            visualizationUrl: "local:table",
            buckets: [],
            filters: [],
            sorts: [],
            properties: {},
            ...(parameters ? { parameters } : {}),
        },
    };
}

function makeInsight(isHidden?: boolean): IInsight {
    const id = "test-id";
    const uri = "/visualizationObjects/test-id";
    return {
        insight: {
            title: "t",
            visualizationUrl: "local:table",
            buckets: [],
            filters: [],
            sorts: [],
            properties: {},
            identifier: id,
            uri,
            ref: uriRef(uri),
            ...(isHidden !== undefined && { isHidden }),
        },
    };
}

describe("convertInsightContent parameters handling", () => {
    it("emits parameters when insight has non-empty parameters", () => {
        const parameters: IInsightParameterValue[] = [{ ref: idRef("param.one"), value: 42 }];

        const content = convertInsightContent(makeInsightDefinition(parameters), false);

        expect(content.parameters).toEqual(parameters);
    });

    it("omits parameters key when insight has no parameters", () => {
        const content = convertInsightContent(makeInsightDefinition(), false);

        expect(content).not.toHaveProperty("parameters");
    });

    it("omits parameters key when insight has empty parameters array", () => {
        const content = convertInsightContent(makeInsightDefinition([]), false);

        expect(content).not.toHaveProperty("parameters");
    });
});

describe("convertModelInsightToADRep isHidden handling", () => {
    it("emits meta.isHidden=true when insight is hidden", () => {
        const result = convertModelInsightToADRep(makeInsight(true));

        expect(result.meta.isHidden).toBe(true);
    });

    it("omits meta.isHidden when insight has isHidden=false", () => {
        const result = convertModelInsightToADRep(makeInsight(false));

        expect(result.meta).not.toHaveProperty("isHidden");
    });

    it("omits meta.isHidden when insight has no isHidden field", () => {
        const result = convertModelInsightToADRep(makeInsight(undefined));

        expect(result.meta).not.toHaveProperty("isHidden");
    });
});

describe("convertModelInsightToADRep permissions handling", () => {
    it("carries the user's own permissions into the report meta", () => {
        const base = makeInsight(undefined);
        const permissions: AccessGranularPermission[] = ["EDIT", "VIEW"];
        const insight: IInsight = { insight: { ...base.insight, permissions } };
        expect(convertModelInsightToADRep(insight).meta.permissions).toEqual(["EDIT", "VIEW"]);
    });

    it("leaves the meta without permissions when they were not loaded", () => {
        expect(convertModelInsightToADRep(makeInsight(undefined)).meta).not.toHaveProperty("permissions");
    });
});
