// (C) 2026 GoodData Corporation

import { type Extension, RangeSetBuilder, StateEffect, StateField, type Text } from "@codemirror/state";
import { Decoration, type DecorationSet, EditorView, ViewPlugin, type ViewUpdate } from "@codemirror/view";
import { type SemanticTokensLegend } from "vscode-languageserver-types";

import { type MaqlLanguageService } from "@gooddata/sdk-maql-language-server";

import { SEMANTIC_TOKEN_CLASS_PREFIX } from "../../codemirror/CodeEditor.styles.js";
import { createDocument, positionToOffset } from "../../codemirror/lsp.js";
import { LANGUAGE } from "../constants.js";

const setSemanticTokens = StateEffect.define<DecorationSet>();

const semanticTokensField = StateField.define<DecorationSet>({
    create: () => Decoration.none,
    update(value, transaction) {
        for (const effect of transaction.effects) {
            if (effect.is(setSemanticTokens)) {
                return effect.value;
            }
        }
        return transaction.docChanged ? value.map(transaction.changes) : value;
    },
    provide: (field) => EditorView.decorations.from(field),
});

const TOKEN_TYPE_SUFFIX = `.${LANGUAGE}`;

/**
 * Turns the protocol's relative token encoding, five integers per token, into mark decorations
 * classed by token type.
 */
export function decodeSemanticTokens(
    doc: Text,
    data: readonly number[],
    tokenTypes: readonly string[],
): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>();
    let line = 0;
    let start = 0;

    for (let i = 0; i + 4 < data.length; i += 5) {
        const [deltaLine, deltaStart, length, tokenType] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
        line += deltaLine;
        start = deltaLine === 0 ? start + deltaStart : deltaStart;

        const from = positionToOffset(doc, { line, character: start });
        const to = Math.min(from + length, doc.length);
        const type = tokenTypes[tokenType]?.replace(TOKEN_TYPE_SUFFIX, "");

        if (type && to > from) {
            builder.add(from, to, Decoration.mark({ class: `${SEMANTIC_TOKEN_CLASS_PREFIX}${type}` }));
        }
    }

    return builder.finish();
}

/**
 * Colors the code by the tokens of the language service's parser, which knows functions from
 * keywords and references from text. The regular-expression tokenizer colors the code meanwhile.
 */
export function semanticTokens(
    languageService: MaqlLanguageService,
    legend: SemanticTokensLegend,
): Extension {
    const plugin = ViewPlugin.fromClass(
        class {
            private destroyed = false;

            constructor(private readonly view: EditorView) {
                this.request();
            }

            update(update: ViewUpdate): void {
                if (update.docChanged) {
                    this.request();
                }
            }

            destroy(): void {
                this.destroyed = true;
            }

            private request(): void {
                const doc = this.view.state.doc;
                languageService
                    .doSemanticTokens(createDocument(this.view.state, LANGUAGE))
                    .then((tokens) => {
                        // A newer document has its own request on the way.
                        if (this.destroyed || this.view.state.doc !== doc) {
                            return;
                        }
                        this.view.dispatch({
                            effects: setSemanticTokens.of(
                                decodeSemanticTokens(doc, tokens.data, legend.tokenTypes),
                            ),
                        });
                    })
                    .catch(() => undefined);
            }
        },
    );

    return [semanticTokensField, plugin];
}
