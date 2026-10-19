// (C) 2026 GoodData Corporation

import { afterEach, describe, expect, it, vi } from "vitest";

import { LOCALES } from "@gooddata/sdk-model";

import { changedLanguageSettings, languageName, languageNotice, languageOptions } from "./userLanguages.js";

describe("languageName", () => {
    it.each([
        ["es-ES", "Spanish (Spain)"],
        ["ko-KR", "Korean (South Korea)"],
        ["es-MX", "Spanish (Mexico)"],
        ["en-US-x-24h", "English (United States)"],
    ])("names %s", (code, name) => {
        expect(languageName(code, "en-US")).toBe(name);
    });

    it.each(["xx-YY", "not a code"])("falls back to the code for %s", (code) => {
        expect(languageName(code, "en-US")).toBe(code);
    });
});

describe("languageOptions", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("offers every interface language, sorted by name", () => {
        const options = languageOptions("LOCALE", undefined, "en-US");

        expect([...options].sort()).toEqual([...LOCALES].sort());
        const names = options.map((code) => languageName(code, "en-US"));
        expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "en-US")));
    });

    it("keeps a current language that is not an interface language", () => {
        expect(languageOptions("LOCALE", "es-MX", "en-US")).toContain("es-MX");
        expect(languageOptions("LOCALE", "es-MX", "en-US")).toHaveLength(LOCALES.length + 1);
    });

    it("builds the language names once per interface language", () => {
        const displayNames = vi.spyOn(Intl, "DisplayNames");

        languageOptions("LOCALE", undefined, "de-DE");
        languageOptions("LOCALE", "es-MX", "de-DE");

        expect(displayNames.mock.calls.length).toBeLessThanOrEqual(1);
    });

    it("does not repeat a current interface language", () => {
        expect(languageOptions("LOCALE", "ko-KR", "en-US")).toHaveLength(LOCALES.length);
    });

    const statistics = {
        metadata: { locales: [{ locale: "de-DE" }, { locale: "es-MX" }] },
        data: { locales: [{ locale: "fr-FR" }] },
    };

    it("offers the languages with a metadata translation for metadata", () => {
        expect(languageOptions("METADATA_LOCALE", undefined, "en-US", statistics)).toEqual([
            "de-DE",
            "es-MX",
        ]);
    });

    it("offers the languages with translated labels for data, and keeps the current one", () => {
        expect(languageOptions("DATA_LOCALE", "ko-KR", "en-US", statistics)).toEqual(["fr-FR", "ko-KR"]);
    });

    it("offers every interface language for the interface", () => {
        expect(languageOptions("LOCALE", undefined, "en-US", statistics)).toHaveLength(LOCALES.length);
    });

    it("offers every interface language when the translations are unknown", () => {
        expect(languageOptions("METADATA_LOCALE", undefined, "en-US")).toHaveLength(LOCALES.length);
    });
});

describe("languageNotice", () => {
    it("says when the interface does not offer the language", () => {
        expect(languageNotice("LOCALE", { LOCALE: "es-MX" })).toEqual({ type: "notSupported" });
        expect(languageNotice("LOCALE", { LOCALE: "es-ES" })).toBeUndefined();
    });

    it("says nothing about the metadata and data languages", () => {
        const languages = { LOCALE: "fr-FR", METADATA_LOCALE: "es-MX", DATA_LOCALE: "xx-YY" };

        expect(languageNotice("METADATA_LOCALE", languages)).toBeUndefined();
        expect(languageNotice("DATA_LOCALE", languages)).toBeUndefined();
    });
});

describe("changedLanguageSettings", () => {
    it("lists only the settings that changed, with undefined for a removed one", () => {
        expect(
            changedLanguageSettings(
                { LOCALE: "ko-KR", METADATA_LOCALE: "de-DE" },
                { LOCALE: "fr-FR", DATA_LOCALE: "es-ES" },
            ),
        ).toEqual([
            ["LOCALE", "fr-FR"],
            ["METADATA_LOCALE", undefined],
            ["DATA_LOCALE", "es-ES"],
        ]);
    });

    it("is empty when nothing changed", () => {
        expect(changedLanguageSettings({ LOCALE: "ko-KR" }, { LOCALE: "ko-KR" })).toEqual([]);
    });
});
