// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { changeOwnLanguage } from "./useLanguages.js";

describe("changeOwnLanguage", () => {
    it("should save the language, track it, remember the change and then reload the page", async () => {
        const timeline: unknown[] = [];

        await changeOwnLanguage("de-DE", {
            /**
             * Since we don't have appropriate tooling like MSW to flexibly mock network requests (without
             * relying on implementation details), and location.reload() would still need to be handled
             * anyway, we create a humble object pattern and test the logic that way.
             *
             * In the real code, we then put only the (real, hard-to-test) dependencies, with as little logic
             * as possible, into a humble object, so we keep the margin of error low.
             */
            settings: {
                setLocale: async (locale) => void timeline.push({ type: "setLocale", locale }),
                deleteLocale: async () => void timeline.push({ type: "deleteLocale" }),
            },
            track: (language, outcome) => void timeline.push({ type: "track", language, outcome }),
            rememberChange: () => void timeline.push({ type: "rememberChange" }),
            reload: () => void timeline.push({ type: "reload" }),
        });

        expect(timeline).toEqual([
            { type: "setLocale", locale: "de-DE" },
            { type: "track", language: "de-DE", outcome: "success" },
            { type: "rememberChange" },
            { type: "reload" },
        ]);
    });

    it("should delete the user's own language for the default one", async () => {
        const timeline: unknown[] = [];

        await changeOwnLanguage("default", {
            settings: {
                setLocale: async (locale) => void timeline.push({ type: "setLocale", locale }),
                deleteLocale: async () => void timeline.push({ type: "deleteLocale" }),
            },
            track: (language, outcome) => void timeline.push({ type: "track", language, outcome }),
            rememberChange: () => void timeline.push({ type: "rememberChange" }),
            reload: () => void timeline.push({ type: "reload" }),
        });

        expect(timeline).toEqual([
            { type: "deleteLocale" },
            { type: "track", language: "default", outcome: "success" },
            { type: "rememberChange" },
            { type: "reload" },
        ]);
    });

    it("should track a failed save as an error, without remembering the change or reloading", async () => {
        const timeline: unknown[] = [];

        const change = changeOwnLanguage("de-DE", {
            settings: {
                setLocale: () => Promise.reject(new Error("Saving failed")),
                deleteLocale: async () => void timeline.push({ type: "deleteLocale" }),
            },
            track: (language, outcome) => void timeline.push({ type: "track", language, outcome }),
            rememberChange: () => void timeline.push({ type: "rememberChange" }),
            reload: () => void timeline.push({ type: "reload" }),
        });

        await expect(change).rejects.toThrow("Saving failed");
        expect(timeline).toEqual([{ type: "track", language: "de-DE", outcome: "error" }]);
    });
});
