// (C) 2026 GoodData Corporation

import { CompletionContext } from "@codemirror/autocomplete";
import { EditorState } from "@codemirror/state";
import { describe, expect, it } from "vitest";

import { metricCompletions } from "./metricCompletions.js";

function completeAt(docWithCursor: string) {
    const pos = docWithCursor.indexOf("|");
    const doc = docWithCursor.replace("|", "");
    const state = EditorState.create({ doc });
    return metricCompletions(new CompletionContext(state, pos, true));
}

describe("metricCompletions", () => {
    it("offers the metric top-level keys at column zero", () => {
        const result = completeAt("|");
        const labels = result?.options.map((option) => option.label);

        expect(labels).toEqual(expect.arrayContaining(["type", "title", "maql", "format"]));
    });

    it("declines on an indented line inside a sequence value", () => {
        // Metric YAML is flat; an indented line sits under `tags:`, where top-level keys must not show.
        const result = completeAt("tags:\n  |");

        expect(result).toBeNull();
    });
});
