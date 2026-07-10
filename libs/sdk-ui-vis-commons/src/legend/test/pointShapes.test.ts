// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    CUSTOM_POINT_SHAPES,
    POINT_SHAPE_POLYGONS,
    getPointShapeClipPath,
    getPointShapeSvgPath,
} from "../pointShapes.js";

describe("pointShapes", () => {
    describe("CUSTOM_POINT_SHAPES", () => {
        it("should expose every documented non built-in shape", () => {
            expect(CUSTOM_POINT_SHAPES).toEqual([
                "triangle-up",
                "triangle-left",
                "triangle-right",
                "pentagon",
                "hexagon",
                "octagon",
                "star",
                "plus",
                "cross",
                "arrow",
            ]);
        });

        it("should not contain Highcharts built-in shapes", () => {
            ["circle", "square", "diamond", "triangle", "triangle-down"].forEach((builtIn) => {
                expect(CUSTOM_POINT_SHAPES).not.toContain(builtIn);
            });
        });
    });

    describe("polygon definitions", () => {
        it("should keep every vertex within the normalized 0..1 box", () => {
            Object.values(POINT_SHAPE_POLYGONS).forEach((polygon) => {
                polygon.forEach(([x, y]) => {
                    expect(x).toBeGreaterThanOrEqual(0);
                    expect(x).toBeLessThanOrEqual(1);
                    expect(y).toBeGreaterThanOrEqual(0);
                    expect(y).toBeLessThanOrEqual(1);
                });
            });
        });
    });

    describe("getPointShapeClipPath", () => {
        it("should return undefined for non-polygonal / unknown / empty shapes", () => {
            expect(getPointShapeClipPath(undefined)).toBeUndefined();
            expect(getPointShapeClipPath("circle")).toBeUndefined();
            expect(getPointShapeClipPath("square")).toBeUndefined();
            expect(getPointShapeClipPath("diamond")).toBeUndefined();
            expect(getPointShapeClipPath("nonsense")).toBeUndefined();
        });

        it("should build a percentage polygon clip-path for a polygonal shape", () => {
            expect(getPointShapeClipPath("triangle-up")).toBe("polygon(50% 0%, 100% 100%, 0% 100%)");
        });

        it("should build a clip-path for the built-in triangles used by legend icons", () => {
            expect(getPointShapeClipPath("triangle")).toBe("polygon(50% 0%, 100% 100%, 0% 100%)");
            expect(getPointShapeClipPath("triangle-down")).toBe("polygon(0% 0%, 100% 0%, 50% 100%)");
        });
    });

    describe("getPointShapeSvgPath", () => {
        it("should return undefined for built-in / unknown shapes", () => {
            expect(getPointShapeSvgPath("circle", 0, 0, 10, 10)).toBeUndefined();
            expect(getPointShapeSvgPath("nonsense", 0, 0, 10, 10)).toBeUndefined();
        });

        it("should map normalized vertices into the bounding box and close the path", () => {
            const path = getPointShapeSvgPath("triangle-up", 5, 20, 10, 10)!;

            expect(path).toEqual([
                ["M", 10, 20], // (0.5, 0) -> 5 + 0.5*10, 20 + 0*10
                ["L", 15, 30], // (1, 1)   -> 5 + 1*10,   20 + 1*10
                ["L", 5, 30], // (0, 1)   -> 5 + 0*10,   20 + 1*10
                ["Z"],
            ]);
        });
    });
});
