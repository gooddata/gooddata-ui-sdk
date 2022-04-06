// (C) 2021-2022 GoodData Corporation
import { ITheme } from "@gooddata/sdk-model";
import { getContrast } from "polished";

import {
    prepareBaseColors,
    prepareComplementaryPalette,
    preparePrimaryColor,
    prepareTheme,
    stripComplementaryPalette,
} from "./../prepareTheme";

describe("prepareTheme", () => {
    it("should prepare the theme", () => {
        const theme: ITheme = {
            palette: {
                error: { base: "#f00", contrast: "#0ff" },
                complementary: { c0: "#fff", c9: "#000" },
            },
        };

        expect(prepareTheme(theme)).toMatchSnapshot();
    });
});

describe("prepareComplementaryPalette", () => {
    it.each([[{ c0: "#fff", c9: "#000" }], [{ c0: "#fff", c6: "#14b2e2", c9: "#000" }]])(
        "should complete the complementary palette with missing shades",
        (complementaryPalette) => {
            const theme: ITheme = {
                palette: {
                    complementary: complementaryPalette,
                },
            };

            expect(prepareComplementaryPalette(theme)).toMatchSnapshot();
        },
    );
});

describe("prepareBaseColors", () => {
    it("should fill the base colors if complementary palette is provided, but base colors are missing", () => {
        const theme: ITheme = {
            palette: {
                error: { base: "#f00", contrast: "#0ff" },
                complementary: { c0: "#fff", c9: "#000" },
            },
        };

        const expectedTheme: ITheme = {
            palette: {
                primary: { base: "#14b2e2" },
                warning: { base: "#fada23" },
                success: { base: "#00c18d" },
                error: { base: "#f00", contrast: "#0ff" },
                complementary: { c0: "#fff", c9: "#000" },
            },
        };

        expect(prepareBaseColors(theme)).toEqual(expectedTheme);
    });
});

describe("stripComplementaryPalette", () => {
    it("should return theme without complementary palette, chart and pivot table properties", () => {
        const theme: ITheme = {
            palette: {
                complementary: { c0: "#fff", c9: "#000" },
            },
            chart: {
                backgroundColor: "#fff",
            },
            table: {
                backgroundColor: "#fff",
            },
        };

        const strippedTheme = stripComplementaryPalette(theme);

        expect(strippedTheme.palette.complementary).toEqual(undefined);
        expect(strippedTheme.chart).toEqual(undefined);
        expect(strippedTheme.table).toEqual(undefined);
    });
});

describe("preparePrimaryColor", () => {
    it.each([["#f00"], ["#0f0"], ["#00f"], ["#ccc"], ["#fff"], ["#000"]])(
        "should return theme with contrast primary color",
        (primaryColor) => {
            const theme: ITheme = {
                palette: {
                    primary: { base: primaryColor },
                    complementary: { c0: "#fff", c9: "#000" },
                },
            };

            const strippedTheme = preparePrimaryColor(theme);

            expect(getContrast(strippedTheme.palette.primary.base, "#fff") > 3).toEqual(true);
        },
    );
});
