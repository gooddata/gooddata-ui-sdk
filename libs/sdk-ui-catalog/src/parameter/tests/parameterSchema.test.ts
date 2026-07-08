// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { parameterSchemaKeys } from "../parameterSchema.js";

describe("parameterSchemaKeys", () => {
    it("derives top-level keys from the zod schema", () => {
        const topLevelKeys = ["type", "id", "title", "description", "tags", "definition"];

        expect(parameterSchemaKeys(["NUMBER"])[""]).toEqual(topLevelKeys);
        expect(parameterSchemaKeys(["STRING"])[""]).toEqual(topLevelKeys);
    });

    it("derives definition keys from the zod schema", () => {
        const definitionKeys = ["type", "defaultValue", "constraints"];

        expect(parameterSchemaKeys(["NUMBER"])["definition"]).toEqual(definitionKeys);
        expect(parameterSchemaKeys(["STRING"])["definition"]).toEqual(definitionKeys);
    });

    it("derives NUMBER constraint keys from the zod schema", () => {
        expect(parameterSchemaKeys(["NUMBER"])["constraints"]).toEqual(["min", "max"]);
    });

    it("derives STRING constraint keys from the zod schema", () => {
        expect(parameterSchemaKeys(["STRING"])["constraints"]).toEqual(["minLength", "maxLength"]);
    });

    it("unions constraint keys across enabled types", () => {
        expect(parameterSchemaKeys(["NUMBER", "STRING"])["constraints"]).toEqual([
            "min",
            "max",
            "minLength",
            "maxLength",
        ]);
    });

    it("only contains expected nesting levels", () => {
        expect(Object.keys(parameterSchemaKeys(["NUMBER", "STRING"])).sort()).toEqual([
            "",
            "constraints",
            "definition",
        ]);
    });
});
