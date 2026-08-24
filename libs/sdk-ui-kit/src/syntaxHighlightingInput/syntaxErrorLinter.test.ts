// (C) 2026 GoodData Corporation

import { json } from "@codemirror/lang-json";
import { yaml } from "@codemirror/lang-yaml";
import { ensureSyntaxTree } from "@codemirror/language";
import { EditorState, type Extension } from "@codemirror/state";
import { describe, expect, it } from "vitest";

import { getSyntaxErrorDiagnostics } from "./syntaxErrorLinter.js";

const diagnosticsFor = (doc: string, language: Extension) => {
    const initial = EditorState.create({ doc, extensions: [language] });
    // The initial parse only gets a small time budget; on a loaded machine a partial tree would
    // make the walk silently miss the error nodes under test.
    if (ensureSyntaxTree(initial, doc.length, 5000) === null && doc.length > 0) {
        throw new Error("Parse did not finish; the diagnostics under test would not be tree-derived.");
    }
    // `ensureSyntaxTree` finishes the parse but hands the completed tree back rather than storing it:
    // the state still carries the snapshot its own budgeted parse ended on, and that is the tree the
    // linter reads. An empty transaction is what makes the state adopt the finished one — without it,
    // a truncated initial parse leaves the unparsed tail looking like a syntax error.
    const state = initial.update({}).state;
    return getSyntaxErrorDiagnostics(state, "Syntax error");
};

describe("getSyntaxErrorDiagnostics", () => {
    it("reports nothing for a valid document", () => {
        expect(diagnosticsFor('{"a": 1}', json())).toEqual([]);
        expect(diagnosticsFor("a: 1", yaml())).toEqual([]);
    });

    it("reports the caller's message on a syntax error", () => {
        const diagnostics = diagnosticsFor('{"a": ', json());

        expect(diagnostics.length).toBeGreaterThan(0);
        expect(diagnostics[0]).toMatchObject({ severity: "error", message: "Syntax error" });
    });

    it("keeps a diagnostic for an error at the end of input inside the document", () => {
        // An incomplete document like `{` puts a zero-width error node at its very end; widening it
        // by one would point past the document, which the lint state must never receive.
        for (const doc of ["{", '{"a":', "[1,"]) {
            const diagnostics = diagnosticsFor(doc, json());

            expect(diagnostics.length).toBeGreaterThan(0);
            for (const diagnostic of diagnostics) {
                expect(diagnostic.to).toBeLessThanOrEqual(doc.length);
                expect(diagnostic.from).toBeLessThanOrEqual(diagnostic.to);
            }
        }
    });

    it("reports nothing for a blank document, even where the grammar requires a value", () => {
        // JSON's grammar parses an empty document as an error, YAML's does not. An editor the user
        // has not typed into yet is not in error either way — emptiness is for the caller's own
        // "required" validation to report, not the gutter.
        expect(diagnosticsFor("", json())).toEqual([]);
        expect(diagnosticsFor("  \n ", json())).toEqual([]);
        expect(diagnosticsFor("", yaml())).toEqual([]);
    });
});
