// (C) 2025 GoodData Corporation
import { MutableRefObject, useMemo } from "react";

import { ChangeSpec, Range, Transaction } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView, ViewPlugin, WidgetType } from "@codemirror/view";

import {
    CatalogItem,
    ICatalogDateAttribute,
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
interface HighlightState {
    decorations: DecorationSet;
    matches: Matches;
}

export function useHighlight(
    catalogItems: MutableRefObject<(CatalogItem | ICatalogDateAttribute)[] | undefined>,
) {
    return useMemo(() => {
        const state: HighlightState = {
            decorations: Decoration.none,
            matches: [],
        };

        return ViewPlugin.define(
            (view) => {
                const startDecorators = buildDecorations(view, catalogItems, getReferenceRegex());
                state.decorations = Decoration.set(startDecorators.decorations);
                state.matches = startDecorators.matches;

                return {
                    decorations: state.decorations,
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
                            const oldMatches = state.matches;
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
                            state.decorations = Decoration.set(updatedDecorator.decorations);
                            state.matches = updatedDecorator.matches;
                        }
                    },
                };
            },
            {
                decorations: () => {
                    return state.decorations;
                },
            },
        );
    }, [catalogItems]);
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

    ignoreEvent() {
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

    ignoreEvent() {
        return false; // allow selection if needed
    }
}
