// (C) 2021-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { findAllObjects } from "./findObjects.js";
import { MaqlMetric } from "./parseMaql.js";
import { AntlrRange, type IMaqlObject } from "./tokenRanges.js";

describe("findAllObjects tests", () => {
    it("simple select object", () => {
        const metric = new MaqlMetric("SELECT {fact/1}");
        const result = findAllObjects(metric);
        const expected: IMaqlObject[] = [
            expect.objectContaining({
                tigerType: "fact",
                id: "1",
                range: new AntlrRange(2, 7, 2, 15),
            }),
        ];
        expect(result).toEqual(expected);
    });

    it("incomplete object", () => {
        const metric = new MaqlMetric("SELECT {fact/2");
        const result = findAllObjects(metric);
        expect(result).toEqual([]);
    });

    it("no attribute in expected attribute context", () => {
        const metric = new MaqlMetric("SELECT COUNT()");
        const result = findAllObjects(metric);
        expect(result).toEqual([]);
    });

    it("finds parameter object", () => {
        const metric = new MaqlMetric("SELECT TOP({parameter/topN}) WHERE {metric/2} > 10");
        const result = findAllObjects(metric);
        const parameter = result.find((object) => object.tigerType === "parameter");

        expect(parameter).toEqual(
            expect.objectContaining({
                tigerType: "parameter",
                id: "topN",
            }),
        );
    });
});
