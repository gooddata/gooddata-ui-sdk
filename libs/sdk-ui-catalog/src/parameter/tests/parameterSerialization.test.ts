// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type ParameterDraft, serializeParameterToYaml } from "../parameterSerialization.js";

describe("serializeParameterToYaml", () => {
    it("serializes a blank-create draft to canonical, non-wrapped YAML in the given key order", () => {
        const draft: ParameterDraft = {
            title: "My Parameter",
            description: "",
            definition: { type: "NUMBER", defaultValue: 0 },
        };
        expect(serializeParameterToYaml(draft)).toBe(
            `title: My Parameter
description: ""
definition:
  type: NUMBER
  defaultValue: 0`,
        );
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
