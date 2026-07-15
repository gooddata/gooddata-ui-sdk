// (C) 2026 GoodData Corporation

import type { CompletionContext, CompletionResult } from "@codemirror/autocomplete";

import { METRIC_SCHEMA_KEYS } from "./metricSchema.js";

const rootOptions = (METRIC_SCHEMA_KEYS[""] ?? []).map((label) => ({ label, type: "property" }));

/**
 * Completion source for the metric YAML schema. The metric schema is a flat mapping, so completion
 * only offers the top-level property names, and only at column zero — an indented line sits inside a
 * sequence value (e.g. under `tags:`), where those keys must not be offered.
 */
export function metricCompletions(context: CompletionContext): CompletionResult | null {
    const line = context.state.doc.lineAt(context.pos);
    const before = line.text.slice(0, context.pos - line.from);

    // Trigger only for a key typed at column zero; any leading whitespace means the cursor is nested.
    const match = before.match(/^([\w-]*)$/);
    if (!match) {
        return null;
    }

    return { from: context.pos - match[1].length, options: rootOptions, validFor: /^[\w-]*$/ };
}
