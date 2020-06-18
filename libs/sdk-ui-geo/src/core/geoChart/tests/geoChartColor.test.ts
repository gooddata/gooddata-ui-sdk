// (C) 2020 GoodData Corporation
import {
    generateLegendColorData,
    getColorIndexInPalette,
    getColorPaletteMapping,
    getPushpinColors,
} from "../geoChartColor";
import { DefaultColorPalette } from "@gooddata/sdk-ui";
import { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";
import { DEFAULT_COLORS } from "../constants/geoChart";
import { RecShortcuts } from "../../../../__mocks__/recordings";
import { getColorStrategy } from "../colorStrategy/geoChart";

describe("getPushpinColors", () => {
    it("should return pushpin RGB colors", () => {
        const { dv, geoData } = RecShortcuts.LocationSegmentAndColor_Small;
        const colorStrategy: IColorStrategy = getColorStrategy(DefaultColorPalette, [], geoData, dv);

        const colors: number[] = geoData.color!.data;
        const segments = geoData.segment!.data;

        expect(getPushpinColors(colors, segments, colorStrategy)).toMatchSnapshot();
    });

    it("should return default RGB color when colors and segmentBy are empty", () => {
        const { dv, geoData } = RecShortcuts.LocationOnlySmall;
        const colorStrategy: IColorStrategy = getColorStrategy(DefaultColorPalette, [], geoData, dv);

        expect(getPushpinColors([], undefined, colorStrategy)).toEqual([
            {
                background: "rgba(20,178,226,0.7)",
                border: "rgb(233,237,241)",
            },
        ]);
    });

    it("should return one RGB color when all colors having same values and segmentBy is empty", () => {
        const { dv, geoData } = RecShortcuts.LocationAndColor_Small;
        const colorStrategy: IColorStrategy = getColorStrategy(DefaultColorPalette, [], geoData, dv);

        const sameColorValues = geoData.color!.data.map((_) => 10);

        expect(getPushpinColors(sameColorValues, undefined, colorStrategy)).toEqual([
            { background: "rgba(20,178,226,0.7)", border: "rgb(233,237,241)" },
        ]);
    });

    it("should return pushpin RGB colors with null values", () => {
        const { dv, geoData } = RecShortcuts.LocationSegmentAndColor_Small;
        const colorStrategy: IColorStrategy = getColorStrategy(DefaultColorPalette, [], geoData, dv);

        const colors: Array<number | null> = geoData.color!.data;
        colors[1] = null;
        const segments = geoData.segment!.data;

        expect(getPushpinColors(colors, segments, colorStrategy)).toMatchSnapshot();
    });

    it("should return pushpin RGB colors with null value without segment", () => {
        const { dv, geoData } = RecShortcuts.LocationAndColor_Small;
        const colorStrategy: IColorStrategy = getColorStrategy(DefaultColorPalette, [], geoData, dv);

        const colors: Array<number | null> = geoData.color!.data;
        colors[1] = null;

        expect(getPushpinColors(colors, undefined, colorStrategy)).toMatchSnapshot();
    });

    it("should return pushpin RGB colors with range of negative and positive and null values", () => {
        const { dv, geoData } = RecShortcuts.LocationAndColor_Small;
        const colorStrategy: IColorStrategy = getColorStrategy(DefaultColorPalette, [], geoData, dv);

        const colors: Array<number | null> = geoData.color!.data;
        colors[0] = null;
        colors[1] = -100;
        colors[2] = -50;
        colors[3] = 0;

        expect(getPushpinColors(colors, [], colorStrategy)).toMatchSnapshot();
    });
});

describe("getColorPaletteMapping", () => {
    it("should return color palette mapping with one segment item", () => {
        const { dv, geoData } = RecShortcuts.LocationSegmentAndColor_Small;
        const colorStrategy: IColorStrategy = getColorStrategy(DefaultColorPalette, [], geoData, dv);
        expect(getColorPaletteMapping(colorStrategy)).toMatchSnapshot();
    });

    it("should return palette in first default color with no segment item", () => {
        const { dv, geoData } = RecShortcuts.LocationAndColor_Small;
        const colorStrategy: IColorStrategy = getColorStrategy(DefaultColorPalette, [], geoData, dv);
        expect(getColorPaletteMapping(colorStrategy)).toEqual({
            default_segment_item: [
                "rgba(215,242,250,0.7)",
                "rgba(176,229,245,0.7)",
                "rgba(137,216,240,0.7)",
                "rgba(98,203,235,0.7)",
                "rgba(59,190,230,0.7)",
                "rgba(20,178,226,0.7)",
            ],
        });
    });

    it("should return color palette mappings", () => {
        const { dv, geoData } = RecShortcuts.AllAndSmall;
        const colorStrategy: IColorStrategy = getColorStrategy(DefaultColorPalette, [], geoData, dv);
        expect(getColorPaletteMapping(colorStrategy)).toMatchSnapshot();
    });

    it("should rotate to zero after 20 items", () => {
        const { dv, geoData } = RecShortcuts.LocationSegmentAndColor_Small;
        const colorStrategy: IColorStrategy = getColorStrategy(DefaultColorPalette, [], geoData, dv);
        const mapping = getColorPaletteMapping(colorStrategy);
        expect(mapping.item0).toEqual(mapping.item20);
    });
});

describe("getColorIndexInPalette", () => {
    it.each([
        [0, 100],
        [1, 120],
        [2, 220],
        [2, 300],
        [3, 312],
        [5, 700],
        [5, 800],
        [0, null],
        [5, 700],
    ])("should return %s", (expected: number, value: number | null) => {
        expect(getColorIndexInPalette(value, 100, 700)).toBe(expected);
    });

    it("should return 0 with Min value equal Max value ", () => {
        expect(getColorIndexInPalette(30, 100, 100)).toBe(0);
    });

    it("should return with negative color values", () => {
        expect(getColorIndexInPalette(-20, -100, -10)).toBe(5);
    });
});

describe("generateLegendColorData", () => {
    it("should return empty array if have no color series is empty", () => {
        const colorData = generateLegendColorData([], DEFAULT_COLORS[0]);
        expect(colorData).toEqual([]);
    });

    it("should return empty array if all color series have same values", () => {
        const colorSeries = [1, 1, 1, 1, 1, 1, 1];
        const colorData = generateLegendColorData(colorSeries, DEFAULT_COLORS[0]);
        expect(colorData).toEqual([]);
    });

    it("should generate full color items", () => {
        const colorSeries = [0, 1, 2, 3, 4, 5, 6];
        const colorData = generateLegendColorData(colorSeries, DEFAULT_COLORS[0]);
        expect(colorData).toEqual([
            {
                color: "rgba(215,242,250,0.7)",
                range: {
                    from: 0,
                    to: 1,
                },
            },
            {
                color: "rgba(176,229,245,0.7)",
                range: {
                    from: 1,
                    to: 2,
                },
            },
            {
                color: "rgba(137,216,240,0.7)",
                range: {
                    from: 2,
                    to: 3,
                },
            },
            {
                color: "rgba(98,203,235,0.7)",
                range: {
                    from: 3,
                    to: 4,
                },
            },
            {
                color: "rgba(59,190,230,0.7)",
                range: {
                    from: 4,
                    to: 5,
                },
            },
            {
                color: "rgba(20,178,226,0.7)",
                range: {
                    from: 5,
                    to: 6,
                },
            },
        ]);
    });
});
