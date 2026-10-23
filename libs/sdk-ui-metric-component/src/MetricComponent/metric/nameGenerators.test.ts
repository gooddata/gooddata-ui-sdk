// (C) 2007-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type IMeasureMetadataObject } from "@gooddata/sdk-model";

import { deriveIdFromTitle, generateUniqId, generateUniqTitle } from "./nameGenerators.js";

const metricCurrent = {
    id: "metric",
    title: "Metric",
} as IMeasureMetadataObject;

const metricOriginal = {
    id: "metric_id_22",
    title: "Metric ID 22",
} as IMeasureMetadataObject;

describe("generateUniqTitle", () => {
    it("should return same title without metric list", () => {
        expect(generateUniqTitle(metricCurrent)).toBe("Metric");
    });

    it("should return title with suffix with same metric in list", () => {
        expect(generateUniqTitle(metricCurrent, [metricCurrent])).toBe("Metric (2)");
    });

    it("should get uniq title with following number", () => {
        expect(
            generateUniqTitle(metricOriginal, [
                metricOriginal,
                { ...metricOriginal, title: "Metric ID 22 (2)" },
                { ...metricOriginal, title: "Metric ID 22 (3)" },
                { ...metricOriginal, title: "Metric ID 22 (4)" },
                { ...metricOriginal, title: "Metric ID 22 (5)" },
            ]),
        ).toBe("Metric ID 22 (6)");
    });

    it("should get uniq title with free number", () => {
        expect(
            generateUniqTitle(metricOriginal, [
                metricOriginal,
                { ...metricOriginal, title: "Metric ID 22 (2)" },
                { ...metricOriginal, title: "Metric ID 22 (3) test" },
                { ...metricOriginal, title: "Metric ID 22 (4)" },
                { ...metricOriginal, title: "Metric ID 22 (5)" },
            ]),
        ).toBe("Metric ID 22 (3)");
    });

    it("should get title from with correct suffix", () => {
        const metric = { ...metricCurrent, title: "Metric (2)", id: "metric_2" };

        expect(generateUniqTitle(metric)).toBe("Metric (2)");
    });

    it("get title from original metric that is already (2) suffix nad metric without suffix", () => {
        const metric1 = { ...metricCurrent };
        const metric2 = { ...metricCurrent, title: "Metric (2)", id: "metric_2" };

        expect(generateUniqTitle(metric1, [metric1, metric2])).toBe("Metric (3)");
    });
});

