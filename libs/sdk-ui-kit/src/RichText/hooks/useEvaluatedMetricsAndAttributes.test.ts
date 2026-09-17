// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IMeasure, type IMeasureDefinition, idRef, measureLocalId } from "@gooddata/sdk-model";

import { type ReferenceMap } from "../helpers/references.js";

import { getLabels } from "./useEvaluatedMetricsAndAttributes.js";

describe("getLabels", () => {
    const aggregationOf = (measure: IMeasure) =>
        (measure.measure.definition as IMeasureDefinition).measureDefinition.aggregation;

    it("asks for a label's value and its count, to tell one value from several", () => {
        const references: ReferenceMap = {
            "label/city": { ref: idRef("city", "displayForm"), type: "displayForm" },
        };

        const { metrics, probes } = getLabels(references);

        expect(metrics.map(measureLocalId)).toEqual(["m_max_0", "m_count_0"]);
        expect(metrics.map(aggregationOf)).toEqual(["max", "count"]);
        expect(probes).toEqual({ m_max_0: { localId: "m_count_0", kind: "count" } });
    });

    it("probes a computed attribute with min instead of count", () => {
        // Counting one needs a slicing context the rich text execution does not have: it is
        // functionally determined by the attributes it is computed on and its own dataset is
        // synthetic, so the backend finds no single witness and rejects the WHOLE execution with
        // "Ambiguous context for count" — taking every other reference in the widget with it.
        // `count` is a DISTINCT count, so comparing min to max answers the same question.
        const references: ReferenceMap = {
            "computed_attribute/tier": { ref: idRef("tier", "computedAttribute"), type: "computedAttribute" },
        };

        const { metrics, probes } = getLabels(references);

        expect(metrics.map(measureLocalId)).toEqual(["m_max_0", "m_min_0"]);
        expect(metrics.map(aggregationOf)).toEqual(["max", "min"]);
        expect(probes).toEqual({ m_max_0: { localId: "m_min_0", kind: "min" } });
    });

    it("keeps the pairing right when both kinds are referenced", () => {
        const references: ReferenceMap = {
            "computed_attribute/tier": { ref: idRef("tier", "computedAttribute"), type: "computedAttribute" },
            "label/city": { ref: idRef("city", "displayForm"), type: "displayForm" },
        };

        const { metrics, probes } = getLabels(references);

        expect(metrics.map(measureLocalId)).toEqual(["m_max_0", "m_min_0", "m_max_1", "m_count_1"]);
        expect(probes).toEqual({
            m_max_0: { localId: "m_min_0", kind: "min" },
            m_max_1: { localId: "m_count_1", kind: "count" },
        });
    });
});
