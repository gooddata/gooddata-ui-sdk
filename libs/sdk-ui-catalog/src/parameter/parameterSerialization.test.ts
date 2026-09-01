// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type ParameterDraft, serializeParameterToYaml } from "./parameterSerialization.js";
import { validateParameterYaml } from "./parameterValidation.js";

describe("serializeParameterToYaml", () => {
    it("serializes a blank-create draft to canonical, non-wrapped YAML in the given key order", () => {
        const draft: ParameterDraft = {
            title: "My Parameter",
            description: "",
            definition: { type: "NUMBER", defaultValue: 0 },
        };
        expect(serializeParameterToYaml(draft)).toBe(
            `id: 
title: My Parameter
description: ""
definition:
  type: NUMBER
  defaultValue: 0`,
        );
    });

    it("leaves an untouched id line out of the validated parameter, for the server to derive", () => {
        const yaml = serializeParameterToYaml({
            title: "My Parameter",
            description: "",
            definition: { type: "NUMBER", defaultValue: 0 },
        });

        const result = validateParameterYaml(yaml, { enabledTypes: ["NUMBER"] });

        expect(result.isValid).toBe(true);
        expect(result.isValid && result.parameter).not.toHaveProperty("id");
    });

    it("emits id and tags when present, preserving insertion order and trimming the trailing newline", () => {
        const draft: ParameterDraft = {
            id: "test",
            title: "Test parameter",
            description: "",
            tags: [],
            definition: { type: "NUMBER", defaultValue: 1 },
        };
        expect(serializeParameterToYaml(draft)).toBe(
            `id: test
title: Test parameter
description: ""
tags: []
definition:
  type: NUMBER
  defaultValue: 1`,
        );
    });
});
