// (C) 2007-2023 GoodData Corporation
import { DefaultColorPalette, DataViewFacade } from "@gooddata/sdk-ui";
import {
    getColorMappingPredicate,
    getColorPaletteFromColors,
    getLighterColor,
    normalizeColorToRGB,
} from "@gooddata/sdk-ui-vis-commons";
import { emptyDef, uriRef, IAttributeDescriptor, IResultAttributeHeader } from "@gooddata/sdk-model";
import { dummyDataView } from "@gooddata/sdk-backend-mockingbird";
import { getValidColorPalette } from "../color.js";
import { describe, it, expect } from "vitest";

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
        const color = "rgb(255,255,255)";
        expect(normalizeColorToRGB(color)).toEqual(color);
    });
    it("should return color in rgb format if supplied color is in hex format", () => {
        const color = "#ffffff";
        const expectedColor = "rgb(255,255,255)";
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

        expect(result).toEqual(DefaultColorPalette);
    });
});

describe("getValidColorPalette", () => {
    it("should return default color palette when colors and colorPalette are not defined", () => {
        const config = {};
        const expectedResult = DefaultColorPalette;
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
    const uriBasedMeasure = {
        measureHeaderItem: {
            uri: "/uriBasedMeasureUri",
            localIdentifier: "uriBasedMeasureLocalIdentifier",
            identifier: "uriBasedMeasureIdentifier",
            name: "uriBasedMeasureName",
            format: "#,##0.00",
        },
    };

    const attributeDescriptor: IAttributeDescriptor = {
        attributeHeader: {
            uri: "/attributeUri",
            identifier: "attributeIdentifier",
            localIdentifier: "attributeLocalIdentifier",
            name: "attributeName",
            ref: uriRef("/attributeUri"),
            formOf: {
                uri: "/attributeElementUri",
                identifier: "attributeElementIdentifier",
                ref: uriRef("/attributeElementUri"),
                name: "attributeElementName",
            },
        },
    };

    const attributeHeaderItem: IResultAttributeHeader = {
        attributeHeaderItem: {
            uri: "/attributeItemUri",
            name: "attributeItemName",
        },
    };

    const falsyAttributeHeaderItem = (value: any) => ({
        attributeHeaderItem: {
            uri: value,
            name: value,
        },
    });

    const context = { dv: DataViewFacade.for(dummyDataView(emptyDef("testWorkspace"))) };

    describe("no references provided", () => {
        it("should match predicate when measure local identifier matches", () => {
            const predicate = getColorMappingPredicate("uriBasedMeasureLocalIdentifier");

            expect(predicate(uriBasedMeasure, context)).toEqual(true);
        });

        it("should not match predicate when measure local identifier does not match", () => {
            const predicate = getColorMappingPredicate("someOtherMeasure.localIdentifier");

            expect(predicate(uriBasedMeasure, context)).toEqual(false);
        });

        it("should not match predicate when referenced uri matches", () => {
            const predicate = getColorMappingPredicate("/attributeItemUri");

            expect(predicate(attributeDescriptor, {} as any)).toEqual(false);
        });

        it("should match predicate when referenced uri matches", () => {
            const predicate = getColorMappingPredicate("/attributeItemUri");

            expect(predicate(attributeHeaderItem, {} as any)).toEqual(true);
        });

        it("should match predicate when referenced null uri matches", () => {
            const predicate = getColorMappingPredicate(null);

            expect(predicate(falsyAttributeHeaderItem(null), {} as any)).toEqual(true);
        });

        it("should match predicate when referenced empty string uri matches", () => {
            const predicate = getColorMappingPredicate("");

            expect(predicate(falsyAttributeHeaderItem(""), {} as any)).toEqual(true);
        });

        it("should not match predicate when referenced undefined uri matches", () => {
            const predicate = getColorMappingPredicate(undefined);

            expect(predicate(falsyAttributeHeaderItem(undefined), {} as any)).toEqual(false);
        });
    });
});
