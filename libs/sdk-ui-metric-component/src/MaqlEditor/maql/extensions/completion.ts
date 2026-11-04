// (C) 2021-2026 GoodData Corporation

import {
    type Completion,
    type CompletionContext,
    type CompletionInfo,
    type CompletionResult,
    acceptCompletion,
    autocompletion,
    completionStatus,
    pickedCompletion,
    snippet,
    startCompletion,
} from "@codemirror/autocomplete";
import { type ChangeSpec, type Extension, Prec, StateEffect, StateField } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import {
    type CompletionItem,
    CompletionItemKind,
    type CompletionList,
    InsertTextFormat,
    type MarkupContent,
    TextEdit,
} from "vscode-languageserver-types";

import { type MaqlLanguageService } from "@gooddata/sdk-maql-language-server";

import {
    DOCS_CLASS,
    DOCS_OPEN_CLASS,
    DOCS_PANE_CLASS,
    DOCS_TOGGLE_CLASS,
    SUGGEST_CLASS,
    TYPE_LABEL_CLASS,
} from "../../codemirror/CodeEditor.styles.js";
import { createDocument, offsetToPosition, rangeToSpan, textEditsToChanges } from "../../codemirror/lsp.js";
import { renderMarkdown } from "../../codemirror/markdown.js";
import { LANGUAGE } from "../constants.js";

export interface IMaqlCompletionOptions {
    languageService: MaqlLanguageService;
    /**
     * Characters that open the suggestions on their own, from the language service capabilities.
     */
    triggerCharacters: readonly string[];
    /**
     * Receives the raw list the language service answered with, so the editor can tell the user
     * when it is incomplete. Null when the list closes.
     */
    onList: (list: CompletionList | null) => void;
    /**
     * Called when the user shows or hides the documentation of the suggestions.
     */
    onDocsToggle?: (view: EditorView, visible: boolean) => void;
}

/**
 * The text before the cursor the suggestions are filtered by: everything since the last space or
 * bracket, so an operator or an opening brace counts as well, the way the Monaco editor behaved.
 */
