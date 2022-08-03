// (C) 2022 GoodData Corporation

import { idRef } from "@gooddata/sdk-model";
import { getColorsPreviewFromTheme } from "../utils";
import { customThemesMock, fullyDefinedThemeMock } from "./mocks";

describe("getColorsPreviewFromTheme", () => {
    it("should return default array of colors when theme is empty", () => {
        const result = getColorsPreviewFromTheme({
            id: "",
            ref: idRef("default-them"),
            uri: "",
            type: "theme",
            description: "",
            production: false,
            deprecated: false,
            unlisted: false,
            title: "",
            theme: {},
        });

        expect(result).toMatchSnapshot();
    });

    it("should return correct array of colors when only complementary colors are set in theme", () => {
        const result = getColorsPreviewFromTheme(customThemesMock[0]);

        expect(result).toMatchSnapshot();
    });

    it("should return correct array of colors when theme is fully defined", () => {
        const result = getColorsPreviewFromTheme(fullyDefinedThemeMock);

        expect(result).toMatchSnapshot();
    });
});
