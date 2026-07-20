// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IExecutionDefinition,
    type IExportDefinitionVisualizationObjectRequestPayload,
    idRef,
} from "@gooddata/sdk-model";

import { prepareCsvRawExecutionDefinition } from "../csvRawExecutionDefinition.js";

const executionDefinition: IExecutionDefinition = {
    workspace: "workspaceId",
    buckets: [],
    attributes: [],
    measures: [],
    filters: [],
    sortBy: [],
    dimensions: [],
};

function rawRequest(
    parametersByTab?: IExportDefinitionVisualizationObjectRequestPayload["content"]["parametersByTab"],
): IExportDefinitionVisualizationObjectRequestPayload {
    return {
        type: "visualizationObject",
        fileName: "raw-export",
        format: "CSV_RAW",
        content: {
            visualizationObject: "visId",
            widget: "widgetId",
            dashboard: "dashboardId",
            ...(parametersByTab ? { parametersByTab } : {}),
        },
    };
}

function prepare(
    options: Partial<Parameters<typeof prepareCsvRawExecutionDefinition>[0]> & {
        csvRawRequest: IExportDefinitionVisualizationObjectRequestPayload;
    },
): IExecutionDefinition | undefined {
    return prepareCsvRawExecutionDefinition({
        executionDefinition,
        insight: undefined,
        insightParameterValues: [],
        enableStringParameters: true,
        widget: undefined,
        commonDateFilterId: undefined,
        ...options,
    });
}

describe("prepareCsvRawExecutionDefinition", () => {
    const topN = idRef("topN", "parameter");
    const region = idRef("region", "parameter");
    const scenario = idRef("scenario", "parameter");

    it("overlays the dialog override onto the insight base value for the same ref", () => {
        const result = prepare({
            csvRawRequest: rawRequest({
                tabOwning: [{ id: "topN", value: "3", title: "Top N", parameterType: "NUMBER" }],
            }),
            insightParameterValues: [{ ref: topN, value: 5 }],
        });

        expect(result?.executionConfig?.parameterValues).toEqual([{ ref: topN, value: 3 }]);
    });

    it("keeps a STRING override as a string when overlaying onto the insight base", () => {
        const result = prepare({
            csvRawRequest: rawRequest({
                tabOwning: [{ id: "scenario", value: "Budget", title: "Scenario", parameterType: "STRING" }],
            }),
            insightParameterValues: [{ ref: scenario, value: "Actual" }],
        });

        expect(result?.executionConfig?.parameterValues).toEqual([{ ref: scenario, value: "Budget" }]);
    });

    it("drops a STRING override while string parameters are disabled, keeping the insight base", () => {
        const result = prepare({
            csvRawRequest: rawRequest({
                tabOwning: [{ id: "scenario", value: "Budget", title: "Scenario", parameterType: "STRING" }],
            }),
            insightParameterValues: [{ ref: scenario, value: "Actual" }],
            enableStringParameters: false,
        });

        expect(result?.executionConfig?.parameterValues).toEqual([{ ref: scenario, value: "Actual" }]);
    });

    it("preserves an insight base param absent from the overrides", () => {
        const result = prepare({
            csvRawRequest: rawRequest({
                tabOwning: [{ id: "topN", value: "3", title: "Top N", parameterType: "NUMBER" }],
            }),
            insightParameterValues: [
                { ref: topN, value: 5 },
                { ref: region, value: 2 },
            ],
        });

        // `region` is authored on the insight but never overridden in the dialog, so it must survive.
        expect(result?.executionConfig?.parameterValues).toEqual([
            { ref: topN, value: 3 },
            { ref: region, value: 2 },
        ]);
    });

    it("reverts a deleted override to the insight base value", () => {
        // A present-but-empty set means the user deleted every chip; the ref falls back to the insight.
        const result = prepare({
            csvRawRequest: rawRequest({ tabOwning: [] }),
            insightParameterValues: [{ ref: topN, value: 5 }],
        });

        expect(result?.executionConfig?.parameterValues).toEqual([{ ref: topN, value: 5 }]);
    });

    it("appends an override ref that the insight does not author", () => {
        const result = prepare({
            csvRawRequest: rawRequest({
                tabOwning: [{ id: "topN", value: "3", title: "Top N", parameterType: "NUMBER" }],
            }),
        });

        expect(result?.executionConfig?.parameterValues).toEqual([{ ref: topN, value: 3 }]);
    });

    it("preserves unrelated execution settings while replacing parameter values", () => {
        const withLiveSettings: IExecutionDefinition = {
            ...executionDefinition,
            executionConfig: {
                dataSamplingPercentage: 50,
                parameterValues: [{ ref: topN, value: 5 }],
            },
        };

        const result = prepare({
            executionDefinition: withLiveSettings,
            csvRawRequest: rawRequest({
                tabOwning: [{ id: "topN", value: "3", title: "Top N", parameterType: "NUMBER" }],
            }),
            insightParameterValues: [{ ref: topN, value: 5 }],
        });

        expect(result?.executionConfig?.parameterValues).toEqual([{ ref: topN, value: 3 }]);
        expect(result?.executionConfig?.dataSamplingPercentage).toBe(50);
    });

    it("applies the insight base params when no parametersByTab is stored", () => {
        // The no-data fallback (newDefForInsight) carries no parameterValues, so the resolved insight
        // base must still reach the export even though no override is stored.
        const result = prepare({
            csvRawRequest: rawRequest(),
            insightParameterValues: [{ ref: topN, value: 5 }],
        });

        expect(result?.executionConfig?.parameterValues).toEqual([{ ref: topN, value: 5 }]);
    });

    it("leaves the live execution untouched when the base and the overrides are both empty", () => {
        // Flag off / no referenced params: the resolved base is empty and nothing is stored, so the
        // execution must be returned as-is rather than gaining an empty parameterValues array.
        const result = prepare({ csvRawRequest: rawRequest() });

        expect(result).toBe(executionDefinition);
    });

    it("returns undefined when there is no execution definition", () => {
        const result = prepare({
            executionDefinition: undefined,
            csvRawRequest: rawRequest({
                tabOwning: [{ id: "topN", value: "5", title: "Top N", parameterType: "NUMBER" }],
            }),
            insightParameterValues: [{ ref: topN, value: 5 }],
        });

        expect(result).toBeUndefined();
    });
});
