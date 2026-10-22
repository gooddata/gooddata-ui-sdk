// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IResultAttributeHeader } from "@gooddata/sdk-model";
import { type IColorAssignment } from "@gooddata/sdk-ui";
import { type IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import { EMPTY_SEGMENT_VALUE } from "../constants.js";

import { getPushpinColors } from "./palette.js";

const COLORS = ["rgb(20,178,226)", "rgb(0,193,141)", "rgb(229,77,66)"];

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

describe("segment colors of number-formatted attribute values", () => {
    it("keys segment colors by the raw element, not by the formatted name", () => {
        const strategy = colorStrategy([segmentHeader("1000", "1,000"), segmentHeader("2000", "2,000")]);

        const colors = getPushpinColors([], ["1000", "2000", "1000"], strategy).map((c) => c.background);

        expect(colors[0]).not.toEqual(colors[1]);
        expect(colors[0]).toEqual(colors[2]);
    });

    it("gives distinct elements their own colors when the number format rounds them to the same name", () => {
        const strategy = colorStrategy([segmentHeader("1.2", "1"), segmentHeader("1.4", "1")]);

        const colors = getPushpinColors([], ["1.2", "1.4"], strategy).map((c) => c.background);

        expect(colors[0]).not.toEqual(colors[1]);
    });

    it("gives empty and null segments the null element's color, as the legend shows only one of them", () => {
        const strategy = colorStrategy([segmentHeader(""), segmentHeader("East"), segmentHeader(null)]);

        const colors = getPushpinColors([], ["", "East", EMPTY_SEGMENT_VALUE], strategy).map(
            (c) => c.background,
        );

        expect(colors[0]).toEqual(colors[2]);
        expect(colors[0]).not.toEqual(colors[1]);
    });
});