describe("generateUniqId", () => {
    it("should return id derived from title", () => {
        expect(generateUniqId(metricCurrent.title)).toBe("metric");
    });

    it("should return id with suffix when id exists", () => {
        expect(generateUniqId(metricCurrent.title, "", [metricCurrent])).toBe("metric_2");
    });

    it("should get uniq id with following number", () => {
        expect(
            generateUniqId(metricOriginal.title, "", [
                metricOriginal,
                { ...metricOriginal, id: "metric_id_22_2" },
                { ...metricOriginal, id: "metric_id_22_3" },
                { ...metricOriginal, id: "metric_id_22_4" },
                { ...metricOriginal, id: "metric_id_22_5" },
            ]),
        ).toBe("metric_id_22_6");
    });

    it("should get uniq title with free number", () => {
        expect(
            generateUniqId(metricOriginal.title, "", [
                metricOriginal,
                { ...metricOriginal, id: "metric_id_22_2" },
                { ...metricOriginal, id: "metric_id_22_3_test" },
                { ...metricOriginal, id: "metric_id_22_4" },
                { ...metricOriginal, id: "metric_id_22_5" },
            ]),
        ).toBe("metric_id_22_3");
    });

    it("should get id derived from title with correct suffix", () => {
        const metric = { ...metricCurrent, title: "Metric (2)", id: "metric_2" };

        expect(generateUniqId(metric.title)).toBe("metric_2");
    });

    it("get title from original metric that is already (2) suffix nad metric without suffix", () => {
        const metric1 = { ...metricCurrent };
        const metric2 = { ...metricCurrent, title: "Metric (2)", id: "metric_2" };

        expect(generateUniqId(metric1.title, "", [metric1, metric2])).toBe("metric_3");
    });

    it("with prefix, should return id derived from title", () => {
        expect(generateUniqId(metricCurrent.title, "prefix.")).toBe("metric");
    });

    it("with prefix, should return id with suffix when id exists", () => {
        expect(generateUniqId(metricCurrent.title, "prefix.", [metricCurrent])).toBe("metric");
    });

    it("with prefix, should get uniq id with following number", () => {
        expect(
            generateUniqId(metricOriginal.title, "prefix.", [
                { ...metricOriginal, id: "prefix." + metricOriginal.id },
                { ...metricOriginal, id: "prefix.metric_id_22_2" },
                { ...metricOriginal, id: "metric_id_22_3" },
                { ...metricOriginal, id: "metric_id_22_4" },
                { ...metricOriginal, id: "metric_id_22_5" },
            ]),
        ).toBe("metric_id_22_3");
    });

    it("with prefix, should get uniq title with free number", () => {
        expect(
            generateUniqId(metricOriginal.title, "prefix.", [
                { ...metricOriginal, id: "prefix." + metricOriginal.id },
                { ...metricOriginal, id: "prefix.metric_id_22_2" },
                { ...metricOriginal, id: "prefix.metric_id_22_3_test" },
                { ...metricOriginal, id: "metric_id_22_4" },
                { ...metricOriginal, id: "metric_id_22_5" },
            ]),
        ).toBe("metric_id_22_3");
    });

    it("with prefix, should get id derived from title with correct suffix", () => {
        const metric = { ...metricCurrent, title: "Metric (2)", id: "metric_2" };

        expect(generateUniqId(metric.title, "prefix.")).toBe("metric_2");
    });

    it("with prefix, get title from original metric that is already (2) suffix nad metric without suffix", () => {
        const metric1 = { ...metricCurrent, id: "prefix." + metricCurrent.id };
        const metric2 = { ...metricCurrent, title: "Metric (2)", id: "prefix.metric_2" };

        expect(generateUniqId(metric1.title, "prefix.", [metric1, metric2])).toBe("metric_3");
    });

    it("generate id that is not contains parents prefixes", () => {
        const metric1 = { ...metricCurrent };
        const metric2 = { ...metricCurrent, title: "Metric (2)", id: "metric_2" };

        expect(generateUniqId("parent", "", [metric1, metric2], ["parent"])).toBe("1_parent");
        expect(generateUniqId("parent", "", [metric1, metric2], ["parent", "1_parent"])).toBe("2_1_parent");

        expect(generateUniqId("parentid", "", [metric1, metric2], ["parent"])).toBe("1_parentid");
        expect(generateUniqId("parent_id", "", [metric1, metric2], ["parent", "1_parent"])).toBe(
            "2_1_parent_id",
        );
    });
});

describe("deriveIdFromTitle", () => {
    it("valid ids", () => {
        expect(deriveIdFromTitle("test")).toBe("test");
        expect(deriveIdFromTitle("9test")).toBe("9test");
        expect(deriveIdFromTitle("test.test")).toBe("test.test");
    });

    it("sanitize whitespaces", () => {
        expect(deriveIdFromTitle("  test   ")).toBe("test");
    });

    it("sanitize invalid starts", () => {
        expect(deriveIdFromTitle("..test")).toBe("test");
        expect(deriveIdFromTitle("-test")).toBe("-test");
        expect(deriveIdFromTitle("_test")).toBe("test");
        expect(deriveIdFromTitle("test..")).toBe("test..");
        expect(deriveIdFromTitle("test--")).toBe("test--");
        expect(deriveIdFromTitle("test_")).toBe("test");
        expect(deriveIdFromTitle("..test-.")).toBe("test-.");
        expect(deriveIdFromTitle("..test.-_")).toBe("test.-");
    });

    it("sanitize czech chars", () => {
        expect(deriveIdFromTitle("áčďéíňóřšťůúýž")).toBe("acdeinorstuuyz");
        expect(deriveIdFromTitle("Kvartální prodej")).toBe("kvartalni_prodej");
    });

    describe("handle special cases", () => {
        it("id is empty", () => {
            expect(deriveIdFromTitle(".")).toBe("");
        });
    });
});
