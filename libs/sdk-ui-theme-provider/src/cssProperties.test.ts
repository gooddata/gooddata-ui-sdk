// (C) 2019-2026 GoodData Corporation

import { afterEach, describe, expect, it } from "vitest";

import { type ITheme } from "@gooddata/sdk-model";

import {
    type ParserFunction,
    clearCssProperties,
    generateShadowColor,
    handleReportLength,
    handleReportLineHeight,
    handleUnits,
    parseThemeToCssProperties,
    setCssProperties,
} from "./cssProperties.js";

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

    describe("setCssProperties", () => {
        // Cleanup runs unconditionally so a failing assertion can't leak the injected
        // <style> tag into sibling tests' DOM state.
        afterEach(() => {
            clearCssProperties();
        });

        it("should scope the global theme variables to a doubled :root selector so they win over the plain :root {} light defaults shipped in app bundles regardless of DOM order (LX-2608)", () => {
            setCssProperties({ palette: { primary: { base: "#14b2e2" } } }, true);

            const tag = document.getElementById("gdc-theme-properties");
            expect(tag).not.toEqual(null);
            expect(tag?.textContent).toContain(":root:root {");
            expect(tag?.textContent).toContain("color-scheme: dark;");
        });

        it("should index report color lists and skip the theme parts that are not CSS", () => {
            setCssProperties(
                {
                    version: "2",
                    palette: { primary: { base: "#14b2e2" } },
                    reports: {
                        visualizationPalette: { id: "brand", type: "colorPalette" },
                        page: { backgroundColor: "#f8f2ec" },
                        colors: { backgrounds: ["#fff", "#f8f2ec"], text: ["#101820"] },
                        textStyle: {
                            typography: {
                                fontFamily: "Brand, sans-serif",
                                fonts: [{ family: "Brand", url: "https://cdn.example.com/brand.woff2" }],
                            },
                            heading: { color: "#101820", h1: { fontSize: 4, lineHeight: "4.6cqw" } },
                            paragraph: { normalText: { fontSize: "16px" }, smallText: { fontSize: 1.2 } },
                        },
                    },
                    assets: { logos: [{ id: "logo", url: "https://cdn.example.com/logo.svg" }] },
                },
                false,
            );

            const css = document.getElementById("gdc-theme-properties")?.textContent ?? "";
            expect(css).toContain("--gd-reports-page-backgroundColor: #f8f2ec;");
            expect(css).toContain("--gd-reports-colors-backgrounds-0: #fff;");
            expect(css).toContain("--gd-reports-colors-backgrounds-1: #f8f2ec;");
            expect(css).toContain("--gd-reports-colors-text-0: #101820;");
            expect(css).toContain("--gd-reports-textStyle-typography-fontFamily: Brand, sans-serif;");
            expect(css).toContain("--gd-reports-textStyle-heading-color: #101820;");
            expect(css).toContain("--gd-reports-textStyle-heading-h1-fontSize: 4cqw;");
            expect(css).toContain("--gd-reports-textStyle-heading-h1-lineHeight: 4.6cqw;");
            expect(css).not.toContain("--gd-version");
            expect(css).not.toContain("--gd-assets");
            expect(css).not.toContain("--gd-reports-textStyle-typography-fonts");
            expect(css).not.toContain("--gd-reports-visualizationPalette");
            expect(css).toContain("--gd-reports-textStyle-paragraph-smallText-fontSize: 1.2cqw;");
            // An absolute unit does not scale with the page, so it is dropped rather than rendered.
            expect(css).not.toContain("--gd-reports-textStyle-paragraph-normalText-fontSize");
            expect(css).not.toMatch(/: ;/);
        });

        it("should index an inline report visualization palette", () => {
            setCssProperties({ reports: { visualizationPalette: ["#e4002b", "#00a3e0"] } }, false);

            const css = document.getElementById("gdc-theme-properties")?.textContent ?? "";
            expect(css).toContain("--gd-reports-visualizationPalette-0: #e4002b;");
            expect(css).toContain("--gd-reports-visualizationPalette-1: #00a3e0;");
        });
    });

    describe("handleReportLength", () => {
        it("reads a bare number as cqw", () => {
            expect(handleReportLength(3.5)).toBe("3.5cqw");
            expect(handleReportLength("2")).toBe("2cqw");
        });
        it("lets a relative unit through", () => {
            expect(handleReportLength("3.5cqw")).toBe("3.5cqw");
            expect(handleReportLength(" 120% ")).toBe("120%");
            expect(handleReportLength("1.2em")).toBe("1.2em");
        });
        it("drops a unit that would not follow the page width", () => {
            // The page contains its inline axis only, so a block unit resolves against the viewport.
            expect(handleReportLength("4cqh")).toBe("");
            expect(handleReportLength("4cqb")).toBe("");
            // Anchored to the root font size, so it holds its size while the page changes.
            expect(handleReportLength("1.2rem")).toBe("");
        });
        it("drops absolute units and anything that is not a length", () => {
            expect(handleReportLength("16px")).toBe("");
            expect(handleReportLength("big")).toBe("");
            expect(handleReportLength(-1)).toBe("");
            expect(handleReportLength(Number.NaN)).toBe("");
            expect(handleReportLength("4cqw; color: red")).toBe("");
            expect(handleReportLength(undefined)).toBe("");
        });
    });

    describe("handleReportLineHeight", () => {
        it("reads a bare number as the CSS ratio it is, not as a share of the page", () => {
            expect(handleReportLineHeight(1.5)).toBe("1.5");
            expect(handleReportLineHeight("1.2")).toBe("1.2");
        });
        it("keeps a stated page-relative length", () => {
            expect(handleReportLineHeight("4.3cqw")).toBe("4.3cqw");
            expect(handleReportLineHeight("1.2em")).toBe("1.2em");
        });
        it("drops what is neither", () => {
            expect(handleReportLineHeight("20px")).toBe("");
            expect(handleReportLineHeight("normal")).toBe("");
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
            expect(handleUnits(undefined as unknown as string)).toBeUndefined();
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

        it("should return '--gd-shadow-color' css property with black color if theme is dark", () => {
            expect(generateShadowColor(theme.palette!, true)).toEqual([
                {
                    key: "--gd-shadow-color",
                    value: "rgba(0,0,0,0.5)",
                },
            ]);
        });

        it("should return '--gd-shadow-color' css property with 8th color from complementary palette if theme is light", () => {
            expect(generateShadowColor(theme.palette!, false)).toEqual([
                {
                    key: "--gd-shadow-color",
                    value: "rgba(34,34,34,0.2)",
                },
            ]);
        });
        it("should return nothing if complementary palette is not provided", () => {
            expect(generateShadowColor({}, true)).toEqual([]);
        });
    });
});
