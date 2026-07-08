// (C) 2026 GoodData Corporation

import { CompletionContext } from "@codemirror/autocomplete";
import { EditorState } from "@codemirror/state";
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

        expect(labelsOf(result)).toEqual(["minLength", "maxLength"]);
    });

    it("offers all enabled constraint keys when no type is declared", () => {
        const result = completeAt(`definition:
  constraints:
    |`);

        expect(labelsOf(result)).toEqual(["min", "max", "minLength", "maxLength"]);
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

    it("skips blank and comment lines when resolving the parent key", () => {
        const result = completeAt(`definition:
  type: NUMBER
  constraints:

    # lower bound
    |`);

        expect(labelsOf(result)).toEqual(["min", "max"]);
    });
});
