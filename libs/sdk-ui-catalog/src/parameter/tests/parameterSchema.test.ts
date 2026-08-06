// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { parameterSchemaKeys } from "../parameterSchema.js";

describe("parameterSchemaKeys", () => {
    it("derives top-level keys from the zod schema", () => {
        const topLevel = {
            kind: "mapping",
            keys: ["type", "id", "title", "description", "tags", "definition"],
        };

        expect(parameterSchemaKeys(["NUMBER"])[""]).toEqual(topLevel);
        expect(parameterSchemaKeys(["STRING"])[""]).toEqual(topLevel);
    });

    it("derives NUMBER definition keys from the zod schema", () => {
        expect(parameterSchemaKeys(["NUMBER"])["definition"]).toEqual({
            kind: "mapping",
            keys: ["type", "defaultValue", "constraints"],
        });
    });

    it("derives STRING definition keys including cardinality from the zod schema", () => {
        expect(parameterSchemaKeys(["STRING"])["definition"]).toEqual({
            kind: "mapping",
            keys: ["type", "defaultValue", "constraints", "cardinality"],
        });
    });

    it("derives NUMBER constraint keys from the zod schema", () => {
        expect(parameterSchemaKeys(["NUMBER"])["constraints"]).toEqual({
            kind: "mapping",
            keys: ["min", "max"],
        });
    });

    it("derives STRING constraint keys from the zod schema", () => {
        expect(parameterSchemaKeys(["STRING"])["constraints"]).toEqual({
            kind: "mapping",
            keys: ["minLength", "maxLength", "allowedValues"],
        });
    });

    it("derives allowedValues as a sequence with its entry keys", () => {
        expect(parameterSchemaKeys(["STRING"])["allowedValues"]).toEqual({
            kind: "sequence",
            keys: ["value", "title"],
        });
    });

    it("unions constraint keys across enabled types", () => {
        expect(parameterSchemaKeys(["NUMBER", "STRING"])["constraints"]).toEqual({
            kind: "mapping",
            keys: ["min", "max", "minLength", "maxLength", "allowedValues"],
        });
    });

    it("only contains expected nesting levels", () => {
        expect(Object.keys(parameterSchemaKeys(["NUMBER", "STRING"])).sort()).toEqual([
            "",
            "allowedValues",
            "constraints",
            "definition",
        ]);
    });
});
