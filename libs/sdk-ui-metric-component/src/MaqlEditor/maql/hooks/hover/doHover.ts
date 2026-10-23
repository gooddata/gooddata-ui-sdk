// (C) 2021-2026 GoodData Corporation

//more info in README.md
import { type MutableRefObject } from "react";

import type * as monaco from "monaco-editor/editor/editor.api.js";

import { type ObjectContent } from "@gooddata/sdk-maql-language-server";
import { type IMetadataObject } from "@gooddata/sdk-model";

import { type IRootRef } from "../../../components/ExpandableTooltip.js";
import { type IStandaloneCodeEditor } from "../../../monaco/MonacoEditor.js";
import {
    DecoratorClassName,
    DecoratorHovered,
    DecoratorItemClassName,
} from "../../../monaco/MonacoEditor.styles.js";
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

// Remove empty interface that was causing the linter error
// and use HTMLElement directly instead

export type HoverSettings = Omit<MaqlTooltipSettings, "elements" | "content"> & {
    content: ObjectContent | null | undefined;
};

export function doHover(
    event: MouseEvent | KeyboardEvent | null,
    tooltip: MutableRefObject<IRootRef | null>,
    editor: IStandaloneCodeEditor,
    hover: monaco.languages.Hover | null,
    settings: HoverSettings,
    onOpen?: (editor: IStandaloneCodeEditor, object: IMetadataObject) => void,
): monaco.languages.Hover | null {
    // Early return cases
    if (!hover || !event || tooltip.current || !settings.content) {
        return settings.content ? null : hover;
    }

    const containerNode = editor.getContainerDomNode();
    if (!containerNode) {
        return null;
    }

    try {
        // Collect valid DOM elements and ensure they have valid dimensions
        const rawElements = collectElements(containerNode, event);

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
            return null;
        }

        // Create a decorator for the hovered element
        const decorator = createDecorator(editor, hover);

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
            removeDecorator(editor, decorator);
        };

        // Render the tooltip immediately
        renderMaqlTooltip(
            tooltip,
            {
                ...settings,
                elements,
                // the hovered spans are re-rendered by Monaco (the hover decoration added above
                // already triggers that), so the editor node is the stable owner of the tooltip
                anchor: containerNode,
                content: settings.content,
                cachedPositions: elements.map((el) => positionCache.get(el)),
            },
            handleOpen,
            handleDestroy,
        );
    } catch {
        // Silent error handling
    }

    // Return null to prevent monaco from showing its default tooltip
    return null;
}

function collectElements(parent: HTMLElement, event: MouseEvent | KeyboardEvent): Array<HTMLElement> {
    const element = collectTarget(parent, event);

    if (!element) return [];

    const items: HTMLElement[] = [];

    if (isDecorator(element)) {
        items.push(element);
    }

    if (element) {
        let current = element.previousElementSibling;

        while (current && isDecorator(current)) {
            items.unshift(current as HTMLElement);

            current = current.previousElementSibling;
        }

        current = element.nextElementSibling;

        while (current && isDecorator(current)) {
            items.push(current as HTMLElement);
            current = current.nextElementSibling;
        }
    }

    return items;
}

function collectTarget(parent: HTMLElement, event: MouseEvent | KeyboardEvent): HTMLElement | null {
    if (event.type === "keydown") {
        const cursor = parent.querySelector(".cursor.monaco-mouse-cursor-text");
        if (cursor) {
            const { x, y, height } = cursor.getBoundingClientRect();
            const elementFromPoint = document.elementFromPoint(x - 1, y + height / 2);
            return (elementFromPoint as HTMLElement) || null;
        }
    }

    const target = event.target as HTMLElement;
    return target || null;
}

function isDecorator(el: Element | null): boolean {
    if (!el) return false;
    return el.classList.contains(DecoratorClassName) || el.classList.contains(DecoratorItemClassName);
}

function createDecorator(editor: IStandaloneCodeEditor, hover: monaco.languages.Hover): Array<string> {
    if (!hover.range) {
        return [];
    }
    return editor.deltaDecorations(
        [],
        [
            {
                range: hover.range,
                options: {
                    inlineClassName: DecoratorHovered,
                },
            },
        ],
    );
}

function removeDecorator(editor: IStandaloneCodeEditor, decorator: Array<string>) {
    editor.deltaDecorations(decorator, []);
}
