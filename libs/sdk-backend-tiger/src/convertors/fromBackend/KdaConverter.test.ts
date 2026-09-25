// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type AfmMetricValueChange } from "@gooddata/api-client-tiger";

import { convertChangeAnalyzeToKeyDriver } from "./KdaConverter.js";

const row: AfmMetricValueChange = {
    attributeName: "region",
    attributeRef: { identifier: { id: "region", type: "label" } },
    attributeValue: "West",
    metricValueInAnalyzedPeriod: 120,
    metricValueInReferencePeriod: 100,
    metricValueDelta: 20,
    metricValueDeltaAbs: 20,
    attributeValuesChangeMean: 5,
    attributeValuesChangeStd: 2,
    isSignificantChange: true,
    overallMetricValueInAnalyzedPeriod: 1200,
    overallMetricValueInReferencePeriod: 1000,
};

describe("convertChangeAnalyzeToKeyDriver", () => {
    it("types a label driver as a display form", () => {
        expect(convertChangeAnalyzeToKeyDriver(row).displayForm).toEqual({
            identifier: "region",
            type: "displayForm",
        });
    });

    it("types a computed attribute driver as a computed attribute", () => {
        const driver = convertChangeAnalyzeToKeyDriver({
            ...row,
            attributeRef: { identifier: { id: "region", type: "computedAttribute" } },
        });

        expect(driver.displayForm).toEqual({ identifier: "region", type: "computedAttribute" });
    });

    it("falls back to an untyped ref when the backend sends no attributeRef", () => {
        const { attributeRef: _attributeRef, ...legacyRow } = row;

        const driver = convertChangeAnalyzeToKeyDriver(legacyRow as AfmMetricValueChange);

        expect(driver.displayForm).toEqual({ identifier: "region" });
    });
});
