// (C) 2007-2019 GoodData Corporation
import { isWhiteNotContrastEnough } from "../dataLabelsColors";

import { getRgbString } from "../../../../utils/color";
import { DefaultColorPalette } from "../../../../Config";
import { IColorPaletteItem } from "@gooddata/sdk-model";

describe("dataLabelsColors", () => {
    describe("isWhiteNotContrastEnough", () => {
        it("should return false for black", () => {
            expect(isWhiteNotContrastEnough("rgb(0, 0, 0)")).toBeFalsy();
        });

        it("should return true for white", () => {
            expect(isWhiteNotContrastEnough("rgb(255, 255, 255)")).toBeTruthy();
        });

        it("should fullfill UX requirement for default color palette", () => {
            const result: boolean[] = DefaultColorPalette.map((defaultColorPaletteItem: IColorPaletteItem) =>
                getRgbString(defaultColorPaletteItem),
            ).map((defaultColor: string) => isWhiteNotContrastEnough(defaultColor));

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
