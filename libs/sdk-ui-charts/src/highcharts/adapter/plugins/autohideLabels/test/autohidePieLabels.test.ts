// (C) 2007-2018 GoodData Corporation
import autohidePieLabels from "../autohidePieLabels.js";
import { describe, it, expect } from "vitest";

function setupMockData(indexOfFirst: number, indexOfSecond: number): any {
    const positions = [
        {
            x: 718.5218164655049,
            y: 149,
        },
        {
            x: 833.6070833853988,
            y: 356,
        },
        {
            x: 709.8263831445424,
            y: 557,
        },
        {
            x: 474.9734097704467,
            y: 548,
        },
        {
            x: 366.4988299429339,
            y: 342,
        },
        {
            x: 486.56803500194474,
            y: 146,
        },
    ];
    const shouldOverlap = (i: number, first: number, second: number) => i === first || i === second;
    const generatePoint = (i: number, first: number, second: number) => ({
        dataLabel: {
            ...positions[i],
            width: shouldOverlap(i, first, second) ? 500 : 20,
            height: 23,
            visible: true,
            show() {
                this.visible = true;
            },
            hide() {
                this.visible = false;
            },
        },
    });
    const points = [];
    for (let i = 0; i < 6; i++) {
        points.push(generatePoint(i, indexOfFirst, indexOfSecond));
    }
    return {
        series: [
            {
                visible: true,
                points,
            },
        ],
    };
}

describe("autohidePieLabels", () => {
    it("should handle non-overlapping labels", () => {
        const mockedData = setupMockData(-1, -1);

        autohidePieLabels(mockedData);

        expect(mockedData.series[0].points.map((point: any) => point.dataLabel.visible)).toEqual([
            true,
            true,
            true,
            true,
            true,
            true,
        ]);
    });

    it("should handle overlapping first and last labels", () => {
        const mockedData = setupMockData(0, 5);

        autohidePieLabels(mockedData);

        expect(mockedData.series[0].points.map((point: any) => point.dataLabel.visible)).toEqual([
            true,
            true,
            true,
            true,
            true,
            false,
        ]);
    });

    it("should handle overlapping labels next each other", () => {
        const mockedData = setupMockData(2, 3);

        autohidePieLabels(mockedData);

        expect(mockedData.series[0].points.map((point: any) => point.dataLabel.visible)).toEqual([
            true,
            true,
            true,
            false,
            true,
            true,
        ]);
    });

    it("should handle overlapping random labels", () => {
        const mockedData = setupMockData(1, 4);

        autohidePieLabels(mockedData);

        expect(mockedData.series[0].points.map((point: any) => point.dataLabel.visible)).toEqual([
            true,
            true,
            true,
            true,
            false,
            true,
        ]);
    });
});
