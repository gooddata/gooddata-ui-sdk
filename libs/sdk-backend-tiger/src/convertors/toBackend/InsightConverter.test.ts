// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IInsight,
    type IInsightParameterValue,
    idRef,
    insightSetParameters,
    newAbsoluteDateFilter,
    uriRef,
} from "@gooddata/sdk-model";

import { convertVisualizationObject } from "../fromBackend/visualizationObjects/v2/VisualizationObjectConverter.js";

import { convertInsight } from "./InsightConverter.js";

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

describe("convertInsight with a computed attribute", () => {
    it("should persist a computed attribute in the buckets by its own type", () => {
        // A computed attribute reaches the insight as an attribute whose display form ref carries
        // the COMPUTED ATTRIBUTE type - it has no real labels, so the fabricated display form
        // points at the computed attribute itself.
        const insight: IInsight = {
            insight: {
                ...emptyInsight.insight,
                buckets: [
                    {
                        localIdentifier: "view",
                        items: [
                            {
                                attribute: {
                                    localIdentifier: "ca1",
                                    displayForm: idRef("rep_performance", "computedAttribute"),
                                },
                            },
                        ],
                    },
                ],
            },
        };

        const tigerObj = convertInsight(insight);

        expect(tigerObj.buckets).toEqual([
            {
                localIdentifier: "view",
                items: [
                    {
                        attribute: {
                            localIdentifier: "ca1",
                            displayForm: {
                                identifier: { id: "rep_performance", type: "computedAttribute" },
                            },
                        },
                    },
                ],
            },
        ]);
    });
});

describe("convertInsight with an absolute date filter", () => {
    it("should store insight and layer filters without the granularity", () => {
        const monthFilter = newAbsoluteDateFilter(idRef("date1", "dataSet"), "2026-03-01", "2026-04-30", {
            granularity: "GDC.time.month",
        });
        const insight: IInsight = {
            insight: {
                ...emptyInsight.insight,
                filters: [monthFilter],
                layers: [{ id: "layer1", type: "pushpin", buckets: [], filters: [monthFilter] }],
            },
        };

        const tigerObj = convertInsight(insight);
        const storedDateFilter = {
            absoluteDateFilter: {
                dataSet: { identifier: { id: "date1", type: "dataset" } },
                from: "2026-03-01",
                to: "2026-04-30",
            },
        };

        expect(tigerObj.filters).toEqual([storedDateFilter]);
        expect(tigerObj.layers?.[0].filters).toEqual([storedDateFilter]);
    });
});
