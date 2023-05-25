// (C) 2007-2020 GoodData Corporation
import { IColor, IColorPalette } from "@gooddata/sdk-model";
import { isValidMappedColor } from "@gooddata/sdk-ui-vis-commons";
import { describe, it, expect } from "vitest";

describe("isValidMappedColor", () => {
    const colorPalette: IColorPalette = [
        {
            guid: "01",
            fill: {
                r: 195,
                g: 49,
                b: 73,
            },
        },
    ];

    it("should return true if color item is in palette", () => {
        const colorItem: IColor = {
            type: "guid",
            value: "01",
        };

        expect(isValidMappedColor(colorItem, colorPalette)).toBeTruthy();
    });

    it("should return false if color item is not in palette", () => {
        const colorItem: IColor = {
            type: "guid",
            value: "xx",
        };

        expect(isValidMappedColor(colorItem, colorPalette)).toBeFalsy();
    });

    it("should return true if color item is rgb", () => {
        const colorItem: IColor = {
            type: "rgb",
            value: {
                r: 255,
                g: 0,
                b: 0,
            },
        };

        expect(isValidMappedColor(colorItem, colorPalette)).toBeTruthy();
    });
});
