// (C) 2026 GoodData Corporation

import { json } from "@codemirror/lang-json";
import { yaml } from "@codemirror/lang-yaml";
import { syntaxTree } from "@codemirror/language";
import { EditorState, type Extension } from "@codemirror/state";
import { describe, expect, it, onTestFinished, vi } from "vitest";

import { getSyntaxErrorDiagnostics } from "./syntaxErrorLinter.js";

const createState = (doc: string, language: Extension) => EditorState.create({ doc, extensions: [language] });

const diagnosticsFor = (doc: string, language: Extension) =>
    getSyntaxErrorDiagnostics(createState(doc, language), "Syntax error");

const initialTreeLength = (doc: string, language: Extension) => syntaxTree(createState(doc, language)).length;

const longJson = (entry: (index: number) => string) =>
    `{\n${Array.from({ length: 200 }, (_, index) => entry(index)).join(",\n")}\n}`;

const validLongJson = longJson((index) => `  "k${index}": { "background_color": "{theme.palette.success}" }`);

const validLongYaml = Array.from(
    { length: 200 },
    (_, index) => `k${index}:\n  background_color: "{theme.palette.success}"`,
).join("\n");

const earlyError = validLongJson.indexOf('"k1"');
const lateError = validLongJson.indexOf('"k150"');
const longJsonWithErrors = `${validLongJson.slice(0, earlyError)}?${validLongJson.slice(earlyError, lateError)}?${validLongJson.slice(lateError)}`;

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

    it("reports nothing for a valid document longer than the initial parse", () => {
        expect(initialTreeLength(validLongJson, json())).toBeLessThan(validLongJson.length);
        expect(initialTreeLength(validLongYaml, yaml())).toBeLessThan(validLongYaml.length);

        expect(diagnosticsFor(validLongJson, json())).toEqual([]);
        expect(diagnosticsFor(validLongYaml, yaml())).toEqual([]);
    });

    it("reports real errors before and past the initial parse", () => {
        expect(lateError).toBeGreaterThan(initialTreeLength(longJsonWithErrors, json()));

        const positions = diagnosticsFor(longJsonWithErrors, json()).map((diagnostic) => diagnostic.from);

        expect(positions).toEqual([earlyError, lateError + 1]);
    });

    it("reports only the errors before the cut of a parse that runs out of time, not those past it", () => {
        const state = createState(longJsonWithErrors, json());
        expect(syntaxTree(state).length).toBeLessThan(lateError);
        let now = Date.now();
        const dateNow = vi.spyOn(Date, "now").mockImplementation(() => (now += 1000));
        onTestFinished(() => dateNow.mockRestore());

        const positions = getSyntaxErrorDiagnostics(state, "Syntax error").map(
            (diagnostic) => diagnostic.from,
        );

        expect(positions).toEqual([earlyError]);
    });
});
