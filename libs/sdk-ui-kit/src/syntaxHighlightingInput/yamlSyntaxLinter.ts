// (C) 2026 GoodData Corporation

import { syntaxTree } from "@codemirror/language";
import { type Diagnostic, linter } from "@codemirror/lint";

/**
 * Creates a CodeMirror linter extension that reports YAML syntax errors by walking the parse tree
 * for error nodes.
 *
 * This reuses the tree already built by `@codemirror/lang-yaml` for highlighting — no extra parsing
 * or dependencies required.
 *
 * @param message - localized message shown on each syntax-error diagnostic
 * @internal
 */
export function createYamlSyntaxLinter(message: string) {
    return linter((view) => {
        const diagnostics: Diagnostic[] = [];
        const tree = syntaxTree(view.state);

        tree.iterate({
            enter(node) {
                if (node.type.isError) {
                    diagnostics.push({
                        from: node.from,
                        to: Math.max(node.to, node.from + 1),
                        severity: "error",
                        message,
                    });
                }
            },
        });

        return diagnostics;
    });
}
