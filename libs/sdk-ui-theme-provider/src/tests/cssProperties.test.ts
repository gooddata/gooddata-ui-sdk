// (C) 2019-2020 GoodData Corporation
import { ITheme } from "@gooddata/sdk-backend-spi";

import { parseThemeToCssProperties, ParserFunction } from "../cssProperties";

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
});
