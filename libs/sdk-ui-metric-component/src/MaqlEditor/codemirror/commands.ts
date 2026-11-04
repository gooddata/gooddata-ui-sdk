// (C) 2026 GoodData Corporation

import { selectSelectionMatches } from "@codemirror/search";
import { EditorSelection } from "@codemirror/state";
import { type Command, type EditorView } from "@codemirror/view";

/**
 * Puts a cursor on every occurrence of the selected text, or of the word at the cursor, the way
 * Monaco's "Change All Occurrences" did.
 */
export const changeAllOccurrences: Command = (view) => {
    if (view.state.readOnly) {
        return false;
    }

    const { main } = view.state.selection;
    if (main.empty) {
        const word = view.state.wordAt(main.head);
        if (!word) {
            return false;
        }
        view.dispatch({ selection: { anchor: word.from, head: word.to } });
    }

    return selectSelectionMatches(view);
};

interface ISpan {
    from: number;
    to: number;
}

/**
 * What a copy takes, the way Monaco copied: every range that selects text, one per line on the
 * clipboard, or the whole line of the cursor, with its line break, when no range selects anything.
 * The spans are what a cut removes, so they hold exactly the text that went to the clipboard;
 * `mainIndex` is the span of the main selection, which the cut keeps as the main cursor.
 */
function clipboardContent(view: EditorView): { spans: ISpan[]; text: string; mainIndex: number } {
    const { ranges, main } = view.state.selection;
    const selected = ranges.filter((range) => !range.empty);
    if (selected.length > 0) {
        const spans = selected.map((range) => ({ from: range.from, to: range.to }));
        return {
            spans,
            text: spans.map((span) => view.state.sliceDoc(span.from, span.to)).join("\n"),
            mainIndex: Math.max(0, selected.indexOf(main)),
        };
    }

    const line = view.state.doc.lineAt(main.head);
    return {
        spans: [{ from: line.from, to: Math.min(line.to + 1, view.state.doc.length) }],
        text: `${line.text}\n`,
        mainIndex: 0,
    };
}

async function writeToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return document.execCommand("copy");
    }
}

/**
 * Copies the selection, or the line of the cursor, to the clipboard.
 */
export async function copySelection(view: EditorView): Promise<boolean> {
    return writeToClipboard(clipboardContent(view).text);
}

/**
 * Copies the selection, or the line of the cursor, to the clipboard and removes it from the code.
 * Every selected range goes, with a cursor left in its place.
 */
export async function cutSelection(view: EditorView): Promise<boolean> {
    if (view.state.readOnly) {
        return false;
    }

    const { spans, text, mainIndex } = clipboardContent(view);
    if (!(await writeToClipboard(text))) {
        return false;
    }

    const changes = view.state.changes(spans.map((span) => ({ from: span.from, to: span.to })));
    view.dispatch({
        changes,
        selection: EditorSelection.create(
            spans.map((span) => EditorSelection.cursor(changes.mapPos(span.from))),
            mainIndex,
        ),
        userEvent: "delete.cut",
    });
    return true;
}

/**
 * Replaces the selection with the text on the clipboard. The browser lets a page read the
 * clipboard only with the user's permission; without it, nothing is pasted.
 */
export async function pasteFromClipboard(view: EditorView): Promise<boolean> {
    if (view.state.readOnly) {
        return false;
    }

    let text: string;
    try {
        text = await navigator.clipboard.readText();
    } catch {
        return document.execCommand("paste");
    }

    view.dispatch(view.state.replaceSelection(text), { scrollIntoView: true, userEvent: "input.paste" });
    return true;
}
