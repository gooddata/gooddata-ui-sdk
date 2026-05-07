// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IParameterMetadataObject, idRef } from "@gooddata/sdk-model";

import { type DashboardContext } from "../../../../types/commonTypes.js";
import { loadDashboardParameters } from "../loadDashboardParameters.js";

const numberParameter: IParameterMetadataObject = {
    type: "parameter",
    id: "topN",
    uri: "/topN",
    ref: idRef("topN", "parameter"),
    title: "Top N",
    description: "",
    production: true,
    deprecated: false,
    unlisted: false,
    definition: { type: "NUMBER", defaultValue: 10 },
};

const nonNumberParameter = {
    ...numberParameter,
    id: "stringy",
    ref: idRef("stringy", "parameter"),
    definition: { type: "OTHER", defaultValue: "x" },
} as unknown as IParameterMetadataObject;

function makeCtx(items: IParameterMetadataObject[]): DashboardContext {
    return {
        backend: {
            workspace: () => ({
                parameters: () => ({
                    getParametersQuery: () => ({
                        query: () => Promise.resolve({ all: () => Promise.resolve(items) }),
                    }),
                }),
            }),
        } as unknown,
        workspace: "ws-1",
    } as DashboardContext;
}

describe("loadDashboardParameters", () => {
    it("returns NUMBER parameters as-is", async () => {
        const result = await loadDashboardParameters(makeCtx([numberParameter]));
        expect(result).toEqual([numberParameter]);
    });

    it("filters out non-NUMBER definitions", async () => {
        const result = await loadDashboardParameters(makeCtx([numberParameter, nonNumberParameter]));
        expect(result).toEqual([numberParameter]);
    });

    it("returns empty list when no parameters exist", async () => {
        const result = await loadDashboardParameters(makeCtx([]));
        expect(result).toEqual([]);
    });
});
