// (C) 2026 GoodData Corporation

import { afterEach, describe, expect, it } from "vitest";

import { getLastVisitedApp, setLastVisitedApp } from "../lastVisitedApp.js";

import { withFailingStorage } from "./failingStorage.js";

const STORAGE_KEY = "gdc-host-lastVisitedApp";

describe("lastVisitedApp", () => {
    afterEach(() => {
        localStorage.removeItem(STORAGE_KEY);
    });

    describe("getLastVisitedApp", () => {
        it("returns undefined when nothing is stored", () => {
            expect(getLastVisitedApp("workspace")).toBeUndefined();
        });

        it("returns the stored app ID for the given scope", () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ workspace: "gdc-dashboards" }));
            expect(getLastVisitedApp("workspace")).toBe("gdc-dashboards");
        });

        it("returns undefined when the scope key is missing from the record", () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ workspace: "gdc-dashboards" }));
            expect(getLastVisitedApp("organization")).toBeUndefined();
        });

        it("returns undefined when stored JSON is corrupt", () => {
            localStorage.setItem(STORAGE_KEY, "not-valid-json{{{");
            expect(getLastVisitedApp("workspace")).toBeUndefined();
        });

        it("returns undefined when localStorage.getItem throws", () => {
            let result: string | undefined = "not-read";

            const failedCalls = withFailingStorage("getItem", () => {
                result = getLastVisitedApp("workspace");
            });

            expect(result).toBeUndefined();
            expect(failedCalls).toBe(1);
        });
    });

    describe("setLastVisitedApp", () => {
        it("stores the app ID for the given scope", () => {
            setLastVisitedApp("workspace", "gdc-dashboards");
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
            expect(stored).toEqual({ workspace: "gdc-dashboards" });
        });

        it("preserves entries for other scopes", () => {
            setLastVisitedApp("organization", "gdc-ai-hub");
            setLastVisitedApp("workspace", "gdc-dashboards");

            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
            expect(stored).toEqual({
                organization: "gdc-ai-hub",
                workspace: "gdc-dashboards",
            });
        });

        it("overwrites a previously stored app for the same scope", () => {
            setLastVisitedApp("workspace", "gdc-analyze");
            setLastVisitedApp("workspace", "gdc-dashboards");

            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
            expect(stored.workspace).toBe("gdc-dashboards");
        });

        it("silently ignores errors when localStorage.setItem throws", () => {
            const failedCalls = withFailingStorage("setItem", () => {
                expect(() => setLastVisitedApp("workspace", "gdc-dashboards")).not.toThrow();
            });

            expect(failedCalls).toBe(1);
        });

        it("overwrites corrupt JSON with a fresh record", () => {
            localStorage.setItem(STORAGE_KEY, "corrupt");
            setLastVisitedApp("workspace", "gdc-dashboards");

            // The corrupt value is discarded and replaced with a fresh record
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
            expect(stored).toEqual({ workspace: "gdc-dashboards" });
        });
    });
});
