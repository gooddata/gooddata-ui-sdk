// (C) 2021-2026 GoodData Corporation

import { useCallback } from "react";

import { type EditorView } from "@codemirror/view";

/**
 * Copies the whole content of the editor, and selects it so the user sees what was copied.
 *
 * @returns whether the text reached the clipboard
 */
export function useCopyToClipboard(): (editor: EditorView | null | undefined) => Promise<boolean> {
    return useCallback(async (editor: EditorView | null | undefined) => {
        if (!editor) {
            return false;
        }

        const doc = editor.state.doc;
        const copied = await copyText(doc.toString());

        // The selection shows what was copied, so it is pointless once the content differs.
        if (editor.state.doc === doc) {
            editor.dispatch({ selection: { anchor: 0, head: doc.length } });
            editor.focus();
        }

        return copied;
    }, []);
}

async function copyText(text: string): Promise<boolean> {
    if (navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            // Rejected without the permission or focus; the legacy command may still work.
        }
    }

    return copyWithCommand(text);
}

/**
 * The legacy copy takes the selection of the document, which a read-only editor does not have: its
 * content is not editable, so it cannot be focused and CodeMirror does not put its selection in the
 * DOM. The text is copied from a temporary text area instead.
 */
function copyWithCommand(text: string): boolean {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.setAttribute("aria-hidden", "true");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "-10000px";
    document.body.appendChild(textarea);
    textarea.select();

    try {
        return document.execCommand("copy");
    } catch {
        return false;
    } finally {
        textarea.remove();
    }
}
