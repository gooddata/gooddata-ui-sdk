// (C) 2021 GoodData Corporation
import { ITheme } from "@gooddata/sdk-backend-spi";

import { prepareBaseColors, prepareTheme } from "./../prepareTheme";

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
