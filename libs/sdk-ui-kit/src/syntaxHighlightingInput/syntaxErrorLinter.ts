// (C) 2026 GoodData Corporation

import { ensureSyntaxTree, syntaxTree } from "@codemirror/language";
import { type Diagnostic, linter } from "@codemirror/lint";
import { type EditorState } from "@codemirror/state";

const PARSE_BUDGET_MS = 200;

/**
 * Collects syntax-error diagnostics by walking the parse tree for error nodes.
 *
 * A blank document reports nothing: grammars differ on whether emptiness parses (JSON requires a
 * value, YAML does not), but an editor the user has not typed into yet is not in error — that is
 * what the caller's own "required" validation says, not the gutter.
 *
 * @internal
 */
export function getSyntaxErrorDiagnostics(state: EditorState, message: string): Diagnostic[] {
    if (state.doc.toString().trim() === "") {
        return [];
    }

    const diagnostics: Diagnostic[] = [];
    const completeTree = ensureSyntaxTree(state, state.doc.length, PARSE_BUDGET_MS);
    const tree = completeTree ?? syntaxTree(state);
    // A parse stopped before the end of the document ends with error nodes at the stop position,
    // where the text itself has no error.
    const isBeforeParseCut = (to: number) => completeTree !== null || to < tree.length;

    tree.iterate({
        enter(node) {
            if (node.type.isError && isBeforeParseCut(node.to)) {
                diagnostics.push({
                    from: node.from,
                    // Zero-width error nodes are widened so the marker has something to underline —
                    // but never past the end of the document, where an incomplete document's EOF
                    // error sits: a diagnostic outside the document is out of contract for the lint
                    // state and can throw once decorations are built from it.
                    to: Math.min(Math.max(node.to, node.from + 1), state.doc.length),
                    severity: "error",
                    message,
                });
            }
        },
    });

    return diagnostics;
}

/**
 * Creates a CodeMirror linter extension that reports syntax errors by walking the parse tree for
 * error nodes.
 *
 * Language-agnostic: it reads the tree the language extension builds, so it works for any grammar.
 * Each lint finishes an unfinished parse on the main thread, within a bounded time budget.
 *
 * @param message - localized message shown on each syntax-error diagnostic
 * @internal
 */
export function createSyntaxErrorLinter(message: string) {
    return linter((view) => getSyntaxErrorDiagnostics(view.state, message));
}
