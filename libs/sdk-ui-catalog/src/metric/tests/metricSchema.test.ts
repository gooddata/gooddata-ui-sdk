// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { METRIC_SCHEMA_KEYS } from "../metricSchema.js";

describe("METRIC_SCHEMA_KEYS", () => {
    // Guards that the schema's property names stay in sync with editor autocompletion: a change to
    // the schema fields surfaces here explicitly rather than silently altering the suggestions.
    it("derives the top-level metric keys used for autocompletion", () => {
        expect(METRIC_SCHEMA_KEYS[""]).toEqual([
            "type",
            "id",
            "title",
            "description",
            "tags",
            "maql",
            "format",
            "show_in_ai_results",
            "is_hidden",
        ]);
    });

    it("has no nested object keys", () => {
        expect(Object.keys(METRIC_SCHEMA_KEYS)).toEqual([""]);
    });
});
