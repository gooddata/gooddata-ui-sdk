// (C) 2026 GoodData Corporation

import { completionStatus, startCompletion } from "@codemirror/autocomplete";
import { Compartment, EditorState } from "@codemirror/state";
import { EditorView, runScopeHandlers } from "@codemirror/view";
import { waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { type CompletionItem, CompletionItemKind, InsertTextFormat } from "vscode-languageserver-types";

import { type MaqlLanguageService } from "@gooddata/sdk-maql-language-server";

import { baseExtensions } from "../../codemirror/baseExtensions.js";
import { DOCS_OPEN_CLASS, TYPE_LABEL_CLASS } from "../../codemirror/CodeEditor.styles.js";
import { shimMaqlEditor } from "../../mock/editor-shim.js";

import {
    completionSpan,
    completionType,
    expandSnippet,
    filterItems,
    fuzzyMatch,
    maqlCompletion,
    matchInDisplayLabel,
    setDocsVisible,
} from "./completion.js";

shimMaqlEditor();

const languageService = {
    doCompletion: async () => ({ isIncomplete: false, items: [] }),
    doCompletionResolve: async (item: unknown) => item,
} as unknown as MaqlLanguageService;

describe("completionType", () => {
    it("maps the language service kinds to the editor icons", () => {
        expect(completionType(CompletionItemKind.Field)).toBe("fact");
        expect(completionType(CompletionItemKind.Variable)).toBe("metric");
        expect(completionType(CompletionItemKind.Constant)).toBe("dataset");
        expect(completionType(CompletionItemKind.Text)).toBe("label");
        expect(completionType(CompletionItemKind.Enum)).toBe("attribute");
        expect(completionType(CompletionItemKind.EnumMember)).toBe("attribute");
        expect(completionType(CompletionItemKind.Keyword)).toBe("keyword");
        expect(completionType(CompletionItemKind.Function)).toBe("function");
        expect(completionType(CompletionItemKind.Operator)).toBe("operator");
        expect(completionType(CompletionItemKind.Value)).toBe("value");
        expect(completionType(CompletionItemKind.Snippet)).toBe("snippet");
        expect(completionType(undefined)).toBe("text");
    });
});

describe("expandSnippet", () => {
    it("drops the tab stops and puts the cursor at the first one", () => {
        expect(expandSnippet("SUM ( $1 )$0")).toEqual({ text: "SUM (  )", from: 6, to: 6 });
        expect(expandSnippet("IF $2 THEN $1 ELSE $3 END")).toEqual({
            text: "IF  THEN  ELSE  END",
            from: 9,
            to: 9,
        });
    });

    it("keeps a placeholder's text and selects it", () => {
        expect(expandSnippet("BY ${1:attribute} ALL OTHER $0")).toEqual({
            text: "BY attribute ALL OTHER ",
            from: 3,
            to: 12,
        });
    });

    it("falls back to the final cursor, then to the end", () => {
        expect(expandSnippet("ALL OTHER$0 END")).toEqual({ text: "ALL OTHER END", from: 9, to: 9 });
        expect(expandSnippet("ALL OTHER")).toEqual({ text: "ALL OTHER", from: 9, to: 9 });
    });
});

describe("completionSpan", () => {
    it("replaces the word the editor is completing when the item has no edit", () => {
        expect(completionSpan(undefined, 7, 10)).toEqual({ from: 7, to: 10 });
    });

    it("takes in the characters typed after the language service answered", () => {
        // "S" was typed when the list was requested; "EL" came while it stayed open.
        expect(completionSpan({ from: 0, to: 1 }, 0, 3)).toEqual({ from: 0, to: 3 });
    });

    it("keeps an edit that reaches beyond the word", () => {
        expect(completionSpan({ from: 5, to: 12 }, 6, 8)).toEqual({ from: 5, to: 12 });
    });
});

describe("fuzzyMatch", () => {
    it("matches everything when nothing is typed", () => {
        expect(fuzzyMatch("", "SELECT")).toEqual({ positions: [], score: 0 });
    });

    it("finds a run of the typed text at the start of a word, whatever the case", () => {
        expect(fuzzyMatch("sel", "SELECT")).toEqual({ positions: [0, 3], score: 3 });
        expect(fuzzyMatch("me", "{ metric / amount } Amount")).toEqual({ positions: [2, 4], score: 3 });
        expect(fuzzyMatch("+", "+")).toEqual({ positions: [0, 1], score: 3 });
    });

    it("requires the first typed character to start a word", () => {
        // "me" sits inside "timeline", so the dataset is not offered for it
        expect(fuzzyMatch("me", "{ dataset / f_timeline } Timeline")).toBeNull();
        expect(fuzzyMatch("1", "{ metric / 6b1411d5 } Timeline")).toBeNull();
        expect(fuzzyMatch("1", "{ metric / c5ee-126c } Snapshot")).toEqual({ positions: [16, 17], score: 3 });
        // the brace is punctuation; the rule applies to the letter after it
        expect(fuzzyMatch("{me", "{ dataset / f_timeline } Timeline")).toBeNull();
        expect(fuzzyMatch("{me", "{ metric / amount } Amount")).toEqual({
            positions: [0, 1, 2, 4],
            score: 1,
        });
    });

    it("takes the typed characters in order when they are not a run", () => {
        expect(fuzzyMatch("abop", "{ metric / amount_bop } Amount [BOP]")).toEqual({
            positions: [11, 12, 18, 21],
            score: 1,
        });
    });

    it("gives nothing for characters that are not there", () => {
        expect(fuzzyMatch("xyz", "SELECT")).toBeNull();
    });
});

describe("matchInDisplayLabel", () => {
    const label = "{ fact / f_density } Density";

    it("highlights the typed run in the label, whatever the case", () => {
        // "densit" matched in the identifier of the filter text
        expect(matchInDisplayLabel(label, "Density", [11, 17])).toEqual([0, 6]);
    });

    it("falls back to the typed characters in order", () => {
        expect(
            matchInDisplayLabel("{ metric / amount_bop } Amount [BOP]", "Amount [BOP]", [11, 12, 18, 19]),
        ).toEqual([0, 1, 8, 9]);
    });

    it("highlights nothing without typed text or without a match", () => {
        expect(matchInDisplayLabel(label, "Density", [])).toEqual([]);
        expect(matchInDisplayLabel(label, "Density", [2, 6])).toEqual([]);
    });
});

describe("filterItems", () => {
    const items: CompletionItem[] = [
        { label: "NOT", kind: CompletionItemKind.Keyword, sortText: "41__NOT" },
        {
            label: "Timeline",
            filterText: "{ dataset / f_timeline } Timeline",
            kind: CompletionItemKind.Constant,
            sortText: "21__f_timeline",
        },
        {
            label: "Amount",
            filterText: "{ metric / amount } Amount",
            kind: CompletionItemKind.Variable,
            sortText: "25__amount",
        },
        {
            label: "Avg. Amount",
            filterText: "{ metric / avg._amount } Avg. Amount",
            kind: CompletionItemKind.Variable,
            sortText: "25__avg._amount",
        },
    ];

    it("keeps the language service's order when nothing is typed", () => {
        expect(filterItems(items, "", languageService).map((c) => c.displayLabel)).toEqual([
            "Timeline",
            "Amount",
            "Avg. Amount",
            "NOT",
        ]);
    });

    it("orders the overloads of a function by their labels, the way Monaco did", () => {
        const overloads: CompletionItem[] = [
            {
                label: "APPROXIMATE_COUNT(DATE) -> NUMERIC",
                kind: CompletionItemKind.Function,
                sortText: "01__APPROXIMATE_COUNT",
            },
            {
                label: "APPROXIMATE_COUNT(DATASET) -> NUMERIC",
                kind: CompletionItemKind.Function,
                sortText: "01__APPROXIMATE_COUNT",
            },
        ];

        expect(filterItems(overloads, "", languageService).map((c) => c.displayLabel)).toEqual([
            "APPROXIMATE_COUNT(DATASET) -> NUMERIC",
            "APPROXIMATE_COUNT(DATE) -> NUMERIC",
        ]);
    });

    it("offers the objects of the typed type and nothing else", () => {
        expect(filterItems(items, "{me", languageService).map((c) => c.displayLabel)).toEqual([
            "Amount",
            "Avg. Amount",
        ]);
    });

    it("puts the better match first and highlights it in the label", () => {
        const filtered = filterItems(items, "am", languageService);

        expect(filtered.map((c) => c.displayLabel)).toEqual(["Amount", "Avg. Amount"]);
        expect(filtered.map((c) => c.matched)).toEqual([
            [0, 2],
            [5, 7],
        ]);
    });
});

describe("maqlCompletion", () => {
    function createView({
        readOnly = false,
        onDocsToggle,
    }: { readOnly?: boolean; onDocsToggle?: (view: EditorView, visible: boolean) => void } = {}): EditorView {
        const parent = document.createElement("div");
        document.body.appendChild(parent);

        return new EditorView({
            state: EditorState.create({
                doc: "SELECT",
                extensions: [
                    EditorState.readOnly.of(readOnly),
                    maqlCompletion({
                        languageService,
                        triggerCharacters: [],
                        onList: () => undefined,
                        onDocsToggle,
                    }),
                ],
            }),
            parent,
        });
    }

    it("marks the editor while the documentation is shown", () => {
        const view = createView();
        expect(view.dom.classList.contains(DOCS_OPEN_CLASS)).toBe(false);

        view.dispatch({ effects: setDocsVisible.of(true) });
        expect(view.dom.classList.contains(DOCS_OPEN_CLASS)).toBe(true);

        view.dispatch({ effects: setDocsVisible.of(false) });
        expect(view.dom.classList.contains(DOCS_OPEN_CLASS)).toBe(false);

        view.destroy();
    });

    it("reports when the documentation is shown or hidden", () => {
        const toggles: boolean[] = [];
        const view = createView({ onDocsToggle: (_view, visible) => toggles.push(visible) });

        view.dispatch({ effects: setDocsVisible.of(true) });
        view.dispatch({ effects: setDocsVisible.of(true) });
        view.dispatch({ effects: setDocsVisible.of(false) });
        expect(toggles).toEqual([true, false]);

        view.destroy();
    });

    it("does not apply a completion in a read-only editor", () => {
        const view = createView({ readOnly: true });
        const keyword: CompletionItem = { label: "SELECT", kind: CompletionItemKind.Keyword };
        const [completion] = filterItems([keyword], "SEL", languageService);

        (completion.apply as (view: EditorView, completion: unknown, from: number, to: number) => void)(
            view,
            completion,
            0,
            3,
        );
        expect(view.state.doc.toString()).toBe("SELECT");

        view.destroy();
    });
});

describe("maqlCompletion rows", () => {
    const parameter: CompletionItem = {
        label: "QA E2E Str Free",
        kind: CompletionItemKind.Variable,
        labelDetails: { description: "string" },
    };

    it("carries the type of the object to show after the label", () => {
        const [completion] = filterItems([parameter], "", languageService);

        expect(completion.typeLabel).toBe("string");
    });

    it("shows the type of the object in its row", async () => {
        const parent = document.createElement("div");
        document.body.appendChild(parent);
        const view = new EditorView({
            state: EditorState.create({
                doc: "",
                extensions: maqlCompletion({
                    languageService: {
                        doCompletion: async () => ({ isIncomplete: false, items: [parameter] }),
                        doCompletionResolve: async (item: unknown) => item,
                    } as unknown as MaqlLanguageService,
                    triggerCharacters: [],
                    onList: () => undefined,
                }),
            }),
            parent,
        });

        startCompletion(view);
        await new Promise((resolve) => setTimeout(resolve, 100));

        const typeLabel = view.dom.querySelector(`.${TYPE_LABEL_CLASS}`);
        expect(typeLabel?.textContent).toBe("string");
        expect(typeLabel?.previousElementSibling?.className).toContain("cm-completionLabel");

        view.destroy();
    });

    it("survives the transaction that adds it to a running editor", () => {
        const errors: unknown[] = [];
        const compartment = new Compartment();
        const view = new EditorView({
            state: EditorState.create({
                doc: "SELECT",
                extensions: [EditorView.exceptionSink.of((error) => errors.push(error)), compartment.of([])],
            }),
            parent: document.body,
        });

        view.dispatch({
            effects: compartment.reconfigure(
                maqlCompletion({ languageService, triggerCharacters: [], onList: () => undefined }),
            ),
        });
        view.dispatch({ changes: { from: 6, insert: " 1" } });

        expect(errors).toEqual([]);

        view.destroy();
    });
});

describe("maqlCompletion phrases", () => {
    it("labels the documentation controls with the phrases of the editor", async () => {
        const parent = document.createElement("div");
        document.body.appendChild(parent);
        const item: CompletionItem = {
            label: "SUM",
            kind: CompletionItemKind.Function,
            detail: "SUM(x)",
            documentation: "Sums the values.",
        };
        const view = new EditorView({
            state: EditorState.create({
                doc: "",
                extensions: [
                    EditorState.phrases.of({ Documentation: "Dokumentace", Close: "Zavřít" }),
                    maqlCompletion({
                        languageService: {
                            doCompletion: async () => ({ isIncomplete: false, items: [item] }),
                            doCompletionResolve: async (resolved: unknown) => resolved,
                        } as unknown as MaqlLanguageService,
                        triggerCharacters: [],
                        onList: () => undefined,
                    }),
                ],
            }),
            parent,
        });

        startCompletion(view);
        await new Promise((resolve) => setTimeout(resolve, 150));

        expect(view.dom.querySelector(".maql-docs-toggle")?.getAttribute("aria-label")).toBe("Dokumentace");
        expect(view.dom.querySelector(".cm-completionInfo button.close")?.getAttribute("aria-label")).toBe(
            "Zavřít",
        );

        view.destroy();
    });
});

describe("Tab with suggestions and inserted functions", () => {
    const sumFunction: CompletionItem = {
        label: "SUM",
        kind: CompletionItemKind.Function,
        insertText: "SUM ( $1 )$0",
        insertTextFormat: InsertTextFormat.Snippet,
    };
    const suggestingService = {
        doCompletion: async () => ({ isIncomplete: false, items: [sumFunction] }),
        doCompletionResolve: async (item: unknown) => item,
    } as unknown as MaqlLanguageService;

    // the editor's real key handling: the shared bindings and the completion's own
    function createEditor(doc: string): EditorView {
        const parent = document.createElement("div");
        document.body.appendChild(parent);

        return new EditorView({
            state: EditorState.create({
                doc,
                selection: { anchor: doc.length },
                extensions: [
                    baseExtensions(),
                    maqlCompletion({
                        languageService: suggestingService,
                        triggerCharacters: [],
                        onList: () => undefined,
                    }),
                ],
            }),
            parent,
        });
    }

    // false: the editor leaves the key alone, so the browser (or the dialog's focus trap) moves the
    // focus on, which baseExtensions.focus.test.tsx covers
    const press = (view: EditorView, key: string, shiftKey = false) =>
        runScopeHandlers(view, new KeyboardEvent("keydown", { key, shiftKey }), "editor");

    async function openSuggestions(view: EditorView) {
        startCompletion(view);
        await waitFor(() => expect(completionStatus(view.state)).toBe("active"));
    }

    it("leaves Tab and Shift+Tab to the focus right after a function went in", () => {
        const view = createEditor("SUM");
        const [completion] = filterItems([sumFunction], "SUM", suggestingService);

        (completion.apply as (view: EditorView, completion: unknown, from: number, to: number) => void)(
            view,
            completion,
            0,
            3,
        );
        expect(view.state.doc.toString()).toBe("SUM (  )");
        // the cursor is inside the parentheses, with no snippet fields to step through
        expect(view.state.selection.main.head).toBe(6);

        expect(press(view, "Tab")).toBe(false);
        expect(press(view, "Tab", true)).toBe(false);
        expect(view.state.doc.toString()).toBe("SUM (  )");

        view.destroy();
    });

    it("leaves Tab and Shift+Tab to the focus while the list is open, without accepting", async () => {
        const view = createEditor("SU");
        await openSuggestions(view);

        expect(press(view, "Tab")).toBe(false);
        expect(press(view, "Tab", true)).toBe(false);
        expect(view.state.doc.toString()).toBe("SU");

        view.destroy();
    });

    it("accepts the highlighted suggestion with Enter", async () => {
        const view = createEditor("SU");
        await openSuggestions(view);

        expect(press(view, "Enter")).toBe(true);
        expect(view.state.doc.toString()).toBe("SUM (  )");

        view.destroy();
    });

    it("closes the list with Escape, keeping the text", async () => {
        const view = createEditor("SU");
        await openSuggestions(view);

        expect(press(view, "Escape")).toBe(true);
        expect(completionStatus(view.state)).toBeNull();
        expect(view.state.doc.toString()).toBe("SU");

        view.destroy();
    });
});
