// (C) 2007-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { type IColorPaletteItem } from "@gooddata/sdk-model";
import { DefaultColorPalette } from "@gooddata/sdk-ui";
import { getRgbString } from "@gooddata/sdk-ui-vis-commons";

import { isLightNotContrastEnough } from "../dataLabelsColors.js";

describe("dataLabelsColors", () => {
    describe("isLightNotContrastEnough", () => {
        it("should return false for black", () => {
            expect(isLightNotContrastEnough("rgb(0, 0, 0)")).toBeFalsy();
        });

        it("should return true for white", () => {
            expect(isLightNotContrastEnough("rgb(255, 255, 255)")).toBeTruthy();
        });

        it("should fullfill UX requirement for default color palette", () => {
            const result: boolean[] = DefaultColorPalette.map((defaultColorPaletteItem: IColorPaletteItem) =>
                getRgbString(defaultColorPaletteItem),
            ).map((defaultColor: string) => isLightNotContrastEnough(defaultColor));

            // first 17 colors should return false -> have white label
            const expectedValues = new Array(20).fill(false);
            // last 3 colors should return true -> have black label
            expectedValues[17] = true;
            expectedValues[18] = true;
            expectedValues[19] = true;
            expect(result).toEqual(expectedValues);
        });
    });
});
