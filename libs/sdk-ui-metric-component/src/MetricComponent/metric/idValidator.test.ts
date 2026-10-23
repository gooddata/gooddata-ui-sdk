// (C) 2007-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { validateIdPattern } from "./idValidator.js";

describe("validateIdPattern", () => {
    it("test all valid formats of id pattern", () => {
        expect(validateIdPattern("test")).toBe(true);
        expect(validateIdPattern("test-id")).toBe(true);
        expect(validateIdPattern("9test-Id_x")).toBe(true);
        expect(validateIdPattern("9test-id.x")).toBe(true);
        expect(validateIdPattern("test.")).toBe(true);
        expect(validateIdPattern("-test")).toBe(true);
        expect(validateIdPattern("test-")).toBe(true);
        expect(validateIdPattern("_test")).toBe(true);
        expect(validateIdPattern("test_")).toBe(true);
    });

    it("test all invalid formats of id pattern", () => {
        expect(validateIdPattern("")).toBe(false);
        expect(validateIdPattern(".")).toBe(false);
        expect(validateIdPattern(".test")).toBe(false);
        expect(validateIdPattern("te#st")).toBe(false);
        expect(validateIdPattern("te@st")).toBe(false);
        expect(validateIdPattern("te&st")).toBe(false);
    });
});
