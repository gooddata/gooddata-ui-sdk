// (C) 2022-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { customItemsMock, fullyDefinedThemeMock } from "./mocks.js";
import { getColorsPreviewFromTheme } from "../StylingSettingWidget/utils.js";

describe("getColorsPreviewFromTheme", () => {
    it("should return default array of colors when theme is empty", () => {
        const result = getColorsPreviewFromTheme({});

        expect(result).toMatchSnapshot();
    });

    it("should return correct array of colors when only complementary colors are set in theme", () => {
        const result = getColorsPreviewFromTheme(customItemsMock[0].content);

        expect(result).toMatchSnapshot();
    });

    it("should return correct array of colors when theme is fully defined", () => {
        const result = getColorsPreviewFromTheme(fullyDefinedThemeMock);

        expect(result).toMatchSnapshot();
    });
});
