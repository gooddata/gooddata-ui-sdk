// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

import { type IParameterMetadataObject, type ISettings, idRef } from "@gooddata/sdk-model";

import { type DashboardContext } from "../../../types/commonTypes.js";

import { loadDashboardParameters } from "./loadDashboardParameters.js";

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

const stringParameter: IParameterMetadataObject = {
    ...numberParameter,
    id: "scenario",
    uri: "/scenario",
    ref: idRef("scenario", "parameter"),
    title: "Scenario",
    definition: { type: "STRING", defaultValue: "Actual" },
};

const dateRangeParameter: IParameterMetadataObject = {
    ...numberParameter,
    id: "lastHoldingMonth",
    uri: "/lastHoldingMonth",
    ref: idRef("lastHoldingMonth", "parameter"),
    title: "Last holding month",
    definition: { type: "DATE_RANGE", defaultValue: { granularity: "GDC.time.month", from: "2025-08" } },
};

const unknownTypeParameter = {
    ...numberParameter,
    id: "stringy",
    ref: idRef("stringy", "parameter"),
    definition: { type: "OTHER", defaultValue: "x" },
} as unknown as IParameterMetadataObject;

const parametersOn: ISettings = { enableParameters: true, enableStringParameters: true };
const dateRangeParametersOn: ISettings = { enableDateRangeParameters: true };
const bothOn: ISettings = { ...parametersOn, ...dateRangeParametersOn };

function makeCtx(result: IParameterMetadataObject[] | Error) {
    const query = vi.fn(() =>
        result instanceof Error
            ? Promise.reject(result)
            : Promise.resolve({ all: () => Promise.resolve(result) }),
    );
    const ctx = {
        backend: {
            workspace: () => ({
                parameters: () => ({
                    getParametersQuery: () => ({ query }),
                }),
            }),
        } as unknown,
        workspace: "ws-1",
    } as DashboardContext;

    return { ctx, query };
}

describe("loadDashboardParameters", () => {
    it("splits NUMBER, STRING and DATE_RANGE parameters into the scalar and the date range list", async () => {
        const { ctx, query } = makeCtx([numberParameter, stringParameter, dateRangeParameter]);
        const result = await loadDashboardParameters(ctx, bothOn);
        expect(result).toEqual({
            status: "loaded",
            parameters: [numberParameter, stringParameter],
            dateRangeParametersStatus: "loaded",
            dateRangeParameters: [dateRangeParameter],
        });
        expect(query).toHaveBeenCalledTimes(1);
    });

    it("loads only the scalar list when only enableParameters is on", async () => {
        const { ctx } = makeCtx([numberParameter, stringParameter, dateRangeParameter]);
        const result = await loadDashboardParameters(ctx, parametersOn);
        expect(result).toEqual({
            status: "loaded",
            parameters: [numberParameter, stringParameter],
            dateRangeParametersStatus: "gated-off",
            dateRangeParameters: [],
        });
    });

    it("loads only the date range list when only enableDateRangeParameters is on", async () => {
        const { ctx, query } = makeCtx([numberParameter, stringParameter, dateRangeParameter]);
        const result = await loadDashboardParameters(ctx, dateRangeParametersOn);
        expect(result).toEqual({
            status: "gated-off",
            parameters: [],
            dateRangeParametersStatus: "loaded",
            dateRangeParameters: [dateRangeParameter],
        });
        expect(query).toHaveBeenCalledTimes(1);
    });

    it("filters STRING parameters out and keeps DATE_RANGE parameters when enableStringParameters is off", async () => {
        const { ctx } = makeCtx([numberParameter, stringParameter, dateRangeParameter]);
        const result = await loadDashboardParameters(ctx, { ...bothOn, enableStringParameters: false });
        expect(result).toEqual({
            status: "loaded",
            parameters: [numberParameter],
            dateRangeParametersStatus: "loaded",
            dateRangeParameters: [dateRangeParameter],
        });
    });

    it("loads STRING parameters when enableStringParameters is not set", async () => {
        const { ctx } = makeCtx([numberParameter, stringParameter]);
        const result = await loadDashboardParameters(ctx, { enableParameters: true });
        expect(result.parameters).toEqual([numberParameter, stringParameter]);
    });

    it("puts unknown definition types in neither list", async () => {
        const { ctx } = makeCtx([numberParameter, unknownTypeParameter, dateRangeParameter]);
        const result = await loadDashboardParameters(ctx, bothOn);
        expect(result).toEqual({
            status: "loaded",
            parameters: [numberParameter],
            dateRangeParametersStatus: "loaded",
            dateRangeParameters: [dateRangeParameter],
        });
    });

    it("returns empty lists when no parameters exist", async () => {
        const { ctx } = makeCtx([]);
        const result = await loadDashboardParameters(ctx, bothOn);
        expect(result).toEqual({
            status: "loaded",
            parameters: [],
            dateRangeParametersStatus: "loaded",
            dateRangeParameters: [],
        });
    });

    it.each([
        ["both settings are off", { enableParameters: false, enableDateRangeParameters: false }],
        ["settings are missing", undefined],
    ])("is gated off without a request when %s", async (_, settings) => {
        const { ctx, query } = makeCtx([numberParameter, dateRangeParameter]);
        const result = await loadDashboardParameters(ctx, settings);
        expect(result).toEqual({
            status: "gated-off",
            parameters: [],
            dateRangeParametersStatus: "gated-off",
            dateRangeParameters: [],
        });
        expect(query).not.toHaveBeenCalled();
    });

    it.each([
        ["only enableParameters is on", parametersOn, "failed", "gated-off"],
        ["only enableDateRangeParameters is on", dateRangeParametersOn, "gated-off", "failed"],
        ["both settings are on", bothOn, "failed", "failed"],
    ] as const)(
        "fails the enabled lists and leaves both empty when the request rejects and %s",
        async (_, settings, status, dateRangeParametersStatus) => {
            const { ctx } = makeCtx(new Error("request failed"));
            const result = await loadDashboardParameters(ctx, settings);
            expect(result).toEqual({
                status,
                parameters: [],
                dateRangeParametersStatus,
                dateRangeParameters: [],
            });
        },
    );
});
