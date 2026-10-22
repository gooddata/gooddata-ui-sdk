// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IResultAttributeHeader } from "@gooddata/sdk-model";
import { type IColorAssignment } from "@gooddata/sdk-ui";
import { type IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import { getPushpinColors } from "./geoChartColor.js";

const COLORS = ["rgb(20,178,226)", "rgb(0,193,141)", "rgb(229,77,66)", "rgb(241,134,0)"];

function segmentHeader(name: string | null, formattedName?: string): IResultAttributeHeader {
    return {
        attributeHeaderItem: {
            uri: name as string,
            name: name as string,
            ...(formattedName === undefined ? {} : { formattedName }),
        },
    };
}

function colorStrategy(headers: IResultAttributeHeader[]): IColorStrategy {
    const assignments: IColorAssignment[] = headers.map((headerItem, index) => ({
        headerItem,
        color: { type: "guid", value: String(index) },
    }));

    return {
        getColorAssignment: () => assignments,
        getFullColorAssignment: () => assignments,
        getColorByIndex: (index: number) => COLORS[index],
    } as unknown as IColorStrategy;
}

const backgrounds = (colors: ReturnType<typeof getPushpinColors>) => colors.map((c) => c.background);

describe("legacy geo segment colors", () => {
    it("keys segment colors by the raw element, not by the formatted name", () => {
        const strategy = colorStrategy([segmentHeader("1000", "1,000"), segmentHeader("2000", "2,000")]);

        const colors = backgrounds(getPushpinColors([], ["1000", "2000", "1000"], strategy));

        expect(colors[0]).not.toEqual(colors[1]);
        expect(colors[0]).toEqual(colors[2]);
    });

    it("gives distinct elements their own colors when the number format rounds them to the same name", () => {
        const strategy = colorStrategy([segmentHeader("1.2", "1"), segmentHeader("1.4", "1")]);

        expect(new Set(backgrounds(getPushpinColors([], ["1.2", "1.4"], strategy))).size).toBe(2);
        expect(new Set(backgrounds(getPushpinColors([10, 20], ["1.2", "1.4"], strategy))).size).toBe(2);
    });

    it("gives empty and null segments the colors of their own legend items", () => {
        const strategy = colorStrategy([
            segmentHeader(""),
            segmentHeader(null),
            segmentHeader("East Coast"),
            segmentHeader("West Coast"),
        ]);

        const colors = backgrounds(
            getPushpinColors([], ["", null, "East Coast", "West Coast", "East Coast"], strategy),
        );

        expect(colors.slice(0, 4)).toEqual([
            "rgba(20,178,226,0.7)",
            "rgba(0,193,141,0.7)",
            "rgba(229,77,66,0.7)",
            "rgba(241,134,0,0.7)",
        ]);
        expect(colors[4]).toEqual(colors[2]);
    });

    it("gives empty segments the null element's palette when coloring by a measure", () => {
        const strategy = colorStrategy([segmentHeader(""), segmentHeader(null), segmentHeader("East Coast")]);

        const colors = getPushpinColors([1, 1, 1], ["", null, "East Coast"], strategy);

        expect(colors[0]).toEqual(colors[1]);
        expect(colors[0]).not.toEqual(colors[2]);
    });
});
