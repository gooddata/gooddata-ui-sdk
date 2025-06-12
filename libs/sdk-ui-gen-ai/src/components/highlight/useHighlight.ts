// (C) 2025 GoodData Corporation
import { MutableRefObject, useMemo } from "react";
import { Decoration, DecorationSet, EditorView, ViewPlugin, WidgetType } from "@codemirror/view";
import { Completion } from "@codemirror/autocomplete";
import { Range } from "@codemirror/state";

import { escapeRegex } from "../completion/utils.js";

const HIGHLIGHT_CLASS = "cm-highlight-phrase";
const WIDGET_CLASS = "cm-icon-widget";

export function useHighlight(itemsRef: MutableRefObject<Completion[]>) {
    return useMemo(() => {
        const state: {
            decorations: DecorationSet;
        } = {
            decorations: Decoration.none,
        };

        return ViewPlugin.define(
            (view) => {
                const regex = createRegex(itemsRef.current);
                state.decorations = buildDecorations(view, itemsRef, regex);
                return {
                    decorations: state.decorations,
                    update(update) {
                        if (update.docChanged || update.viewportChanged) {
                            const regex = createRegex(itemsRef.current);
                            state.decorations = buildDecorations(update.view, itemsRef, regex);
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
    }, [itemsRef]);
}

// Create a highlight extension
function buildDecorations(
    view: EditorView,
    items: MutableRefObject<Completion[]>,
    regex: RegExp | undefined,
) {
    const builder: Range<Decoration>[] = [];

    for (const { from, to } of view.visibleRanges) {
        const text = view.state.doc.sliceString(from, to);
        let match;
        while ((match = regex?.exec(text))) {
            addMatch(items, builder, match, from);
        }
    }
    return Decoration.set(builder);
}

function addMatch(
    items: MutableRefObject<Completion[]>,
    builder: Range<Decoration>[],
    match: RegExpExecArray,
    from: number,
) {
    const matched = match[0];
    const item = items.current.find((itm) => {
        return itm.label === matched;
    });
    if (item) {
        const start = from + match.index;
        const end = start + matched.length;
        const className = [
            HIGHLIGHT_CLASS,
            ...(item.type === "metric" ? ["metric"] : []),
            ...(item.type === "attribute" ? ["attribute"] : []),
            ...(item.type === "fact" ? ["fact"] : []),
            ...(item.type === "date" ? ["date"] : []),
        ];
        // Widget before the matched text
        builder.push(
            Decoration.widget({
                widget: new IconWidget(item),
                side: -1, // side -1 means "before" the mark
            }).range(start),
        );
        // Highlight the matched text
        builder.push(Decoration.mark({ class: className.join(" ") }).range(start, end));
    }
}

function createRegex(items: Completion[]): RegExp | undefined {
    return items.length > 0
        ? new RegExp(
              items
                  .map((i) => i.label)
                  .sort((a, b) => b.length - a.length) // Sort by length descending
                  .filter(Boolean)
                  .map((p) => `(?<!\\w)${escapeRegex(p as string)}(?!\\w)`)
                  .join("|"),
              "gi",
          )
        : undefined;
}

class IconWidget extends WidgetType {
    item: Completion;

    constructor(item: Completion) {
        super();
        this.item = item;
    }

    toDOM() {
        const item = this.item;
        const span = document.createElement("span");
        span.className = [
            WIDGET_CLASS,
            ...(item.type === "metric" ? ["metric"] : []),
            ...(item.type === "attribute" ? ["attribute"] : []),
            ...(item.type === "fact" ? ["fact"] : []),
            ...(item.type === "date" ? ["date"] : []),
        ].join(" ");
        return span;
    }

    ignoreEvent() {
        return true;
    }
}
