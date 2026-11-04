// (C) 2026 GoodData Corporation

import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap, indentLess, indentMore } from "@codemirror/commands";
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
 * Tab the way Monaco handled it: it inserts the indentation at the cursor, and indents the lines
 * of a selection. It does nothing in a read-only editor, nor while an input method composes text
 * (the Vietnamese keyboard, for one): an edit of the text the input method still owns ends up with
 * the typed letters twice.
 */
export const insertIndent: Command = (view) => {
    if (view.state.readOnly) {
        return false;
    }
    if (view.compositionStarted) {
        return true;
    }
    if (view.state.selection.ranges.some((range) => !range.empty)) {
        return indentMore(view);
    }
    view.dispatch(view.state.replaceSelection(view.state.facet(indentUnit)), {
        scrollIntoView: true,
        userEvent: "input",
    });
    return true;
};

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
            { key: "Tab", run: insertIndent, shift: indentLess },
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
        // The content of a read-only editor is not editable, so the browser does not let the
        // keyboard reach it on its own; the tab index keeps it in the focus order of the dialog.
        readOnly ? EditorView.contentAttributes.of({ tabindex: "0" }) : [],
    ];
}
