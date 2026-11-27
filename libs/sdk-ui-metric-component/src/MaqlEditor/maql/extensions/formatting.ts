// (C) 2022-2026 GoodData Corporation

import { type Extension, type Text } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { type FormattingOptions, type TextEdit } from "vscode-languageserver-types";

import { type MaqlLanguageService } from "@gooddata/sdk-maql-language-server";

import { createDocument, spanToRange, textEditsToChanges } from "../../codemirror/lsp.js";
import { LANGUAGE } from "../constants.js";

const FORMATTING_OPTIONS: FormattingOptions = { tabSize: 2, insertSpaces: true };

/**
 * The status messages read by screen readers after a format command, as phrases of the editor
 * (`EditorState.phrases`), so the host can translate them.
 */
export const FORMATTING_PHRASES = {
    documentFormatted: "Code formatted",
    selectionFormatted: "Selection formatted",
    nothingToFormat: "Nothing to format",
    failed: "Formatting failed",
} as const;

/**
 * Reads a status message of the format command through the editor's live region.
 */
function announce(editor: EditorView, phrase: string): void {
    editor.dispatch({ effects: EditorView.announce.of(editor.state.phrase(phrase)) });
}

/**
 * Applies the edits the language service computed for `doc`, unless the editor is read-only or
 * the user changed the code while the request was in flight: the edits address the old text and
 * would land in the wrong places of the new one.
 *
 * Announces to screen readers whether the code changed.
 */
function applyEdits(
    editor: EditorView,
    doc: Text,
    edits: readonly TextEdit[],
    formattedPhrase: string,
): boolean {
    // The read-only facet stops the user's edits, not a dispatched change.
    if (editor.state.readOnly || editor.state.doc !== doc) {
        return false;
    }
    const changes = editor.state.changes(textEditsToChanges(doc, edits));
    if (changes.apply(doc).eq(doc)) {
        announce(editor, FORMATTING_PHRASES.nothingToFormat);
        return true;
    }
    editor.dispatch({
        changes,
        effects: EditorView.announce.of(editor.state.phrase(formattedPhrase)),
    });
    return true;
}

function reportFailure(editor: EditorView): false {
    // The editor may be gone by the time the request fails.
    if (editor.dom.isConnected) {
        announce(editor, FORMATTING_PHRASES.failed);
    }
    return false;
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
        return applyEdits(editor, doc, edits, FORMATTING_PHRASES.documentFormatted);
    } catch {
        return reportFailure(editor);
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
        return applyEdits(editor, doc, edits, FORMATTING_PHRASES.selectionFormatted);
    } catch {
        return reportFailure(editor);
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
