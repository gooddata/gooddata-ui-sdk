// (C) 2026 GoodData Corporation

import { type Extension, StateEffect, StateField, type Text } from "@codemirror/state";
import {
    Decoration,
    type DecorationSet,
    EditorView,
    ViewPlugin,
    type ViewUpdate,
    WidgetType,
} from "@codemirror/view";

import { type IDecoration, type MaqlLanguageService } from "@gooddata/sdk-maql-language-server";

import { DecoratorHovered, Decorators } from "../../codemirror/CodeEditor.styles.js";
import { type ISpan, createDocument, rangeToSpan } from "../../codemirror/lsp.js";
import { LANGUAGE } from "../constants.js";

/**
 * The badge with the title of a referenced object, rendered before the reference.
 */
class LabelWidget extends WidgetType {
    constructor(
        private readonly label: string,
        private readonly className: string,
    ) {
        super();
    }

    override eq(other: LabelWidget): boolean {
        return other.label === this.label && other.className === this.className;
    }

    override toDOM(): HTMLElement {
        const span = document.createElement("span");
        span.className = this.className;
        // The spaces stand in for padding, the way the Monaco decoration rendered the badge.
        span.textContent = ` ${this.label} `;
        return span;
    }

    override ignoreEvent(): boolean {
        return false;
    }
}

export function buildDecorations(doc: Text, decorations: readonly IDecoration[]): DecorationSet {
    const ranges = decorations.flatMap((decoration) => {
        const { from, to } = rangeToSpan(doc, decoration.range);
        if (to <= from) {
            return [];
        }
        const def = Decorators[decoration.options.type] || Decorators["default"];

        return [
            Decoration.widget({
                widget: new LabelWidget(decoration.options.label, def.decorator.join(" ")),
                side: -1,
            }).range(from),
            Decoration.mark({ class: def.decoratorItem.join(" ") }).range(from, to),
        ];
    });

    return Decoration.set(ranges, true);
}

const setDecorations = StateEffect.define<DecorationSet>();

const decorationsField = StateField.define<DecorationSet>({
    create: () => Decoration.none,
    update(value, transaction) {
        for (const effect of transaction.effects) {
            if (effect.is(setDecorations)) {
                return effect.value;
            }
        }
        return transaction.docChanged ? value.map(transaction.changes) : value;
    },
    provide: (field) => EditorView.decorations.from(field),
});

/**
 * Highlights the reference the metric tooltip is open for.
 */
export const setHoveredSpan = StateEffect.define<ISpan | null>();

const hoveredDecoration = Decoration.mark({ class: DecoratorHovered });

const hoveredField = StateField.define<DecorationSet>({
    create: () => Decoration.none,
    update(value, transaction) {
        for (const effect of transaction.effects) {
            if (effect.is(setHoveredSpan)) {
                const span = effect.value;
                return span && span.to > span.from
                    ? Decoration.set([hoveredDecoration.range(span.from, span.to)])
                    : Decoration.none;
            }
        }
        return transaction.docChanged ? value.map(transaction.changes) : value;
    },
    provide: (field) => EditorView.decorations.from(field),
});

/**
 * The decoration state. Add {@link decorationsPlugin} to keep it filled.
 */
export function maqlDecorations(): Extension {
    return [decorationsField, hoveredField];
}

const REQUEST_DELAY_MS = 150;

/**
 * Asks the language service for the references in the code and decorates them, on every change.
 * With `enabled` off the editor shows no badges.
 */
export function decorationsPlugin(languageService: MaqlLanguageService, enabled: boolean): Extension {
    if (!enabled) {
        return ViewPlugin.define((view) => {
            // Dispatching inside the constructor is not allowed; clear once the view settles.
            setTimeout(() => view.dispatch({ effects: setDecorations.of(Decoration.none) }), 0);
            return {};
        });
    }

    return ViewPlugin.fromClass(
        class {
            private timer: number | undefined;
            private destroyed = false;

            constructor(private readonly view: EditorView) {
                this.schedule(0);
            }

            update(update: ViewUpdate): void {
                if (update.docChanged) {
                    this.schedule(REQUEST_DELAY_MS);
                }
            }

            destroy(): void {
                this.destroyed = true;
                window.clearTimeout(this.timer);
            }

            private schedule(delay: number): void {
                window.clearTimeout(this.timer);
                this.timer = window.setTimeout(() => this.request(), delay);
            }

            private request(): void {
                const doc = this.view.state.doc;
                languageService
                    .doDecoration(createDocument(this.view.state, LANGUAGE))
                    .then((decorations) => {
                        if (this.destroyed || this.view.state.doc !== doc) {
                            return;
                        }
                        this.view.dispatch({
                            effects: setDecorations.of(buildDecorations(doc, decorations)),
                        });
                    })
                    .catch(() => undefined);
            }
        },
    );
}
