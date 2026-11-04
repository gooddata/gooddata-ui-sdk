// (C) 2022-2026 GoodData Corporation

import { type Extension, type Text } from "@codemirror/state";
import { type EditorView, keymap } from "@codemirror/view";
import { type FormattingOptions, type TextEdit } from "vscode-languageserver-types";

import { type MaqlLanguageService } from "@gooddata/sdk-maql-language-server";

import { createDocument, spanToRange, textEditsToChanges } from "../../codemirror/lsp.js";
import { LANGUAGE } from "../constants.js";

const FORMATTING_OPTIONS: FormattingOptions = { tabSize: 2, insertSpaces: true };

/**
 * Applies the edits the language service computed for `doc`, unless the editor is read-only or
 * the user changed the code while the request was in flight: the edits address the old text and
 * would land in the wrong places of the new one.
 */
function applyEdits(editor: EditorView, doc: Text, edits: readonly TextEdit[]): boolean {
    // The read-only facet stops the user's edits, not a dispatched change.
    if (editor.state.readOnly || editor.state.doc !== doc) {
        return false;
    }
    editor.dispatch({ changes: textEditsToChanges(doc, edits) });
    return true;
}

/**
 * Formats the whole code with the language service.
 *
 * @returns whether the code was formatted; false when the editor is read-only, the code changed
 * during the request, or the request failed
 */
export async function formatMaqlDocument(
    editor: EditorView,
    languageService: MaqlLanguageService,
): Promise<boolean> {
    const doc = editor.state.doc;
    const document = createDocument(editor.state, LANGUAGE);
    try {
        const edits = await languageService.doFormat(document, FORMATTING_OPTIONS);
        return applyEdits(editor, doc, edits);
    } catch {
        return false;
    }
}

/**
 * Formats the selection, or the whole code when nothing is selected.
 *
 * @returns whether the code was formatted; false when the editor is read-only, the code changed
 * during the request, or the request failed
 */
export async function formatMaqlSelection(
    editor: EditorView,
    languageService: MaqlLanguageService,
): Promise<boolean> {
    const selection = editor.state.selection.main;
    if (selection.empty) {
        return formatMaqlDocument(editor, languageService);
    }

    const doc = editor.state.doc;
    const document = createDocument(editor.state, LANGUAGE);
    const range = spanToRange(doc, { from: selection.from, to: selection.to });
    try {
        const edits = await languageService.doFormatRange(document, range, FORMATTING_OPTIONS);
        return applyEdits(editor, doc, edits);
    } catch {
        return false;
    }
}

/**
 * The formatting keys: Shift+Alt+F formats the document, the Ctrl+K Ctrl+F chord the selection.
 */
export function maqlFormattingKeymap(languageService: MaqlLanguageService): Extension {
    return keymap.of([
        {
            key: "Shift-Alt-f",
            run: (editor) => {
                void formatMaqlDocument(editor, languageService);
                return true;
            },
        },
        {
            key: "Mod-k Mod-f",
            run: (editor) => {
                void formatMaqlSelection(editor, languageService);
                return true;
            },
        },
    ]);
}
