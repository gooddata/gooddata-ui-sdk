// (C) 2021-2026 GoodData Corporation

import { type MutableRefObject } from "react";

import { type EditorView } from "@codemirror/view";

import { type HoverWithData, type ObjectContent } from "@gooddata/sdk-maql-language-server";
import { type IMetadataObject } from "@gooddata/sdk-model";

import { DecoratorClassName, DecoratorItemClassName } from "../../../codemirror/CodeEditor.styles.js";
import { rangeToSpan } from "../../../codemirror/lsp.js";
import { type IRootRef } from "../../../components/ExpandableTooltip.js";
import { setHoveredSpan } from "../../extensions/decorations.js";
import { type MaqlTooltipSettings, renderMaqlTooltip } from "../../MaqlEditor.tooltip.js";

// Cache to store element positions
interface ICachedPosition {
    top: number;
    left: number;
    width: number;
    height: number;
}

// Position cache using WeakMap to avoid modifying elements directly
const positionCache = new WeakMap<HTMLElement, ICachedPosition>();

export type HoverSettings = Omit<MaqlTooltipSettings, "elements" | "content"> & {
    content: ObjectContent | null | undefined;
};

/**
 * Opens the metric tooltip over the hovered reference.
 *
 * @param target - the element under the pointer, or at the cursor for the keyboard shortcut
 */
export function doHover(
    target: HTMLElement | null,
    tooltip: MutableRefObject<IRootRef | null>,
    editor: EditorView,
    hover: HoverWithData,
    settings: HoverSettings,
    onOpen?: (editor: EditorView, object: IMetadataObject) => void,
): void {
    if (!target || tooltip.current || !settings.content) {
        return;
    }

    try {
        // Collect valid DOM elements and ensure they have valid dimensions
        const rawElements = collectElements(target);

        const elements = rawElements.filter((el) => {
            const isValid = el && document.body.contains(el);
            if (isValid) {
                const rect = el.getBoundingClientRect();

                // Store position in the WeakMap instead of on the element
                positionCache.set(el, {
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                });

                return rect.width > 0 && rect.height > 0;
            }
            return false;
        });

        if (elements.length === 0) {
            return;
        }

        // Highlight the hovered reference
        createDecorator(editor, hover);

        // Prepare the callback for when the tooltip is opened
        const handleOpen = () => {
            if (!settings.content) return;

            onOpen?.(editor, {
                type: "measure",
                ...settings.content,
                deprecated: false,
                production: true,
                unlisted: false,
                uri: "",
            });
        };

        // Prepare the cleanup callback for when the tooltip is closed
        const handleDestroy = () => {
            removeDecorator(editor);
        };

        // Render the tooltip immediately
        renderMaqlTooltip(
            tooltip,
            {
                ...settings,
                elements,
                // the hovered spans are re-rendered by the editor (the hover decoration added above
                // already triggers that), so the editor node is the stable owner of the tooltip
                anchor: editor.dom,
                content: settings.content,
                cachedPositions: elements.map((el) => positionCache.get(el)),
            },
            handleOpen,
            handleDestroy,
        );
    } catch {
        // Silent error handling
    }
}

/**
 * The element at a document position: the span that renders the character before it, so a
 * cursor right after a reference still finds the reference.
 */
export function elementAtPosition(editor: EditorView, pos: number): HTMLElement | null {
    const { node } = editor.domAtPos(Math.max(pos - 1, 0));
    const element = node instanceof HTMLElement ? node : node.parentElement;

    return element ?? null;
}

const DECORATOR_SELECTOR = `.${DecoratorClassName}, .${DecoratorItemClassName}`;
const LINE_SELECTOR = ".cm-line";
const WIDGET_BUFFER_CLASS = "cm-widgetBuffer";

/**
 * The spans of the reference the element is part of: its badge and its text. The editor nests the
 * spans of overlapping marks, so each is looked for inside its line-level ancestor, and the buffers
 * the editor places around widgets are stepped over.
 */
export function collectElements(element: HTMLElement): Array<HTMLElement> {
    const line = element.closest<HTMLElement>(LINE_SELECTOR);
    const start = line ? lineLevelAncestor(element, line) : null;
    const target = start ? decoratorIn(start) : null;
    if (!start || !target) {
        return [];
    }

    const before = neighbours(start, (el) => el.previousElementSibling).reverse();
    const after = neighbours(start, (el) => el.nextElementSibling);

    return [...before, target, ...after];
}

function lineLevelAncestor(element: HTMLElement, line: HTMLElement): HTMLElement | null {
    let current = element;
    while (current.parentElement && current.parentElement !== line) {
        current = current.parentElement;
    }
    return current.parentElement === line ? current : null;
}

function decoratorIn(element: Element): HTMLElement | null {
    if (element.matches(DECORATOR_SELECTOR)) {
        return element as HTMLElement;
    }
    return element.querySelector<HTMLElement>(DECORATOR_SELECTOR);
}

function neighbours(start: Element, next: (el: Element) => Element | null): HTMLElement[] {
    const found: HTMLElement[] = [];
    let current = next(start);

    while (current) {
        if (!current.classList.contains(WIDGET_BUFFER_CLASS)) {
            const decorator = decoratorIn(current);
            if (!decorator) {
                break;
            }
            found.push(decorator);
        }
        current = next(current);
    }

    return found;
}

function createDecorator(editor: EditorView, hover: HoverWithData): void {
    if (!hover.range) {
        return;
    }
    editor.dispatch({ effects: setHoveredSpan.of(rangeToSpan(editor.state.doc, hover.range)) });
}

function removeDecorator(editor: EditorView): void {
    editor.dispatch({ effects: setHoveredSpan.of(null) });
}
