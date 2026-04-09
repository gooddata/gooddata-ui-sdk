// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { PARAMETER_SCHEMA_KEYS } from "../parameterSchema.js";

describe("PARAMETER_SCHEMA_KEYS", () => {
    it("derives top-level keys from the zod schema", () => {
        expect(PARAMETER_SCHEMA_KEYS[""]).toEqual([
            "type",
            "id",
            "title",
            "description",
            "tags",
            "definition",
        ]);
    });

    it("derives definition keys from the zod schema", () => {
        expect(PARAMETER_SCHEMA_KEYS["definition"]).toEqual(["type", "defaultValue", "constraints"]);
    });

    it("derives constraints keys from the zod schema", () => {
        expect(PARAMETER_SCHEMA_KEYS["constraints"]).toEqual(["min", "max"]);
    });

    it("only contains expected nesting levels", () => {
        expect(Object.keys(PARAMETER_SCHEMA_KEYS).sort()).toEqual(["", "constraints", "definition"]);
    });
});
