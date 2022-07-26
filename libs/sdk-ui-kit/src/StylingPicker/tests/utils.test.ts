// (C) 2022 GoodData Corporation

import { idRef } from "@gooddata/sdk-model";
import { getColorsPreviewFromThemeMetadataObject } from "../utils";
import { customThemesMock, fullyDefinedThemeMock } from "./mocks";

describe("getColorsPreviewFromThemeMetadataObject", () => {
    it("should return default array of colors when theme is empty", () => {
        const result = getColorsPreviewFromThemeMetadataObject({
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
        const result = getColorsPreviewFromThemeMetadataObject(customThemesMock[0]);

        expect(result).toMatchSnapshot();
    });

    it("should return correct array of colors when theme is fully defined", () => {
        const result = getColorsPreviewFromThemeMetadataObject(fullyDefinedThemeMock);

        expect(result).toMatchSnapshot();
    });
});
