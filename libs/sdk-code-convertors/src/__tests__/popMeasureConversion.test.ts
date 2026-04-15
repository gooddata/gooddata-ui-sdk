// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type Visualisation } from "@gooddata/sdk-code-schemas/v1";
import { type IInsightDefinition, type IMeasure } from "@gooddata/sdk-model";

import { yamlVisualisationToDeclarative } from "../to/yamlVisualisationToDeclarative.js";
import { type ExportEntities } from "../types.js";

const emptyEntities: ExportEntities = [];

describe("PoP and Previous Period measure conversion", () => {
    it("should convert PREVIOUS_YEAR measure with absolute date filter", () => {
        const input = {
            type: "table",
            id: "efb61d1f-f241-498c-ba48-fbf897bc8644",
            title: "compared measure",
            query: {
                fields: {
                    pop_measure: {
                        type: "PREVIOUS_YEAR",
                        date_filter: "Closed___Date",
                        using: "original_measure",
                    },
                    original_measure: "metric/amount",
                },
                filter_by: {
                    Closed___Date: {
                        type: "date_filter",
                        from: "2010-01-02 00:00",
                        to: "2026-02-02 23:59",
                        using: "Closed___Date",
                    },
                },
            },
            metrics: ["pop_measure", "original_measure"],
        } as Visualisation;

        const declarative = yamlVisualisationToDeclarative(emptyEntities, input);
        const content = declarative.content as IInsightDefinition["insight"];
        const buckets = content.buckets;
        const measuresBucket = buckets.find((b) => b.localIdentifier === "measures");

        expect(measuresBucket).toBeDefined();
        const popMeasure = measuresBucket?.items.find(
            (item) => (item as IMeasure).measure?.localIdentifier === "pop_measure",
        ) as IMeasure;

        expect(popMeasure).toBeDefined();
        expect(popMeasure.measure.definition).toEqual({
            popMeasureDefinition: {
                measureIdentifier: "original_measure",
                popAttribute: { identifier: { id: "Closed___Date.year", type: "attribute" } },
            },
        });
    });

    it("should convert PREVIOUS_PERIOD measure with absolute date filter", () => {
        const input = {
            type: "table",
            id: "efb61d1f-f241-498c-ba48-fbf897bc8644",
            title: "compared measure",
            query: {
                fields: {
                    pp_measure: {
                        type: "PREVIOUS_PERIOD",
                        date_filter: "Closed___Date",
                        using: "original_measure",
                    },
                    original_measure: "metric/amount",
                },
                filter_by: {
                    Closed___Date: {
                        type: "date_filter",
                        from: "2010-01-02 00:00",
                        to: "2026-02-02 23:59",
                        using: "Closed___Date",
                    },
                },
            },
            metrics: ["pp_measure", "original_measure"],
        } as Visualisation;

        const declarative = yamlVisualisationToDeclarative(emptyEntities, input);
        const content = declarative.content as IInsightDefinition["insight"];
        const buckets = content.buckets;
        const measuresBucket = buckets.find((b) => b.localIdentifier === "measures");

        expect(measuresBucket).toBeDefined();
        const ppMeasure = measuresBucket?.items.find(
            (item) => (item as IMeasure).measure?.localIdentifier === "pp_measure",
        ) as IMeasure;

        expect(ppMeasure).toBeDefined();
        expect(ppMeasure.measure.definition).toEqual({
            previousPeriodMeasure: {
                measureIdentifier: "original_measure",
                dateDataSets: [
                    {
                        dataSet: { identifier: { id: "Closed___Date", type: "dataset" } },
                        periodsAgo: 1,
                    },
                ],
            },
        });
    });

    it("should convert PREVIOUS_YEAR measure with relative date filter", () => {
        const input = {
            type: "table",
            id: "efb61d1f-f241-498c-ba48-fbf897bc8644",
            title: "compared measure",
            query: {
                fields: {
                    pop_measure: {
                        type: "PREVIOUS_YEAR",
                        date_filter: "Closed___Date",
                        using: "original_measure",
                    },
                    original_measure: "metric/amount",
                },
                filter_by: {
                    Closed___Date: {
                        type: "date_filter",
                        from: -1,
                        to: 0,
                        granularity: "QUARTER",
                        using: "Closed___Date",
                    },
                },
            },
            metrics: ["pop_measure", "original_measure"],
        } as Visualisation;

        const declarative = yamlVisualisationToDeclarative(emptyEntities, input);
        const content = declarative.content as IInsightDefinition["insight"];
        const buckets = content.buckets;
        const measuresBucket = buckets.find((b) => b.localIdentifier === "measures");

        expect(measuresBucket).toBeDefined();
        const popMeasure = measuresBucket?.items.find(
            (item) => (item as IMeasure).measure?.localIdentifier === "pop_measure",
        ) as IMeasure;

        expect(popMeasure).toBeDefined();
        expect(popMeasure.measure.definition).toEqual({
            popMeasureDefinition: {
                measureIdentifier: "original_measure",
                popAttribute: { identifier: { id: "Closed___Date.quarter", type: "attribute" } },
            },
        });
    });
});
