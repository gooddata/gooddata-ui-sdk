// (C) 2019-2022 GoodData Corporation
import { ITheme } from "@gooddata/sdk-model";

import {
    parseThemeToCssProperties,
    ParserFunction,
    clearCssProperties,
    handleUnits,
    generateShadowColor,
} from "../cssProperties";

describe("cssProperties", () => {
    describe("parseThemeToCssProperties", () => {
        it("should return css properties with the correct keys and values", () => {
            const theme: ITheme = {
                palette: {
                    primary: {
                        base: "#14b2e2",
                        contrast: "#fff",
                    },
                },
                modal: {
                    title: {
                        color: "#14b2e2",
                    },
                },
            };
            const cssProperties = parseThemeToCssProperties(theme);
            expect(cssProperties).toEqual([
                {
                    key: "--gd-palette-primary-base",
                    value: "#14b2e2",
                },
                {
                    key: "--gd-palette-primary-contrast",
                    value: "#fff",
                },
                {
                    key: "--gd-modal-title-color",
                    value: "#14b2e2",
                },
            ]);
        });

        it("should return css property parsed with custom parser", () => {
            const theme: ITheme = {
                palette: {
                    primary: {
                        base: "#14b2e2",
                    },
                },
            };
            const customParserFn: ParserFunction = {
                key: "--gd-palette-primary-base",
                fn: (value) => `//${value}//`,
            };
            const cssProperties = parseThemeToCssProperties(theme, [customParserFn]);
            expect(cssProperties).toEqual([
                {
                    key: "--gd-palette-primary-base",
                    value: "//#14b2e2//",
                },
            ]);
        });

        it("should return css properties with a custom prefix", () => {
            const theme: ITheme = {
                palette: {
                    primary: {
                        base: "#14b2e2",
                    },
                },
            };
            const cssProperties = parseThemeToCssProperties(theme, undefined, "--custom-prefix");
            expect(cssProperties).toEqual([
                {
                    key: "--custom-prefix-palette-primary-base",
                    value: "#14b2e2",
                },
            ]);
        });
    });

    describe("clearCssProperties", () => {
        it("should remove properties and custom font style elements from head", () => {
            const propertiesTagIdentifier = "gdc-theme-properties";
            const propertiesTag = document.createElement("style");
            propertiesTag.id = propertiesTagIdentifier;
            document.head.appendChild(propertiesTag);

            const customFontTagIdentifier = "gdc-theme-custom-font";
            const customFontTag = document.createElement("style");
            customFontTag.id = customFontTagIdentifier;
            document.head.appendChild(customFontTag);

            expect(document.getElementById(propertiesTagIdentifier)).not.toEqual(null);
            expect(document.getElementById(customFontTagIdentifier)).not.toEqual(null);

            clearCssProperties();

            expect(document.getElementById(propertiesTagIdentifier)).toEqual(null);
            expect(document.getElementById(customFontTagIdentifier)).toEqual(null);
        });
    });

    describe("handleUnits", () => {
        it("should add px to the number", () => {
            expect(handleUnits("15.5")).toBe("15.5px");
        });
        it("should let through number with unit", () => {
            expect(handleUnits("15.5%")).toBe("15.5%");
        });
        it("should work with undefined", () => {
            expect(handleUnits(undefined)).toBeUndefined();
        });
        it("should work with non numeric value", () => {
            expect(handleUnits("right")).toBe("right");
        });
        it("should work with NaN value", () => {
            expect(handleUnits("NaN")).toBe("NaN");
        });
    });

    describe("generateShadowColor", () => {
        const theme: ITheme = {
            palette: {
                complementary: {
                    c0: "#fff",
                    c8: "#222",
                    c9: "#000",
                },
            },
        };
        it("it should return '--gd-shadow-color' css property with black color if theme is dark", () => {
            expect(generateShadowColor(theme.palette, true)).toEqual([
                {
                    key: "--gd-shadow-color",
                    value: "rgba(0,0,0,0.5)",
                },
            ]);
        });
        it("it should return '--gd-shadow-color' css property with 8th color from complementary palette if theme is light", () => {
            expect(generateShadowColor(theme.palette, false)).toEqual([
                {
                    key: "--gd-shadow-color",
                    value: "rgba(34,34,34,0.2)",
                },
            ]);
        });
        it("it should return nothing if complementary palette is not provided", () => {
            expect(generateShadowColor({}, true)).toEqual([]);
        });
    });
});
