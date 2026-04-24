// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IInsight,
    type IInsightParameterValue,
    idRef,
    insightSetParameters,
    uriRef,
} from "@gooddata/sdk-model";

import { convertVisualizationObject } from "../../fromBackend/visualizationObjects/v2/VisualizationObjectConverter.js";
import { convertInsight } from "../InsightConverter.js";

const emptyInsight: IInsight = {
    insight: {
        visualizationUrl: "local:bar",
        title: "Insight with params",
        buckets: [],
        filters: [],
        sorts: [],
        properties: {},
        identifier: "insight-1",
        uri: "/insight-1",
        ref: uriRef("/insight-1"),
    },
};

describe("convertInsight with parameter values", () => {
    it("should persist parameter values on save", () => {
        const params: IInsightParameterValue[] = [{ ref: idRef("threshold", "parameter"), value: 42 }];
        const insight = insightSetParameters(emptyInsight, params);

        const tigerObj = convertInsight(insight);

        expect(tigerObj.parameters).toEqual([
            { ref: { identifier: { id: "threshold", type: "parameter" } }, value: 42 },
        ]);
    });

    it("should omit parameters field when there are no values", () => {
        const tigerObj = convertInsight(emptyInsight);

        expect(tigerObj.parameters).toBeUndefined();
    });

    it("should round-trip parameter values through convertInsight + convertVisualizationObject", () => {
        const params: IInsightParameterValue[] = [
            { ref: idRef("threshold", "parameter"), value: 42 },
            { ref: idRef("markup", "parameter"), value: 0.15 },
        ];
        const insight = insightSetParameters(emptyInsight, params);

        const tigerObj = convertInsight(insight);
        const restored = convertVisualizationObject(tigerObj, "Insight with params", "");

        expect(restored.insight.parameters).toEqual(params);
    });
});
