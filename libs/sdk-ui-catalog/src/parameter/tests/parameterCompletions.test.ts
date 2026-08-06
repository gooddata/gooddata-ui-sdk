// (C) 2026 GoodData Corporation

import { type Completion, CompletionContext } from "@codemirror/autocomplete";
import { EditorState, type Transaction } from "@codemirror/state";
import { describe, expect, it } from "vitest";

import type { ParameterType } from "@gooddata/sdk-model";

import { createParameterCompletions } from "../parameterCompletions.js";

const NUMBER_ONLY: ParameterType[] = ["NUMBER"];
const ALL_TYPES: ParameterType[] = ["NUMBER", "STRING"];

function completeAt(docWithCursor: string, enabledTypes = ALL_TYPES) {
    const pos = docWithCursor.indexOf("|");
    const doc = docWithCursor.replace("|", "");
    const state = EditorState.create({ doc });
    return createParameterCompletions(enabledTypes)(new CompletionContext(state, pos, false));
}

function labelsOf(result: ReturnType<typeof completeAt>) {
    return result?.options.map((option) => option.label);
}

type ApplyView = { state: EditorState; dispatch: (transaction: Transaction) => void };
type SnippetApply = (view: ApplyView, completion: Completion, from: number, to: number) => void;

function applyCompletion(option: Completion, doc: string, from: number, to: number) {
    const { apply } = option;
    if (typeof apply !== "function") {
        throw new Error("expected a snippet apply function");
    }
    const view: ApplyView = {
        state: EditorState.create({ doc, selection: { anchor: from } }),
        dispatch(transaction) {
            view.state = transaction.state;
        },
    };
    (apply as SnippetApply)(view, option, from, to);
    return { doc: view.state.doc.toString(), cursor: view.state.selection.main.head };
}

