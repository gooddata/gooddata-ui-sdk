// (C) 2025-2026 GoodData Corporation

import { type MutableRefObject, useMemo, useRef } from "react";

import { type ChangeSpec, EditorSelection, type Range, Transaction } from "@codemirror/state";
import {
    Decoration,
    type DecorationSet,
    type EditorView,
    ViewPlugin,
    WidgetType,
    keymap,
} from "@codemirror/view";

import {
    type CatalogItem,
    type ICatalogDateAttribute,
    isCatalogAttribute,
    isCatalogDateAttribute,
    isCatalogDateDataset,
    isCatalogFact,
    isCatalogMeasure,
} from "@gooddata/sdk-model";

import { getCatalogItemId, getCatalogItemTitle, getReferenceRegex } from "../completion/utils.js";

const HIGHLIGHT_CLASS = "cm-highlight-phrase";
const WIDGET_CLASS = "cm-icon-widget";

type Matches = Array<{ from: number; to: number; item: CatalogItem | ICatalogDateAttribute }>;
interface IHighlightState {
    decorations: DecorationSet;
    matches: Matches;
}

export function useHighlight(
    catalogItems: MutableRefObject<(CatalogItem | ICatalogDateAttribute)[] | undefined>,
) {
    const ref = useRef<IHighlightState>({
        decorations: Decoration.none,
        matches: [],
    });

    const highlightExtension = useMemo(() => {
        return ViewPlugin.define(
            (view) => {
                const startDecorators = buildDecorations(view, catalogItems, getReferenceRegex());
                ref.current.decorations = Decoration.set(startDecorators.decorations);
                ref.current.matches = startDecorators.matches;

                return {
                    decorations: ref.current.decorations,
                    update(update) {
                        const view = update.view;
                        const changes = update.changes;

                        const isBackwardDeletion = update.transactions.some(
                            (tr) => tr.annotation(Transaction.userEvent) === "delete.backward",
                        );
                        const isForwardDeletion = update.transactions.some(
                            (tr) => tr.annotation(Transaction.userEvent) === "delete.forward",
                        );

                        if (isBackwardDeletion || isForwardDeletion) {
                            const updates: ChangeSpec[] = [];
                            const oldMatches = ref.current.matches;
                            let lastItem;
                            // Iterate over the old matches and check if they are still valid
                            for (const match of oldMatches) {
                                // If the match is not in the old matches, add it
                                if (changes.touchesRange(match.from, match.to)) {
                                    const newFrom = changes.mapPos(match.from);
                                    const newTo = changes.mapPos(match.to);

                                    const insert = getCatalogItemTitle(match.item);
                                    const last = {
                                        from: newFrom,
                                        to: newTo,
                                        insert,
                                    };
                                    updates.push(last);
                                    lastItem = last;
                                }
                            }
                            // Update the decorations with the new changes
                            if (lastItem && updates.length > 0) {
                                const cursorPos = isForwardDeletion
                                    ? lastItem.from
                                    : lastItem.from + lastItem.insert.length;

                                setTimeout(() => {
                                    view.dispatch({
                                        changes: updates,
                                        selection: { anchor: cursorPos },
                                        scrollIntoView: true,
                                    });
                                }, 0);
                            }
                        }
                        // Otherwise, normal doc/view change logic
                        if (update.docChanged || update.viewportChanged) {
                            const updatedDecorator = buildDecorations(
                                update.view,
                                catalogItems,
                                getReferenceRegex(),
                            );
                            ref.current.decorations = Decoration.set(updatedDecorator.decorations);
                            ref.current.matches = updatedDecorator.matches;
                        }
                    },
                };
            },
            {
                decorations: () => {
                    return ref.current.decorations;
                },
            },
        );
    }, [catalogItems]);

    const atomicCursorExtension = useMemo(() => {
        // helper to find if pos is right before/after a replaced widget
        function findWidgetBoundary(pos: number, dir: "left" | "right") {
            let found: number | null = null;

            // Look through all decorations at the relevant point
            const decorations = ref.current.decorations;
            decorations.between(pos - 1, pos + 1, (from, to, deco) => {
                if (deco.spec.widget instanceof TitleWidget) {
                    // cursor just after widget
                    if (dir === "left" && to === pos) {
                        found = from;
                    }
                    // cursor just before widget
                    if (dir === "right" && from === pos) {
                        found = to;
                    }
                }
            });
            return found;
        }
        // helper to move cursor across a replaced widget
        function moveAcrossWidget(dir: "left" | "right", extend: boolean) {
            return (view: EditorView) => {
                const sel = view.state.selection.main;
                // only handle cursors, unless extending
                if (!sel.empty && !extend) {
                    return false;
                }

                const target = findWidgetBoundary(sel.head, dir);
                if (target === null) {
                    return false;
                }

                view.dispatch({
                    selection: EditorSelection.single(extend ? sel.anchor : target, target),
                    scrollIntoView: true,
                });
                return true;
            };
        }

        return keymap.of([
            { key: "ArrowLeft", run: moveAcrossWidget("left", false) },
            { key: "ArrowRight", run: moveAcrossWidget("right", false) },
            { key: "Shift-ArrowLeft", run: moveAcrossWidget("left", true) },
            { key: "Shift-ArrowRight", run: moveAcrossWidget("right", true) },
        ]);
    }, []);

    return {
        highlightExtension,
        atomicCursorExtension,
    };
}

