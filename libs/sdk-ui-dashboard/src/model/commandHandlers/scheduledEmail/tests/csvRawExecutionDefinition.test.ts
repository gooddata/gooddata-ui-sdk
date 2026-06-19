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

describe("prepareCsvRawExecutionDefinition", () => {
    const topN = idRef("topN", "parameter");
    const region = idRef("region", "parameter");

    it("overlays the dialog override onto the insight base value for the same ref", () => {
        const request = rawRequest({ tabOwning: [{ id: "topN", value: "3", title: "Top N" }] });

        const result = prepareCsvRawExecutionDefinition(
            executionDefinition,
            request,
            undefined,
            [{ ref: topN, value: 5 }],
            undefined,
            undefined,
        );

        expect(result?.executionConfig?.parameterValues).toEqual([{ ref: topN, value: 3 }]);
    });

    it("preserves an insight base param absent from the overrides", () => {
        const request = rawRequest({ tabOwning: [{ id: "topN", value: "3", title: "Top N" }] });

        const result = prepareCsvRawExecutionDefinition(
            executionDefinition,
            request,
            undefined,
            [
                { ref: topN, value: 5 },
                { ref: region, value: 2 },
            ],
            undefined,
            undefined,
        );

        // `region` is authored on the insight but never overridden in the dialog, so it must survive.
        expect(result?.executionConfig?.parameterValues).toEqual([
            { ref: topN, value: 3 },
            { ref: region, value: 2 },
        ]);
    });

    it("reverts a deleted override to the insight base value", () => {
        // A present-but-empty set means the user deleted every chip; the ref falls back to the insight.
        const request = rawRequest({ tabOwning: [] });

        const result = prepareCsvRawExecutionDefinition(
            executionDefinition,
            request,
            undefined,
            [{ ref: topN, value: 5 }],
            undefined,
            undefined,
        );

        expect(result?.executionConfig?.parameterValues).toEqual([{ ref: topN, value: 5 }]);
    });

    it("appends an override ref that the insight does not author", () => {
        const request = rawRequest({ tabOwning: [{ id: "topN", value: "3", title: "Top N" }] });

        const result = prepareCsvRawExecutionDefinition(
            executionDefinition,
            request,
            undefined,
            [],
            undefined,
            undefined,
        );

        expect(result?.executionConfig?.parameterValues).toEqual([{ ref: topN, value: 3 }]);
    });

    it("preserves unrelated execution settings while replacing parameter values", () => {
        const request = rawRequest({ tabOwning: [{ id: "topN", value: "3", title: "Top N" }] });
        const withLiveSettings: IExecutionDefinition = {
            ...executionDefinition,
            executionConfig: {
                dataSamplingPercentage: 50,
                parameterValues: [{ ref: topN, value: 5 }],
            },
        };

        const result = prepareCsvRawExecutionDefinition(
            withLiveSettings,
            request,
            undefined,
            [{ ref: topN, value: 5 }],
            undefined,
            undefined,
        );

        expect(result?.executionConfig?.parameterValues).toEqual([{ ref: topN, value: 3 }]);
        expect(result?.executionConfig?.dataSamplingPercentage).toBe(50);
    });

    it("applies the insight base params when no parametersByTab is stored", () => {
        // The no-data fallback (newDefForInsight) carries no parameterValues, so the resolved insight
        // base must still reach the export even though no override is stored.
        const result = prepareCsvRawExecutionDefinition(
            executionDefinition,
            rawRequest(),
            undefined,
            [{ ref: topN, value: 5 }],
            undefined,
            undefined,
        );

        expect(result?.executionConfig?.parameterValues).toEqual([{ ref: topN, value: 5 }]);
    });

    it("leaves the live execution untouched when the base and the overrides are both empty", () => {
        // Flag off / no referenced params: the resolved base is empty and nothing is stored, so the
        // execution must be returned as-is rather than gaining an empty parameterValues array.
        const result = prepareCsvRawExecutionDefinition(
            executionDefinition,
            rawRequest(),
            undefined,
            [],
            undefined,
            undefined,
        );

        expect(result).toBe(executionDefinition);
    });

    it("returns undefined when there is no execution definition", () => {
        const request = rawRequest({ tabOwning: [{ id: "topN", value: "5", title: "Top N" }] });

        expect(
            prepareCsvRawExecutionDefinition(
                undefined,
                request,
                undefined,
                [{ ref: topN, value: 5 }],
                undefined,
                undefined,
            ),
        ).toBeUndefined();
    });
});
