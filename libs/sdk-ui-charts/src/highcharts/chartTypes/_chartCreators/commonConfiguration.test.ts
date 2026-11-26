// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { createIntlMock } from "@gooddata/sdk-ui";

import { getPointValueDescription } from "./commonConfiguration.js";

describe("getPointValueDescription", () => {
    const intl = createIntlMock();

    it("should describe a regular point by its y value", () => {
        const point = { y: 158105, format: "#,##0.00", series: { type: "line" } };

        expect(getPointValueDescription(point, {}, intl)).toBe("158,105.00");
    });

    it("should describe a range point by both its lower and upper bound", () => {
        const point = {
            y: -70026296,
            low: -70026296,
            high: 29931930,
            format: "#,##0.00",
            series: { type: "arearange" },
        };

        expect(getPointValueDescription(point, {}, intl)).toBe("-70,026,296.00 to 29,931,930.00");
    });

    it("should describe a spline range point by both its bounds", () => {
        const point = { low: 1, high: 2, format: "#,##0.00", series: { type: "areasplinerange" } };

        expect(getPointValueDescription(point, {}, intl)).toBe("1.00 to 2.00");
    });

    it("should not describe a line point with only the anomaly high value as a range", () => {
        const point = { y: 5, high: 5, format: "#,##0.00", series: { type: "line" } };

        expect(getPointValueDescription(point, {}, intl)).toBe("5.00");
    });

    it("should describe null points explicitly instead of with an empty value", () => {
        const linePoint = { y: null, isNull: true, series: { type: "line" } };
        const rangePoint = { low: null, high: null, isNull: true, series: { type: "arearange" } };

        expect(getPointValueDescription(linePoint, {}, intl)).toBe("no value");
        expect(getPointValueDescription(rangePoint, {}, intl)).toBe("no value");
    });
});
