// (C) 2021-2026 GoodData Corporation

import { type MutableRefObject } from "react";

import { type Extension, Prec } from "@codemirror/state";
import { EditorView, type Tooltip, hoverTooltip, keymap } from "@codemirror/view";
import { type MarkedString, type MarkupContent } from "vscode-languageserver-types";

import { type HoverWithData, type MaqlLanguageService } from "@gooddata/sdk-maql-language-server";
import { type IMetadataObject } from "@gooddata/sdk-model";

import { HOVER_CLASS } from "../../codemirror/CodeEditor.styles.js";
import { createDocument, offsetToPosition, rangeToSpan } from "../../codemirror/lsp.js";
import { renderMarkdown } from "../../codemirror/markdown.js";
import { type IRootRef } from "../../components/ExpandableTooltip.js";
import { LANGUAGE } from "../constants.js";
import { type HoverSettings, doHover, elementAtPosition } from "../hooks/hover/doHover.js";
import { destroyMaqlTooltip } from "../MaqlEditor.tooltip.js";

export interface IMaqlHoverOptions {
    languageService: MaqlLanguageService;
    tooltip: MutableRefObject<IRootRef | null>;
    /**
     * The context the metric tooltip renders with. Read at hover time, so the latest values apply.
     */
    getSettings: () => Omit<HoverSettings, "content" | "readOnly">;
    onOpen?: (editor: EditorView, object: IMetadataObject) => void;
}

const HOVER_DELAY_MS = 300;

function isHoverShortcut(event: KeyboardEvent): boolean {
    return (event.ctrlKey || event.metaKey) && event.key === "u";
}

function markdownOf(contents: MarkupContent | MarkedString | MarkedString[]): string {
    if (Array.isArray(contents)) {
        return contents.map((content) => markdownOf(content)).join("\n\n");
    }
    if (typeof contents === "string") {
        return contents;
    }
    if ("language" in contents) {
        return "```" + contents.language + "\n" + contents.value + "\n```";
    }
    return contents.value;
}

/**
 * Hover from the language service: the metric tooltip for a referenced object, a markdown tooltip
 * for everything else. Ctrl+U or Cmd+U hovers the cursor.
 */
export function maqlHover({ languageService, tooltip, getSettings, onOpen }: IMaqlHoverOptions): Extension {
    async function hover(editor: EditorView, pos: number): Promise<HoverWithData | null> {
        const document = createDocument(editor.state, LANGUAGE);
        const position = offsetToPosition(editor.state.doc, pos);
        try {
            return await languageService.doHover(document, position);
        } catch {
            return null;
        }
    }

    function showObjectTooltip(editor: EditorView, pos: number, result: HoverWithData): void {
        doHover(
            elementAtPosition(editor, pos),
            tooltip,
            editor,
            result,
            {
                ...getSettings(),
                content: result.object,
                readOnly: editor.state.readOnly || Boolean(result.object?.isLocked),
            },
            onOpen,
        );
    }

    function markdownTooltip(editor: EditorView, pos: number, result: HoverWithData): Tooltip | null {
        const markdown = result.contents ? markdownOf(result.contents) : "";
        if (!markdown.trim()) {
            return null;
        }
        const span = result.range ? rangeToSpan(editor.state.doc, result.range) : { from: pos, to: pos };

        return {
            pos: span.from,
            end: span.to,
            above: true,
            create: () => renderMarkdown(markdown, HOVER_CLASS),
        };
    }

    const mouseHover = hoverTooltip(
        async (editor, pos) => {
            const result = await hover(editor, pos);
            if (!result) {
                return null;
            }
            if (result.object) {
                showObjectTooltip(editor, pos + 1, result);
                return null;
            }
            return markdownTooltip(editor, pos, result);
        },
        { hoverTime: HOVER_DELAY_MS },
    );

    // Above the standard bindings: the history keymap binds Mod-u to undoing a selection change
    // there, which would take the key as soon as the caret had moved.
    const shortcut = Prec.high(
        keymap.of([
            {
                key: "Mod-u",
                run: (editor) => {
                    const pos = editor.state.selection.main.head;
                    void hover(editor, pos).then((result) => {
                        if (result?.object) {
                            showObjectTooltip(editor, pos, result);
                        }
                    });
                    return true;
                },
            },
        ]),
    );

    // Typing closes the metric tooltip; the shortcut that opens it does not.
    const closeOnKey = EditorView.domEventHandlers({
        keydown: (event) => {
            if (!isHoverShortcut(event)) {
                destroyMaqlTooltip(tooltip);
            }
            return false;
        },
    });

    return [mouseHover, shortcut, closeOnKey];
}
