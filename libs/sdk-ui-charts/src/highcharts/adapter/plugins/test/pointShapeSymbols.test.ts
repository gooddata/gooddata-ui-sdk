// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { registerPointShapeSymbols } from "../pointShapeSymbols.js";

function createHighchartsMock() {
    return {
        SVGRenderer: {
            prototype: {
                symbols: {} as Record<string, (x: number, y: number, w: number, h: number) => unknown>,
            },
        },
    };
}

describe("registerPointShapeSymbols", () => {
    it("should register the custom marker symbols on the SVG renderer", () => {
        const Highcharts = createHighchartsMock();

        registerPointShapeSymbols(Highcharts);

        const symbols = Highcharts.SVGRenderer.prototype.symbols;
        ["star", "cross", "plus", "pentagon", "hexagon", "octagon", "arrow", "triangle-up"].forEach(
            (shape) => {
                expect(typeof symbols[shape]).toBe("function");
            },
        );
    });

    it("should not register Highcharts built-in symbols", () => {
        const Highcharts = createHighchartsMock();

        registerPointShapeSymbols(Highcharts);

        const symbols = Highcharts.SVGRenderer.prototype.symbols;
        ["circle", "square", "diamond", "triangle", "triangle-down"].forEach((builtIn) => {
            expect(symbols[builtIn]).toBeUndefined();
        });
    });

    it("registered symbols should produce a closed SVG path within the bounding box", () => {
        const Highcharts = createHighchartsMock();

        registerPointShapeSymbols(Highcharts);

        const path = Highcharts.SVGRenderer.prototype.symbols["star"](0, 0, 10, 10) as Array<
            Array<string | number>
        >;

        expect(path[0][0]).toBe("M");
        expect(path[path.length - 1]).toEqual(["Z"]);
        // every coordinate stays within the 0..10 bounding box
        path.slice(0, -1).forEach(([, x, y]) => {
            expect(x).toBeGreaterThanOrEqual(0);
            expect(x).toBeLessThanOrEqual(10);
            expect(y).toBeGreaterThanOrEqual(0);
            expect(y).toBeLessThanOrEqual(10);
        });
    });

    it("should be a no-op when the SVG renderer is unavailable", () => {
        expect(() => registerPointShapeSymbols({})).not.toThrow();
        expect(() => registerPointShapeSymbols(undefined)).not.toThrow();
    });
});
