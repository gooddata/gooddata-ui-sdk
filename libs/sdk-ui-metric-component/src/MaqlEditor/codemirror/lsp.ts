// (C) 2026 GoodData Corporation

import { type Diagnostic as LintDiagnostic } from "@codemirror/lint";
import { type ChangeSpec, type EditorState, type Text } from "@codemirror/state";
import { TextDocument } from "vscode-languageserver-textdocument";
import {
    type Diagnostic,
    DiagnosticSeverity,
    type Position,
    type Range,
    type TextEdit,
} from "vscode-languageserver-types";

/**
 * Conversions between the language server protocol, which addresses text by zero-based line and
 * character, and CodeMirror, which addresses it by document offset.
 */

export interface ISpan {
    from: number;
    to: number;
}

export function positionToOffset(doc: Text, position: Position): number {
    const lineNumber = Math.min(Math.max(position.line + 1, 1), doc.lines);
    const line = doc.line(lineNumber);

    return Math.min(line.from + Math.max(position.character, 0), line.to);
}

export function offsetToPosition(doc: Text, offset: number): Position {
    const clamped = Math.min(Math.max(offset, 0), doc.length);
    const line = doc.lineAt(clamped);

    return { line: line.number - 1, character: clamped - line.from };
}

export function rangeToSpan(doc: Text, range: Range): ISpan {
    const from = positionToOffset(doc, range.start);
    const to = positionToOffset(doc, range.end);

    return { from: Math.min(from, to), to: Math.max(from, to) };
}

export function spanToRange(doc: Text, span: ISpan): Range {
    return { start: offsetToPosition(doc, span.from), end: offsetToPosition(doc, span.to) };
}

export function textEditsToChanges(doc: Text, edits: readonly TextEdit[]): ChangeSpec[] {
    return edits.map((edit) => ({ ...rangeToSpan(doc, edit.range), insert: edit.newText }));
}

function toLintSeverity(severity: DiagnosticSeverity | undefined): LintDiagnostic["severity"] {
    switch (severity) {
        case DiagnosticSeverity.Warning:
            return "warning";
        case DiagnosticSeverity.Information:
            return "info";
        case DiagnosticSeverity.Hint:
            return "hint";
        default:
            return "error";
    }
}

/**
 * The diagnostics as the editor's linter takes them. A diagnostic without extent, such as "missing
 * expression" at a bracket, keeps its position: Monaco drew no squiggle for it, and the editor
 * styles hide the point marker CodeMirror would draw, while the message still shows on navigation.
 */
export function diagnosticsToLint(doc: Text, diagnostics: readonly Diagnostic[]): LintDiagnostic[] {
    return diagnostics.map((diagnostic) => {
        const { from, to } = rangeToSpan(doc, diagnostic.range);

        return {
            from,
            to,
            severity: toLintSeverity(diagnostic.severity),
            message: diagnostic.message,
            // Shown after the message the way Monaco shows it: `MAQL(7)`.
            source: diagnosticSource(diagnostic),
        };
    });
}

function diagnosticSource(diagnostic: Diagnostic): string | undefined {
    const { source, code } = diagnostic;
    if (source === undefined) {
        return code === undefined ? undefined : String(code);
    }
    return code === undefined ? source : `${source}(${code})`;
}

const MODEL_URI = "inmemory://model";

let documentVersion = 0;

/**
 * Snapshot of the editor content in the shape the language service reads.
 */
export function createDocument(state: EditorState, languageId: string): TextDocument {
    documentVersion += 1;

    return TextDocument.create(
        `${MODEL_URI}.${languageId}`,
        languageId,
        documentVersion,
        state.doc.toString(),
    );
}
