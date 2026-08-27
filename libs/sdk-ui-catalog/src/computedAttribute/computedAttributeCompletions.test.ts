// (C) 2026 GoodData Corporation

import { CompletionContext } from "@codemirror/autocomplete";
import { EditorState } from "@codemirror/state";
import { describe, expect, it } from "vitest";

import { computedAttributeCompletions } from "./computedAttributeCompletions.js";

function completeAt(docWithCursor: string) {
    const pos = docWithCursor.indexOf("|");
    const doc = docWithCursor.replace("|", "");
    const state = EditorState.create({ doc });
    return computedAttributeCompletions(new CompletionContext(state, pos, true));
}

describe("computedAttributeCompletions", () => {
    it("offers the computed attribute top-level keys at column zero", () => {
        const result = completeAt("|");
        const labels = result && !(result instanceof Promise) ? result.options.map((o) => o.label) : null;

        expect(labels).toEqual(expect.arrayContaining(["type", "id", "title", "maql", "locale"]));
    });

    it("anchors completion at the start of a partially typed key", () => {
        const result = completeAt("ma|");

        expect(result && !(result instanceof Promise) ? result.from : null).toBe(0);
    });

    it("declines on an indented line inside a sequence value", () => {
        // The YAML is flat; an indented line sits under `tags:`, where top-level keys must not show.
        expect(completeAt("tags:\n  |")).toBeNull();
    });
});
