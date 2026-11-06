// (C) 2026 GoodData Corporation

import { type Completion, CompletionContext } from "@codemirror/autocomplete";
import { EditorState, type Transaction } from "@codemirror/state";
import { describe, expect, it } from "vitest";

import { createFlatKeyCompletions } from "./keyCompletions.js";

const complete = createFlatKeyCompletions(["type", "title", "maql"]);

function completeAt(docWithCursor: string) {
    const pos = docWithCursor.indexOf("|");
    const doc = docWithCursor.replace("|", "");
    return complete(new CompletionContext(EditorState.create({ doc }), pos, true));
}

type ApplyView = { state: EditorState; dispatch: (transaction: Transaction) => void };
type Apply = (view: ApplyView, completion: Completion, from: number, to: number) => void;

function applyAt(docWithCursor: string, label: string) {
    const pos = docWithCursor.indexOf("|");
    const doc = docWithCursor.replace("|", "");
    const result = completeAt(docWithCursor);
    const option = result?.options.find((candidate) => candidate.label === label);
    if (!result || !option || typeof option.apply !== "function") {
        throw new Error(`expected an applicable "${label}" completion`);
    }
    const view: ApplyView = {
        state: EditorState.create({ doc, selection: { anchor: pos } }),
        dispatch(transaction) {
            view.state = transaction.state;
        },
    };
    (option.apply as Apply)(view, option, result.from, pos);
    return { doc: view.state.doc.toString(), cursor: view.state.selection.main.head };
}

describe("createFlatKeyCompletions", () => {
    it("offers the keys at column zero", () => {
        expect(completeAt("|")?.options.map((option) => option.label)).toEqual(["type", "title", "maql"]);
    });

    it("anchors completion at the start of a partially typed key", () => {
        expect(completeAt("ma|")?.from).toBe(0);
    });

    it("omits the keys the document already has", () => {
        expect(completeAt("type: metric\ntitle: Revenue\n|")?.options.map((option) => option.label)).toEqual([
            "maql",
        ]);
    });

    it("still offers the key of the line being edited", () => {
        expect(completeAt("ty|pe: metric")?.options.map((option) => option.label)).toContain("type");
    });

    it("declines on an indented line inside a sequence value", () => {
        expect(completeAt("tags:\n  |")).toBeNull();
    });

    it("inserts the key and a colon", () => {
        expect(applyAt("ma|", "maql")).toEqual({ doc: "maql: ", cursor: "maql: ".length });
    });

    it.each([
        ["inside the key", "ma|ql: SELECT 1"],
        ["before the colon", "maql|: SELECT 1"],
    ])("replaces only the name of an existing key %s", (_, docWithCursor) => {
        expect(applyAt(docWithCursor, "maql")).toEqual({ doc: "maql: SELECT 1", cursor: "maql".length });
    });

    it("preserves the colon and whitespace before an existing value", () =>
        expect(applyAt("ma|:   SELECT 1", "maql")).toEqual({
            doc: "maql:   SELECT 1",
            cursor: "maql".length,
        }));

    it("replaces the rest of a key without a colon and inserts its value separator", () =>
        expect(applyAt("ma|ql", "maql")).toEqual({ doc: "maql: ", cursor: "maql: ".length }));

    it("keeps the completed range at the caret so the popup filters by the typed prefix", () => {
        expect(completeAt("ma|ql: SELECT 1")?.to).toBeUndefined();
    });
});
