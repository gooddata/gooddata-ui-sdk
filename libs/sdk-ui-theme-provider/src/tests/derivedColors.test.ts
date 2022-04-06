// (C) 2021-2022 GoodData Corporation
import { ThemeColor, IThemePalette } from "@gooddata/sdk-model";

import {
    getHigherContrastColor,
    getLowerContrastColor,
    getLeastContrastColor,
    mixWith0ComplementaryColor,
    mixWith8ComplementaryColor,
} from "../derivedColors";

describe("derivedColors", () => {
    describe("getHigherContrastColor", () => {
        const Scenarios: Array<[number, ThemeColor, boolean]> = [
            [0.2, "#7f7f7f", false],
            [0.2, "#7f7f7f", true],
        ];

        it.each(Scenarios)("should generate higher contrast color", (amount, color, isDarkTheme) => {
            expect(getHigherContrastColor(amount, color, isDarkTheme)).toMatchSnapshot();
        });
    });

    describe("getLowerContrastColor", () => {
        const Scenarios: Array<[number, ThemeColor, boolean]> = [
            [0.2, "#7f7f7f", false],
            [0.2, "#7f7f7f", true],
        ];

        it.each(Scenarios)("should generate lower contrast color", (amount, color, isDarkTheme) => {
            expect(getLowerContrastColor(amount, color, isDarkTheme)).toMatchSnapshot();
        });
    });

    describe("getLeastContrastColor", () => {
        const Scenarios: Array<[ThemeColor, boolean]> = [
            ["#f00", false],
            ["#f00", true],
        ];

        it.each(Scenarios)("should generate least contrast color", (color, isDarkTheme) => {
            expect(getLeastContrastColor(color, isDarkTheme)).toMatchSnapshot();
        });
    });

    describe("mixWith0ComplementaryColor", () => {
        const Scenarios: Array<[number, ThemeColor, IThemePalette]> = [
            [0.5, "#f00", { complementary: { c0: "#fff", c9: "#000" } }],
            [0.5, "#f00", { complementary: { c0: "#000", c9: "#fff" } }],
        ];

        it.each(Scenarios)(
            "should generate color mixed with first color from the complementary palette",
            (amount, color, palette) => {
                expect(mixWith0ComplementaryColor(amount, color, palette)).toMatchSnapshot();
            },
        );
    });

    describe("mixWith8ComplementaryColor", () => {
        const Scenarios: Array<[number, ThemeColor, IThemePalette]> = [
            [0.5, "#f00", { complementary: { c0: "#fff", c8: "#333", c9: "#000" } }],
            [0.5, "#f00", { complementary: { c0: "#000", c8: "#ccc", c9: "#fff" } }],
        ];

        it.each(Scenarios)(
            "should generate color mixed with 8th color from the complementary palette",
            (amount, color, palette) => {
                expect(mixWith8ComplementaryColor(amount, color, palette)).toMatchSnapshot();
            },
        );
    });
});
