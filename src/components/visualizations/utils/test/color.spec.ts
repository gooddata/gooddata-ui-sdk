// (C) 2007-2018 GoodData Corporation
import { IHeaderPredicate } from "../../../../interfaces/HeaderPredicate";
import {
    getLighterColor,
    normalizeColorToRGB,
    getColorPaletteFromColors,
    DEFAULT_COLOR_PALETTE,
    getValidColorPalette,
    getColorMappingPredicate,
} from "../color";
import {
    measureHeaders,
    context,
    attributeHeader,
    attributeHeaderItem,
} from "../../../../factory/tests/HeaderPredicateFactory.mock";

describe("Transformation", () => {
    describe("Lighten color", () => {
        it("should lighten and darken color correctly", () => {
            expect(getLighterColor("rgb(00,128,255)", 0.5)).toEqual("rgb(128,192,255)");
            expect(getLighterColor("rgb(00,128,255)", -0.5)).toEqual("rgb(0,64,128)");
        });
    });
});

describe("normalizeColorToRGB", () => {
    it("should just return the original color it is not in hex format", () => {
        const color = "rgb(255, 255, 255)";
        expect(normalizeColorToRGB(color)).toEqual(color);
    });
    it("should return color in rgb format if supplied color is in hex format", () => {
        const color = "#ffffff";
        const expectedColor = "rgb(255, 255, 255)";
        expect(normalizeColorToRGB(color)).toEqual(expectedColor);
    });
});

describe("getColorPaletteFromColors", () => {
    it("should return colorPalette made from string of rgb colors", () => {
        const colors = ["rgb(12,24,8}", "rgb(9,10,11"];
        const expectedResult = [
            { guid: "0", fill: { r: 12, g: 24, b: 8 } },
            { guid: "1", fill: { r: 9, g: 10, b: 11 } },
        ];
        const result = getColorPaletteFromColors(colors);

        expect(result).toEqual(expectedResult);
    });

    it("should return default palette when invalid colors are provided", () => {
        const colors = ["invalid", "colors"];
        const result = getColorPaletteFromColors(colors);

        expect(result).toEqual(DEFAULT_COLOR_PALETTE);
    });
});

describe("getValidColorPalette", () => {
    it("should return default color palette when colors and colorPalette are not defined", () => {
        const config = {};
        const expectedResult = DEFAULT_COLOR_PALETTE;
        const result = getValidColorPalette(config);

        expect(result).toEqual(expectedResult);
    });

    it("should return colors when color palette is not defined", () => {
        const config = {
            colors: ["rgb(1,24,8}", "rgb(90,10,11"],
        };
        const expectedResult = [
            { guid: "0", fill: { r: 1, g: 24, b: 8 } },
            { guid: "1", fill: { r: 90, g: 10, b: 11 } },
        ];
        const result = getValidColorPalette(config);

        expect(result).toEqual(expectedResult);
    });

    it("should return color palette when both are defined", () => {
        const config = {
            colors: ["rgb(1,24,8}", "rgb(90,10,11"],
            colorPalette: [
                { guid: "0", fill: { r: 1, g: 1, b: 2 } },
                { guid: "1", fill: { r: 9, g: 1, b: 1 } },
            ],
        };
        const result = getValidColorPalette(config);

        expect(result).toEqual(config.colorPalette);
    });
});

describe("getColorMappingPredicate", () => {
    describe("no references provided", () => {
        it("should match predicate when measure local identifier matches and measureHeaderItem tested", () => {
            const predicate: IHeaderPredicate = getColorMappingPredicate("uriBasedMeasureLocalIdentifier");

            expect(predicate(measureHeaders.uriBasedMeasure, context)).toEqual(true);
        });

        // tslint:disable-next-line:max-line-length
        it("should not match predicate when measure local identifier does not match and measureHeaderItem tested", () => {
            const predicate: IHeaderPredicate = getColorMappingPredicate("someOtherMeasure.localIdentifier");

            expect(predicate(measureHeaders.uriBasedMeasure, context)).toEqual(false);
        });

        it("should not match predicate when referenced uri matches and attributeHeader tested", () => {
            const predicate: IHeaderPredicate = getColorMappingPredicate("/attributeItemUri");

            expect(predicate(attributeHeader, {} as any)).toEqual(false);
        });

        it("should match predicate when referenced uri matches and attributeItemHeader tested", () => {
            const predicate: IHeaderPredicate = getColorMappingPredicate("/attributeItemUri");

            expect(predicate(attributeHeaderItem, {} as any)).toEqual(true);
        });
    });
});
