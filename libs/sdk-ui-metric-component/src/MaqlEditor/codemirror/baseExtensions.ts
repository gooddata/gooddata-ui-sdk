// (C) 2026 GoodData Corporation

import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { bracketMatching, indentUnit } from "@codemirror/language";
import { highlightSelectionMatches, search, searchKeymap } from "@codemirror/search";
import { EditorState, type Extension } from "@codemirror/state";
import {
    type Command,
    EditorView,
    drawSelection,
    highlightSpecialChars,
    keymap,
    lineNumbers,
    tooltips,
} from "@codemirror/view";

import { changeAllOccurrences } from "./commands.js";

const TAB_SIZE = 2;

/**
 * Class of the placeholder that stands in for a non-breaking space.
 */
export const NBSP_CLASS = "maql-nbsp";

/**
 * A non-breaking space looks like a space but the language rejects it, so it is drawn as a marked
 * box, the way Monaco draws invisible characters.
 */
function renderNbsp(): HTMLElement {
    const span = document.createElement("span");
    span.className = `cm-specialChar ${NBSP_CLASS}`;
    span.title = "Non-breaking space (U+00A0)";
    span.setAttribute("aria-label", span.title);
    span.textContent = " ";
    return span;
}

/**
 * Tooltips may use the whole window, so a hover above the first line opens above the editor
 * instead of covering the code.
 */
function windowSpace() {
    return { top: 0, left: 0, right: window.innerWidth, bottom: window.innerHeight };
}

/**
 * Tab and Shift-Tab move the focus out of the editor, as in any other text field, so the editor is
 * no keyboard trap (WCAG 2.1.2); indentation is on Mod-] and Mod-[ of the standard bindings, and an
 * open suggestion list takes Tab to accept a suggestion. The one thing kept is the input method:
 * while it composes text (the Vietnamese keyboard, for one), Tab is held, because leaving the text it
 * still owns ends up with the typed letters twice.
 */
const holdTabWhileComposing: Command = (view) => view.compositionStarted;

/**
 * The editing behaviour every editor of this package shares: undo history, bracket pairing and
 * matching, the standard key bindings, two-space indentation, and the find and replace panel at
 * the top of the editor, where Monaco's find widget was, with its keys (Mod-f, F3, Enter).
 */
export function baseExtensions(): Extension {
    return [
        history(),
        drawSelection(),
        bracketMatching(),
        closeBrackets(),
        search({ top: true }),
        highlightSelectionMatches(),
        highlightSpecialChars({ specialChars: / /g, render: renderNbsp }),
        tooltips({ tooltipSpace: windowSpace }),
        keymap.of([
            ...closeBracketsKeymap,
            ...defaultKeymap,
            ...historyKeymap,
            ...searchKeymap,
            { key: "Tab", run: holdTabWhileComposing, shift: holdTabWhileComposing },
            { key: "Mod-F2", run: changeAllOccurrences },
        ]),
        indentUnit.of(" ".repeat(TAB_SIZE)),
        EditorState.tabSize.of(TAB_SIZE),
        // "Change All Occurrences" edits with a cursor on every occurrence.
        EditorState.allowMultipleSelections.of(true),
    ];
}

export function lineNumbersExtension(enabled: boolean): Extension {
    return enabled ? lineNumbers() : [];
}

export function readOnlyExtension(readOnly: boolean): Extension {
    return [
        EditorState.readOnly.of(readOnly),
        EditorView.editable.of(!readOnly),
        // A read-only content is not editable, so the browser does not let the keyboard reach it on
        // its own. An editable one is, but reports tabIndex -1, and a focus trap that reads the
        // tabIndex (the dialog's) skips it. The explicit tab index keeps either in the focus order,
        // at its place, so Tab moves into the editor and out of it to the next control.
        EditorView.contentAttributes.of({ tabindex: "0" }),
    ];
}