const WORD = /[^\s(),";]*$/;

/**
 * The icon class of a completion, keyed the way the editor icons are.
 */
export function completionType(kind: CompletionItemKind | undefined): string {
    switch (kind) {
        case CompletionItemKind.Field:
            return "fact";
        case CompletionItemKind.Variable:
            return "metric";
        case CompletionItemKind.Constant:
            return "dataset";
        case CompletionItemKind.Text:
            return "label";
        case CompletionItemKind.Enum:
        case CompletionItemKind.EnumMember:
            return "attribute";
        case CompletionItemKind.Keyword:
            return "keyword";
        case CompletionItemKind.Function:
            return "function";
        case CompletionItemKind.Operator:
            return "operator";
        case CompletionItemKind.Value:
            return "value";
        case CompletionItemKind.Snippet:
            return "snippet";
        default:
            return "text";
    }
}

/**
 * The protocol writes tab stops as `$1` and the final cursor as `$0`; CodeMirror wants them in braces,
 * with the final cursor as an unnamed field.
 */
export function toCodeMirrorSnippet(text: string): string {
    return text.replace(/\$(\d+)/g, (_match, index: string) => (index === "0" ? "${}" : `\${${index}}`));
}

/**
 * The text a completion replaces. The language service computed its edit for the document it was
 * asked about; the list stays open while the user types on, so the typed characters are taken in
 * as well, or they would stay behind the inserted text.
 *
 * @param from - start of the word the editor is completing
 * @param to - the cursor
 */
export function completionSpan(
    edit: { from: number; to: number } | undefined,
    from: number,
    to: number,
): { from: number; to: number } {
    if (!edit) {
        return { from, to };
    }
    return { from: Math.min(edit.from, from), to: Math.max(edit.to, to) };
}

export interface IFuzzyMatch {
    /**
     * Pairs of offsets into the text, one per matched run.
     */
    positions: number[];
    /**
     * Higher is better: a run of the typed text at the start of a word, a run, then scattered characters.
     */
    score: number;
}

function isWordStart(text: string, index: number): boolean {
    if (index === 0) {
        return true;
    }
    const previous = text[index - 1];
    const current = text[index];
    if (!/[A-Za-z0-9]/.test(previous)) {
        return true;
    }
    return previous !== previous.toUpperCase() && current !== current.toLowerCase();
}

/**
 * Matches the typed text against the filter text of an item the way the Monaco editor did: the
 * characters in order, ignoring case, and the first letter or digit of them at the start of a
 * word. Typing `me` or `{me` finds `{ metric / ... }`, not `{ dataset / timeline }`.
 */
export function fuzzyMatch(pattern: string, text: string): IFuzzyMatch | null {
    if (!pattern) {
        return { positions: [], score: 0 };
    }
    const needle = pattern.toLowerCase();
    const haystack = text.toLowerCase();
    // Punctuation such as `{` or `+` may sit anywhere; the word-start rule is for what follows it.
    const anchor = needle.search(/[a-z0-9]/);

    let run = haystack.indexOf(needle);
    while (run >= 0 && anchor >= 0 && !isWordStart(text, run + anchor)) {
        run = haystack.indexOf(needle, run + 1);
    }
    if (run >= 0) {
        return { positions: [run, run + needle.length], score: 3 };
    }

    const positions: number[] = [];
    let from = 0;
    for (let index = 0; index < needle.length; index += 1) {
        let at = haystack.indexOf(needle[index], from);
        while (at >= 0 && index === anchor && !isWordStart(text, at)) {
            at = haystack.indexOf(needle[index], at + 1);
        }
        if (at < 0) {
            return null;
        }
        if (positions.length && positions[positions.length - 1] === at) {
            positions[positions.length - 1] = at + 1;
        } else {
            positions.push(at, at + 1);
        }
        from = at + 1;
    }
    const firstRun = haystack.indexOf(needle);
    return { positions, score: firstRun >= 0 ? 2 : 1 };
}

/**
 * Where the typed characters sit in the shown label, as pairs of offsets. The match is made on
 * the filter text of an item, which carries the identifier besides the title; the highlight goes
 * on the label the user sees. A run of the typed text wins over scattered characters.
 *
 * @param matched - the offsets matched in the filter text
 */
export function matchInDisplayLabel(
    label: string,
    displayLabel: string,
    matched: readonly number[],
): number[] {
    let typed = "";
    for (let i = 0; i + 1 < matched.length; i += 2) {
        typed += label.slice(matched[i], matched[i + 1]);
    }
    const needle = typed.toLowerCase();
    if (!needle) {
        return [];
    }

    const haystack = displayLabel.toLowerCase();
    const run = haystack.indexOf(needle);
    if (run >= 0) {
        return [run, run + needle.length];
    }

    const result: number[] = [];
    let from = 0;
    for (const char of needle) {
        const at = haystack.indexOf(char, from);
        if (at < 0) {
            return [];
        }
        if (result.length && result[result.length - 1] === at) {
            result[result.length - 1] = at + 1;
        } else {
            result.push(at, at + 1);
        }
        from = at + 1;
    }
    return result;
}

function applyCompletion(
    view: EditorView,
    completion: Completion,
    item: CompletionItem,
    from: number,
    to: number,
) {
    // The read-only facet stops the user's edits, not a dispatched change.
    if (view.state.readOnly) {
        return;
    }
    const doc = view.state.doc;
    const edit = TextEdit.is(item.textEdit) ? item.textEdit : undefined;
    const span = completionSpan(edit ? rangeToSpan(doc, edit.range) : undefined, from, to);
    const text = edit?.newText ?? item.insertText ?? item.label;
    const additional = item.additionalTextEdits ? textEditsToChanges(doc, item.additionalTextEdits) : [];

    if (item.insertTextFormat === InsertTextFormat.Snippet) {
        // The snippet is placed after the additional edits moved the text, so its span is mapped
        // through them.
        let snippetFrom = span.from;
        let snippetTo = span.to;
        if (additional.length) {
            const changes = view.state.changes(additional);
            view.dispatch({ changes });
            snippetFrom = changes.mapPos(span.from, 1);
            snippetTo = Math.max(snippetFrom, changes.mapPos(span.to, -1));
        }
        snippet(toCodeMirrorSnippet(text))(view, completion, snippetFrom, snippetTo);
    } else {
        const specs: ChangeSpec[] = [{ from: span.from, to: span.to, insert: text }, ...additional];
        const changes = view.state.changes(specs);
        view.dispatch({
            changes,
            // The cursor goes after the inserted text, wherever the additional edits moved it.
            selection: { anchor: changes.mapPos(span.to, 1) },
            annotations: pickedCompletion.of(completion),
        });
    }

    // An accepted reference may open a longer one, so the suggestions reopen right away.
    startCompletion(view);
}

/**
 * A completion with the offsets to highlight in its label, computed by the editor's own filter.
 */
interface IMaqlCompletion extends Completion {
    matched: number[];
    /**
     * The type of the object, such as the type of a parameter, shown dimmed after the label on
     * every row, the way Monaco showed the label description.
     */
    typeLabel?: string;
}

function renderTypeLabel(completion: IMaqlCompletion): HTMLElement | null {
    if (!completion.typeLabel) {
        return null;
    }
    const span = document.createElement("span");
    span.className = TYPE_LABEL_CLASS;
    span.textContent = completion.typeLabel;
    return span;
}

/**
 * The translation of a label of the suggestions, from the phrases of the editor state.
 */
type Phrase = (text: string) => string;

function toCompletion(
    item: CompletionItem,
    matched: number[],
    languageService: MaqlLanguageService,
    phrase: Phrase,
): IMaqlCompletion {
    return {
        label: item.filterText ?? item.label,
        displayLabel: item.label,
        // Shown dimmed at the right of the row while the documentation is closed, the way Monaco
        // shows it; the documentation pane repeats it in its header.
        detail: item.detail,
        sortText: item.sortText,
        type: completionType(item.kind),
        matched,
        typeLabel: item.labelDetails?.description,
        apply: (view, completion, from, to) => applyCompletion(view, completion, item, from, to),
        info: () => resolveInfo(item, languageService, phrase),
    };
}

/**
 * The items that match the typed text, best matches first and the language service's order
 * among equals.
 */
export function filterItems(
    items: readonly CompletionItem[],
    typed: string,
    languageService: MaqlLanguageService,
    phrase: Phrase = (text) => text,
): IMaqlCompletion[] {
    const scored: Array<{
        completion: IMaqlCompletion;
        score: number;
        sortText: string;
        item: CompletionItem;
    }> = [];

    for (const item of items) {
        const text = item.filterText ?? item.label;
        const match = fuzzyMatch(typed, text);
        if (!match) {
            continue;
        }
        scored.push({
            completion: toCompletion(
                item,
                matchInDisplayLabel(text, item.label, match.positions),
                languageService,
                phrase,
            ),
            score: match.score,
            sortText: (item.sortText ?? item.label).toLowerCase(),
            item,
        });
    }

    // The order Monaco used among equal matches: the sort text, then the label, then the kind, so
    // the overloads of a function, which share a sort text, come in the order of their signatures.
    return scored
        .sort(
            (a, b) =>
                b.score - a.score ||
                compare(a.sortText, b.sortText) ||
                compare(a.item.label, b.item.label) ||
                (a.item.kind ?? 0) - (b.item.kind ?? 0),
        )
        .map((entry) => entry.completion);
}

function compare(a: string, b: string): number {
    return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Shows or hides the documentation of the suggestions. The choice sticks for the life of the editor,
 * the way it does in Monaco.
 */
export const setDocsVisible = StateEffect.define<boolean>();

const docsVisible = StateField.define<boolean>({
    create: () => false,
    update(value, transaction) {
        for (const effect of transaction.effects) {
            if (effect.is(setDocsVisible)) {
                return effect.value;
            }
        }
        return value;
    },
    // The documentation pane is rendered whenever an item has one, so it is laid out and placed
    // by the time the user asks for it; the class is what shows it.
    provide: (field) =>
        EditorView.editorAttributes.from(field, (visible) => ({ class: visible ? DOCS_OPEN_CLASS : "" })),
});

function toggleDocs(view: EditorView): void {
    view.dispatch({ effects: setDocsVisible.of(!view.state.field(docsVisible)) });
}

/**
 * The editor an element of a tooltip belongs to. Tooltips sit beside the content, outside what
 * `EditorView.findFromDOM` searches, so the lookup starts from the editor element.
 */
function viewOf(element: HTMLElement): EditorView | null {
    const editor = element.closest<HTMLElement>(".cm-editor");
    return editor ? EditorView.findFromDOM(editor) : null;
}

/**
 * The `?` on the selected row: it opens and closes the documentation. The row itself accepts the
 * completion on mousedown, so the event stops here.
 */
function renderDocsToggle(view: EditorView): HTMLElement {
    const button = document.createElement("button");
    button.type = "button";
    button.className = DOCS_TOGGLE_CLASS;
    button.setAttribute("aria-label", view.state.phrase("Documentation"));
    button.textContent = "?";
    button.addEventListener("mousedown", (event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleDocs(view);
    });
    return button;
}

function markdownOf(documentation: string | MarkupContent | undefined): string {
    const markdown = typeof documentation === "string" ? documentation : documentation?.value;
    return markdown ?? "";
}

/**
 * The documentation pane: the detail of the item (its identifier and description) in the header,
 * with a close button, and the resolved documentation below.
 */
function renderDocsPane(detail: string | undefined, markdown: string, phrase: Phrase): CompletionInfo {
    const pane = document.createElement("div");
    pane.className = DOCS_PANE_CLASS;
    // A click in the pane must not take the focus from the editor, which would close the list.
    pane.addEventListener("mousedown", (event) => event.preventDefault());

    const header = document.createElement("div");
    header.className = "header";
    const text = document.createElement("p");
    text.textContent = detail ?? "";
    header.appendChild(text);

    const close = document.createElement("button");
    close.type = "button";
    close.className = "close";
    close.textContent = "×";
    close.addEventListener("click", () => {
        viewOf(close)?.dispatch({ effects: setDocsVisible.of(false) });
    });
    close.setAttribute("aria-label", phrase("Close"));
    header.appendChild(close);
    pane.appendChild(header);

    const rendered = markdown ? renderMarkdown(markdown, DOCS_CLASS) : null;
    if (rendered) {
        pane.appendChild(rendered.dom);
    }

    return { dom: pane, destroy: () => rendered?.destroy() };
}

async function resolveInfo(
    item: CompletionItem,
    languageService: MaqlLanguageService,
    phrase: Phrase,
): Promise<CompletionInfo> {
    const resolved = await languageService.doCompletionResolve(item);
    const markdown = markdownOf(resolved.documentation);

    return item.detail || markdown ? renderDocsPane(item.detail, markdown, phrase) : null;
}

/**
 * Suggestions from the language service, filtered by the editor as the user types, with their
 * documentation resolved when an item is selected and shown on demand.
 */
export function maqlCompletion({
    languageService,
    triggerCharacters,
    onList,
    onDocsToggle,
}: IMaqlCompletionOptions): Extension {
    let pendingRequests = 0;

    const endsWithTrigger = (typed: string) =>
        typed.length > 0 && triggerCharacters.includes(typed.slice(-1));

    const source = async (context: CompletionContext): Promise<CompletionResult | null> => {
        // Nothing to suggest where nothing can be written, the way Monaco behaved.
        if (context.state.readOnly) {
            return null;
        }
        const word = context.matchBefore(WORD);
        const charBefore = context.state.sliceDoc(Math.max(context.pos - 1, 0), context.pos);
        const typing = word !== null && word.from < word.to;
        if (!context.explicit && !typing && !triggerCharacters.includes(charBefore)) {
            return null;
        }

        const document = createDocument(context.state, LANGUAGE);
        const position = offsetToPosition(context.state.doc, context.pos);

        onList({ isIncomplete: false, items: [] });
        pendingRequests += 1;
        try {
            const list = await languageService.doCompletion(document, position);
            if (pendingRequests === 1) {
                onList(list);
            }

            // The list is filtered here rather than by CodeMirror, whose matcher takes any
            // character order and, for a single character, only the first one of the label.
            const build = (typed: string, from: number): CompletionResult => ({
                from,
                options: filterItems(list.items, typed, languageService, (text) =>
                    context.state.phrase(text),
                ),
                filter: false,
                getMatch: (completion) => (completion as IMaqlCompletion).matched,
                // Typing on refilters the same answer. A trigger character changes what the
                // language service would offer, and a truncated list has to be asked for again,
                // or the objects beyond the first page never show up.
                update: (_current, nextFrom, _to, nextContext) => {
                    const nextTyped = nextContext.state.sliceDoc(nextFrom, nextContext.pos);
                    if (list.isIncomplete || endsWithTrigger(nextTyped)) {
                        return null;
                    }
                    return build(nextTyped, nextFrom);
                },
            });

            return build(word?.text ?? "", word?.from ?? context.pos);
        } finally {
            pendingRequests -= 1;
        }
    };

    const listener = EditorView.updateListener.of((update) => {
        const was = completionStatus(update.startState);
        const is = completionStatus(update.state);
        if (was !== null && is === null) {
            onList(null);
        }

        // The field is missing from the start state of the transaction that adds this extension.
        const docsWere = update.startState.field(docsVisible, false) ?? false;
        const docsAre = update.state.field(docsVisible);
        if (docsWere !== docsAre) {
            onDocsToggle?.(update.view, docsAre);
        }
    });

    return [
        docsVisible,
        autocompletion({
            override: [source],
            activateOnTyping: true,
            // Monaco accepted a suggestion the moment the list opened; the editor would otherwise
            // let Enter and Tab through for the first 75 ms.
            interactionDelay: 0,
            icons: true,
            tooltipClass: () => SUGGEST_CLASS,
            addToOptions: [
                { render: (completion) => renderTypeLabel(completion as IMaqlCompletion), position: 60 },
                { render: (_completion, _state, view) => renderDocsToggle(view), position: 90 },
            ],
        }),
        // Above the standard bindings: Mod-i selects the enclosing syntax there, and Tab indents.
        // While an input method composes text, Tab is left to the base binding, which ignores it.
        Prec.high(
            keymap.of([
                { key: "Mod-i", run: startCompletion },
                { key: "Tab", run: (view) => (view.compositionStarted ? false : acceptCompletion(view)) },
            ]),
        ),
        listener,
    ];
}