// Create a highlight extension
function buildDecorations(
    view: EditorView,
    catalogItems: MutableRefObject<(CatalogItem | ICatalogDateAttribute)[] | undefined>,
    regex: RegExp | undefined,
) {
    const decorations: Range<Decoration>[] = [];
    const matches: Matches = [];

    for (const { from, to } of view.visibleRanges) {
        const text = view.state.doc.sliceString(from, to);
        let match;
        while ((match = regex?.exec(text))) {
            addMatch(catalogItems, matches, decorations, match, from);
        }
    }
    return {
        decorations,
        matches,
    };
}

// Scan the document for matches
function addMatch(
    catalogItems: MutableRefObject<(CatalogItem | ICatalogDateAttribute)[] | undefined>,
    matches: Matches,
    builder: Range<Decoration>[],
    match: RegExpExecArray,
    from: number,
) {
    const matched = match[0];
    const [, id] = match[1].split("/");
    const item = catalogItems.current?.find((itm) => {
        return getCatalogItemId(itm) === id;
    });
    if (item) {
        const start = from + match.index;
        const end = start + matched.length;
        // Widget before the matched text
        builder.push(
            Decoration.widget({
                widget: new IconWidget(item),
                side: -1,
            }).range(start),
        );
        // Highlight the matched text
        builder.push(
            Decoration.replace({
                widget: new TitleWidget(item),
                inclusive: false,
            }).range(start, end),
        );
        // Store the match for potential future use
        matches.push({ from: start, to: end, item });
    }
}

class IconWidget extends WidgetType {
    item: CatalogItem | ICatalogDateAttribute;

    constructor(item: CatalogItem | ICatalogDateAttribute) {
        super();
        this.item = item;
    }

    toDOM() {
        const item = this.item;
        const span = document.createElement("span");
        span.className = [
            WIDGET_CLASS,
            ...(isCatalogMeasure(item) ? ["metric"] : []),
            ...(isCatalogAttribute(item) ? ["attribute"] : []),
            ...(isCatalogFact(item) ? ["fact"] : []),
            ...(isCatalogDateDataset(item) ? ["date"] : []),
            ...(isCatalogDateAttribute(item) ? ["date"] : []),
        ].join(" ");
        return span;
    }

    override ignoreEvent() {
        return true;
    }
}

class TitleWidget extends WidgetType {
    item: CatalogItem | ICatalogDateAttribute;

    constructor(item: CatalogItem | ICatalogDateAttribute) {
        super();
        this.item = item;
    }

    toDOM() {
        const item = this.item;
        const span = document.createElement("span");
        span.textContent = getCatalogItemTitle(this.item);
        span.className = [
            HIGHLIGHT_CLASS,
            ...(isCatalogMeasure(item) ? ["metric"] : []),
            ...(isCatalogAttribute(item) ? ["attribute"] : []),
            ...(isCatalogFact(item) ? ["fact"] : []),
            ...(isCatalogDateDataset(item) ? ["date"] : []),
            ...(isCatalogDateAttribute(item) ? ["date"] : []),
        ].join(" ");
        return span;
    }

    override ignoreEvent() {
        return false; // allow selection if needed
    }
}
