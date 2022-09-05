// (C) 2022 GoodData Corporation

import { ITheme } from "@gooddata/sdk-model";
import { getColorsPreviewFromTheme } from "../StylingSettingWidget";
import { customItemsMock, fullyDefinedThemeMock } from "./mocks";

describe("getColorsPreviewFromTheme", () => {
    it("should return default array of colors when theme is empty", () => {
        const result = getColorsPreviewFromTheme({});

        expect(result).toMatchSnapshot();
    });

    it("should return correct array of colors when only complementary colors are set in theme", () => {
        const result = getColorsPreviewFromTheme(customItemsMock[0].content as ITheme);

        expect(result).toMatchSnapshot();
    });

    it("should return correct array of colors when theme is fully defined", () => {
        const result = getColorsPreviewFromTheme(fullyDefinedThemeMock);

        expect(result).toMatchSnapshot();
    });
});
