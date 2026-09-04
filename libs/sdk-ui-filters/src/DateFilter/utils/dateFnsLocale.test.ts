// (C) 2026 GoodData Corporation

// @vitest-environment node

import { enUS, fr } from "date-fns/locale";
import { describe, expect, it } from "vitest";

import { convertLocale } from "./dateFnsLocale.js";

describe("convertLocale", () => {
    it("should return the matching date-fns locale for a supported locale", () => {
        expect(convertLocale("fr-FR")).toBe(fr);
    });

    it("should fall back to en-US when no locale is given", () => {
        expect(convertLocale(undefined)).toBe(enUS);
    });

    it("should fall back to en-US for an unsupported locale", () => {
        expect(convertLocale("sk-SK")).toBe(enUS);
    });
});
