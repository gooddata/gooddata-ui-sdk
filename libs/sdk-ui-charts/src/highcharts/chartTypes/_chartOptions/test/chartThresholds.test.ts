// (C) 2025 GoodData Corporation
import { describe, it, expect } from "vitest";
import { generateZones, getTrendDividerPlotLines } from "../chartThresholds";

const generateZonesFromData = (data: (number | null)[]) => {
    const thresholdSeries = data.map((value) => ({ y: value }));
    return {
        zones: generateZones(thresholdSeries),
        plotLines: getTrendDividerPlotLines(thresholdSeries),
    };
};

describe("generateZones", () => {
    it.each([
        [[]],
        [[1]],
        [[0]],
        [[null]],
        [[1, 1]],
        [[0, 0]],
        [[0, 1]],
        [[1, 0]],
        [[1, 0, 0]],
        [[1, 1, 0]],
        [[0, 1, 1]],
        [[0, 0, 1]],
        [[1, 0, 1, 1]],
        [[1, 1, 0, 1]],
        [[0, 1, 0, 1]],
        [[1, 0, 1, 0]],
    ])("should generate expected zones and plot lines for threshold series %s", (data: (number | null)[]) => {
        const zones = generateZonesFromData(data);
        expect(zones).toMatchSnapshot();
    });
});
