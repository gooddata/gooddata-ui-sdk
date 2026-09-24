// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IMeasure, type IMeasureDefinition, idRef, measureLocalId } from "@gooddata/sdk-model";

import { type ReferenceMap } from "../helpers/references.js";

import { getLabels, getMeasures } from "./useEvaluatedMetricsAndAttributes.js";

describe("getLabels", () => {
    const aggregationOf = (measure: IMeasure) =>
        (measure.measure.definition as IMeasureDefinition).measureDefinition.aggregation;

    it("asks for a label's value and its count, to tell one value from several", () => {
        const references: ReferenceMap = {
            "label/city": { ref: idRef("city", "displayForm"), type: "displayForm" },
        };

        const { metrics, countMap } = getLabels(references);

        expect(metrics.map(measureLocalId)).toEqual(["m_max_0", "m_count_0"]);
        expect(metrics.map(aggregationOf)).toEqual(["max", "count"]);
        expect(countMap).toEqual({ m_max_0: "m_count_0" });
    });

    it("aggregates a computed attribute exactly like a label", () => {
        const references: ReferenceMap = {
            "computed_attribute/tier": { ref: idRef("tier", "computedAttribute"), type: "computedAttribute" },
        };

        const { metrics, countMap } = getLabels(references);

        expect(metrics.map(measureLocalId)).toEqual(["m_max_0", "m_count_0"]);
        expect(metrics.map(aggregationOf)).toEqual(["max", "count"]);
        expect(countMap).toEqual({ m_max_0: "m_count_0" });
    });

    it("keeps its own object type on the aggregated item", () => {
        // The ref, not the aggregation, is what tells the backend which object this is — a
        // computed attribute has no labels, so it must not be asked for as a display form.
        const references: ReferenceMap = {
            "computed_attribute/tier": { ref: idRef("tier", "computedAttribute"), type: "computedAttribute" },
        };

        const { metrics } = getLabels(references);

        expect(
            metrics.map((m) => (m.measure.definition as IMeasureDefinition).measureDefinition.item),
        ).toEqual([idRef("tier", "computedAttribute"), idRef("tier", "computedAttribute")]);
    });

    it("keeps the pairing right when both kinds are referenced", () => {
        const references: ReferenceMap = {
            "computed_attribute/tier": { ref: idRef("tier", "computedAttribute"), type: "computedAttribute" },
            "label/city": { ref: idRef("city", "displayForm"), type: "displayForm" },
        };

        const { metrics, countMap } = getLabels(references);

        expect(metrics.map(measureLocalId)).toEqual(["m_max_0", "m_count_0", "m_max_1", "m_count_1"]);
        expect(countMap).toEqual({ m_max_0: "m_count_0", m_max_1: "m_count_1" });
    });
});

describe("parameter references", () => {
    const references: ReferenceMap = {
        "parameter/top_n": { ref: idRef("top_n", "parameter"), type: "parameter" },
    };

    it("is never executed as a measure", () => {
        expect(getMeasures(references)).toEqual([]);
    });

    it("is never executed as a label", () => {
        expect(getLabels(references).metrics).toEqual([]);
    });
});
