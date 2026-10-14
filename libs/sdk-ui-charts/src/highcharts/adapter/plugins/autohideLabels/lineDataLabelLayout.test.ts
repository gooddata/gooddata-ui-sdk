// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type ILabelBoxInput, predictLabelBox } from "./lineDataLabelLayout.js";

// expected boxes were measured on Highcharts 12.2 in Chrome (label.absoluteBox after hideOverlappingLabels)
const base: ILabelBoxInput = {
    plotX: 0,
    plotY: 0,
    textWidth: 34.21875,
    textHeight: 12,
    padding: 5,
    x: 0,
    y: 0,
    verticalAlign: "bottom",
    plotWidth: 560,
    plotHeight: 250,
    horizontalAxisShift: 0,
    verticalAxisShift: 0,
    translateX: 0,
    translateY: 0,
};

describe("predictLabelBox", () => {
    it("should center the label above the point", () => {
        expect(predictLabelBox({ ...base, plotX: 40.39, plotY: 168.07780666667 })).toEqual({
            x: 23,
            y: 151,
            width: 34.21875,
            height: 12,
        });
    });

    it("should keep the text of a label at the left edge inside the plot", () => {
        expect(predictLabelBox({ ...base, plotX: 1.9, plotY: 181, textWidth: 21.78125 })).toMatchObject({
            x: 0,
            y: 164,
        });
    });

    it("should move a label that does not fit above the point below it", () => {
        expect(predictLabelBox({ ...base, plotX: 100, plotY: 10 })).toMatchObject({ y: 15 });
    });

    it("should keep a label with a negative offset inside the plot instead of moving it below the point", () => {
        expect(predictLabelBox({ ...base, plotX: 100, plotY: 10, y: -6 })).toMatchObject({ y: 0 });
    });
});
