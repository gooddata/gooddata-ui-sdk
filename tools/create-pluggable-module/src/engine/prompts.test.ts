// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { validateAppName } from "./prompts.js";

describe("validateAppName", () => {
    it("accepts a regular name", () => {
        expect(validateAppName("gdc-revenue-tracker")).toBeNull();
    });

    it.each(["gdc-app-template-name-x", "gdc-headless-template-name-x", "gdc-host-ui-template-name-x"])(
        "rejects %s, which contains a template token",
        (name) => {
            expect(validateAppName(name)).toMatch(/reserved for the templates/);
        },
    );
});