describe("createParameterCompletions", () => {
    it("offers constraint keys on a blank indented line under constraints", () => {
        const result = completeAt(`definition:
  type: NUMBER
  defaultValue: 10
  constraints:
    min: 0
    |`);

        expect(labelsOf(result)).toEqual(["min", "max"]);
    });

    it("offers constraint keys on a fresh line under constraints with no siblings", () => {
        const result = completeAt(`definition:
  type: NUMBER
  defaultValue: 10
  constraints:
    |`);

        expect(labelsOf(result)).toEqual(["min", "max"]);
    });

    it("offers definition keys on a blank line indented into definition", () => {
        const result = completeAt(`definition:
  type: NUMBER
  defaultValue: 10
  |`);

        expect(labelsOf(result)).toEqual(["type", "defaultValue", "constraints"]);
    });

    it("offers root keys at column zero", () => {
        const result = completeAt(`id: threshold
|definition:
  type: NUMBER
  defaultValue: 10`);

        expect(labelsOf(result)).toEqual(["type", "id", "title", "description", "tags", "definition"]);
    });

    it("completes a partially typed constraint key from the word start", () => {
        const doc = `definition:
  type: NUMBER
  defaultValue: 10
  constraints:
    mi|`;
        const result = completeAt(doc);

        expect(labelsOf(result)).toEqual(["min", "max"]);
        expect(result?.from).toBe(doc.indexOf("mi|"));
    });

    it("offers only STRING constraint keys when the buffer declares type STRING", () => {
        const result = completeAt(`definition:
  type: STRING
  defaultValue: Actual
  constraints:
    |`);

        expect(labelsOf(result)).toEqual(["minLength", "maxLength", "allowedValues"]);
    });

    it("offers all enabled constraint keys when no type is declared", () => {
        const result = completeAt(`definition:
  constraints:
    |`);

        expect(labelsOf(result)).toEqual(["min", "max", "minLength", "maxLength", "allowedValues"]);
    });

    it("never offers STRING constraint keys when only NUMBER is enabled", () => {
        const result = completeAt(
            `definition:
  constraints:
    |`,
            NUMBER_ONLY,
        );

        expect(labelsOf(result)).toEqual(["min", "max"]);
    });

    it("falls back to enabled types when the declared type is not enabled", () => {
        const result = completeAt(
            `definition:
  type: STRING
  constraints:
    |`,
            NUMBER_ONLY,
        );

        expect(labelsOf(result)).toEqual(["min", "max"]);
    });

    it("offers enabled types as values for the definition type key", () => {
        const result = completeAt(`definition:
  type: |`);

        expect(labelsOf(result)).toEqual(["NUMBER", "STRING"]);
    });

    it("offers only enabled types as values when a type is disabled", () => {
        const result = completeAt(
            `definition:
  type: |`,
            NUMBER_ONLY,
        );

        expect(labelsOf(result)).toEqual(["NUMBER"]);
    });

    it("completes a partially typed type value from the word start", () => {
        const doc = `definition:
  type: STR|`;
        const result = completeAt(doc);

        expect(labelsOf(result)).toEqual(["NUMBER", "STRING"]);
        expect(result?.from).toBe(doc.indexOf("STR|"));
    });

    it("offers the parameter literal as the top-level type value", () => {
        const result = completeAt(`type: |
definition:
  type: NUMBER`);

        expect(labelsOf(result)).toEqual(["parameter"]);
    });

    it("does not offer values for keys other than type", () => {
        const result = completeAt(`definition:
  type: NUMBER
  defaultValue: |`);

        expect(result).toBeNull();
    });

    it("does not offer type values immediately after the colon", () => {
        const result = completeAt(`definition:
  type:|`);

        expect(result).toBeNull();
    });

    it("does not complete after a key-value pair on the same line", () => {
        const result = completeAt(`definition:
  type: NUMBER
  defaultValue: 10|`);

        expect(result).toBeNull();
    });

    it("does not complete under keys without child keys", () => {
        const result = completeAt(`tags:
  |
definition:
  type: NUMBER
  defaultValue: 10`);

        expect(result).toBeNull();
    });

    it("does not complete under a list item", () => {
        const result = completeAt(`tags:
  - alerts
    |`);

        expect(result).toBeNull();
    });

    it("declines on an indented line with no less-indented ancestor", () => {
        // An orphaned indented line has no enclosing mapping, so it is not treated as top-level.
        const result = completeAt("  |");

        expect(result).toBeNull();
    });

    it("ignores an indented type: inside a description block scalar before definition", () => {
        // Folded scalar `>` (not `|`) so the block indicator does not collide with the `|` cursor marker.
        const result = completeAt(`description: >
  type: STRING
definition:
  type: NUMBER
  constraints:
    |`);

        expect(labelsOf(result)).toEqual(["min", "max"]);
    });

    it("reads definition.type past a column-zero comment inside the definition block", () => {
        // A root-column comment does not close the mapping, so the declared type below it still narrows.
        const result = completeAt(`definition:
# a number parameter
  type: NUMBER
  constraints:
    |`);

        expect(labelsOf(result)).toEqual(["min", "max"]);
    });

    it("skips blank and comment lines when resolving the parent key", () => {
        const result = completeAt(`definition:
  type: NUMBER
  constraints:

    # lower bound
    |`);

        expect(labelsOf(result)).toEqual(["min", "max"]);
    });

    it("offers allowedValues among STRING constraint keys", () => {
        const result = completeAt(`definition:
  type: STRING
  defaultValue: actual
  constraints:
    |`);

        expect(labelsOf(result)).toEqual(["minLength", "maxLength", "allowedValues"]);
    });

    it("offers cardinality among STRING definition keys", () => {
        const result = completeAt(`definition:
  type: STRING
  defaultValue: actual
  |`);

        expect(labelsOf(result)).toEqual(["type", "defaultValue", "constraints", "cardinality"]);
    });

    it("never offers cardinality when only NUMBER is enabled", () => {
        const result = completeAt(
            `definition:
  type: NUMBER
  defaultValue: 10
  |`,
            NUMBER_ONLY,
        );

        expect(labelsOf(result)).toEqual(["type", "defaultValue", "constraints"]);
    });

    it("offers entry keys on a fresh sequence item under allowedValues", () => {
        const result = completeAt(`definition:
  type: STRING
  defaultValue: actual
  constraints:
    allowedValues:
      - |`);

        expect(labelsOf(result)).toEqual(["value", "title"]);
    });

    it("completes a partially typed entry key on a sequence item", () => {
        const doc = `definition:
  type: STRING
  defaultValue: actual
  constraints:
    allowedValues:
      - va|`;
        const result = completeAt(doc);

        expect(labelsOf(result)).toEqual(["value", "title"]);
        expect(result?.from).toBe(doc.indexOf("va|"));
    });

    it("offers entry keys on a continuation line inside an allowedValues entry", () => {
        const result = completeAt(`definition:
  type: STRING
  defaultValue: actual
  constraints:
    allowedValues:
      - value: actual
        |`);

        expect(labelsOf(result)).toEqual(["value", "title"]);
    });

    it("offers entry keys after a bare sequence item marker under allowedValues", () => {
        const result = completeAt(`definition:
  type: STRING
  defaultValue: actual
  constraints:
    allowedValues:
      -
        |`);

        expect(labelsOf(result)).toEqual(["value", "title"]);
    });

    it("completes a partially typed key on a continuation line inside an entry", () => {
        const doc = `definition:
  type: STRING
  defaultValue: actual
  constraints:
    allowedValues:
      - value: actual
        ti|`;
        const result = completeAt(doc);

        expect(labelsOf(result)).toEqual(["value", "title"]);
        expect(result?.from).toBe(doc.indexOf("ti|"));
    });

    it("does not offer entry keys on a dash-less line directly under allowedValues", () => {
        const result = completeAt(`definition:
  type: STRING
  defaultValue: actual
  constraints:
    allowedValues:
      |`);

        expect(result).toBeNull();
    });

    it("does not offer keys after a dash at column zero", () => {
        const result = completeAt("- |");

        expect(result).toBeNull();
    });

    it("does not offer keys after a dash under a mapping key", () => {
        const result = completeAt(`definition:
  type: NUMBER
  defaultValue: 10
  constraints:
    - |`);

        expect(result).toBeNull();
    });

    it("inserts a first-entry snippet when applying the allowedValues completion", () => {
        const docWithCursor = `definition:
  type: STRING
  defaultValue: actual
  constraints:
    |`;
        const pos = docWithCursor.indexOf("|");
        const doc = docWithCursor.replace("|", "");
        const result = createParameterCompletions(ALL_TYPES)(
            new CompletionContext(EditorState.create({ doc }), pos, false),
        );
        const option = result?.options.find((candidate) => candidate.label === "allowedValues");
        expect(option).toBeDefined();

        const applied = applyCompletion(option!, doc, result!.from, pos);

        const expectedDoc =
            "definition:\n" +
            "  type: STRING\n" +
            "  defaultValue: actual\n" +
            "  constraints:\n" +
            "    allowedValues:\n" +
            "      - value: ";
        expect(applied.doc).toBe(expectedDoc);
        expect(applied.cursor).toBe(expectedDoc.length);
    });
});
