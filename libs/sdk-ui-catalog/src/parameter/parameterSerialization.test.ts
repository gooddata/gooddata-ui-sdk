// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type ParameterDraft,
    serializeParameterToYaml,
    toParameterMetadataDefinition,
} from "./parameterSerialization.js";
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

describe("a date range parameter", () => {
    const draft: ParameterDraft = {
        id: "most_recent_13_months",
        type: "parameter",
        title: "Most Recent 13 Months",
        description: "",
        tags: ["published"],
        definition: {
            type: "DATE_RANGE",
            defaultValue: { granularity: "GDC.time.month", from: "2025-08", to: "2026-08" },
        },
    };

    it("is written with the granularity named as the backend names it", () => {
        expect(serializeParameterToYaml(draft)).toBe(
            `id: most_recent_13_months
type: parameter
title: Most Recent 13 Months
description: ""
tags:
  - published
definition:
  type: DATE_RANGE
  defaultValue:
    granularity: MONTH
    from: 2025-08
    to: 2026-08`,
        );
    });

    it("quotes a year, so it reads back as text", () => {
        const yaml = serializeParameterToYaml({
            ...draft,
            definition: { type: "DATE_RANGE", defaultValue: { granularity: "GDC.time.year", to: "2026" } },
        });

        expect(yaml).toContain(`granularity: YEAR\n    to: "2026"`);
    });

    it("reads back as the definition it was written from", () => {
        const result = validateParameterYaml(serializeParameterToYaml(draft), {
            enabledTypes: ["NUMBER", "DATE_RANGE"],
        });

        expect(result.isValid && toParameterMetadataDefinition(result.parameter)).toEqual(draft);
    });
});

describe("toParameterMetadataDefinition", () => {
    it("names a period's granularity as the model does", () => {
        expect(
            toParameterMetadataDefinition({
                type: "parameter",
                definition: { type: "DATE_RANGE", defaultValue: { granularity: "WEEK", from: "2025-33" } },
            }),
        ).toEqual({
            type: "parameter",
            definition: {
                type: "DATE_RANGE",
                defaultValue: { granularity: "GDC.time.week", from: "2025-33" },
            },
        });
    });

    it("keeps a scalar definition as it is", () => {
        const parameter = {
            type: "parameter",
            title: "Threshold",
            definition: { type: "NUMBER", defaultValue: 5, constraints: { min: 0 } },
        } as const;

        expect(toParameterMetadataDefinition(parameter)).toEqual(parameter);
    });
});
