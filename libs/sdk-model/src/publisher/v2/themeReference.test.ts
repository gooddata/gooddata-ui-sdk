// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { getPublisherThemeReferencePathV2, publisherThemeReferenceV2 } from "./themeReference.js";

describe("getPublisherThemeReferencePathV2", () => {
    it.each([
        [["colors", "texts", "muted"]],
        [["colors", "texts", "brand-blue"]],
        [["colors", "backgrounds", "2024"]],
        [["shadows", "card_raised"]],
        [["corners", "full"]],
    ])("reads back the path of the reference written for %j", (path) => {
        expect(getPublisherThemeReferencePathV2(publisherThemeReferenceV2(path))).toEqual(path);
    });

    it.each([
        "theme.colors.texts.muted",
        "{theme}",
        "{theme.}",
        "{theme.colors..muted}",
        "{theme.colors.texts.brand blue}",
        "Revenue {theme.colors.texts.muted}",
        "{palette.primary}",
        42,
    ])("reads no path from %j", (value) => {
        expect(getPublisherThemeReferencePathV2(value)).toBeUndefined();
    });
});
