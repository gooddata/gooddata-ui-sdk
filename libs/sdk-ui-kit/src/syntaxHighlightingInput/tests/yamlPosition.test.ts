// (C) 2026 GoodData Corporation

import { yaml } from "@codemirror/lang-yaml";
import { EditorState } from "@codemirror/state";
import { describe, expect, it } from "vitest";

import { yamlPositionAt } from "../yamlPosition.js";

// `‸` marks the position; `|` would collide with YAML's block-scalar indicator.
const CURSOR = "‸";

function positionAt(docWithCursor: string) {
    const pos = docWithCursor.indexOf(CURSOR);
    const state = EditorState.create({
        doc: docWithCursor.replace(CURSOR, ""),
        extensions: [yaml()],
    });
    return yamlPositionAt(state, pos);
}

const keysAt = (docWithCursor: string) => positionAt(docWithCursor).ancestorKeys;

describe("yamlPositionAt ancestor keys", () => {
    it("reports no ancestors at the document root", () => {
        expect(keysAt(`ty${CURSOR}`)).toEqual([]);
    });

    it("names the key whose value the position sits in", () => {
        expect(keysAt(`type: col${CURSOR}`)).toEqual(["type"]);
    });

    it("orders nested mapping keys outermost first", () => {
        expect(keysAt(`query:\n  fields:\n    revenue:\n      usi${CURSOR}`)).toEqual([
            "query",
            "fields",
            "revenue",
        ]);
    });

    it("sees through a sequence item to the key holding the sequence", () => {
        expect(keysAt(`layers:\n  - type: pus${CURSOR}`)).toEqual(["layers", "type"]);
    });

    it("excludes the key currently being typed", () => {
        expect(keysAt(`query:\n  fie${CURSOR}`)).toEqual(["query"]);
    });
});

describe("yamlPositionAt on keys an indentation scan misreads", () => {
    it("resolves a key containing a dash", () => {
        expect(keysAt(`some-key:\n  nested:\n    chi${CURSOR}`)).toEqual(["some-key", "nested"]);
    });

    it("resolves a quoted key without its quotes", () => {
        expect(keysAt(`"quoted key":\n  nested:\n    chi${CURSOR}`)).toEqual(["quoted key", "nested"]);
    });
});

describe("yamlPositionAt inside block scalars", () => {
    it("flags literal block-scalar content rather than reading it as mapping structure", () => {
        const position = positionAt(`description: |\n  not_a_key: x\n  more${CURSOR}`);

        expect(position.isInBlockScalar).toBe(true);
        expect(position.ancestorKeys).toEqual(["description"]);
    });

    it("flags folded block-scalar content", () => {
        expect(positionAt(`summary: >\n  fake: y\n  tex${CURSOR}`).isInBlockScalar).toBe(true);
    });

    it("leaves the flag clear once the block scalar has ended", () => {
        const position = positionAt(`description: |\n  not_a_key: x\nty${CURSOR}`);

        expect(position.isInBlockScalar).toBe(false);
        expect(position.ancestorKeys).toEqual([]);
    });
});

describe("yamlPositionAt where the tree has no node to anchor to", () => {
    it("falls back to indentation on a blank indented line", () => {
        expect(keysAt(`query:\n  fields:\n    revenue:\n      ${CURSOR}`)).toEqual([
            "query",
            "fields",
            "revenue",
        ]);
    });

    it("omits a key whose value is not written yet, since no pair exists to be an ancestor", () => {
        // Consumers read this to tell a written value from an unwritten one, so it is a contract, not a
        // detail of the grammar.
        expect(keysAt(`query:\n  filter_by:\n    f1:\n      using: ${CURSOR}`)).toEqual([
            "query",
            "filter_by",
            "f1",
        ]);
    });

    it("reports no ancestors on a blank line at column zero", () => {
        expect(keysAt(`query:\n  fields: x\n${CURSOR}`)).toEqual([]);
    });

    it("treats a key on a sequence-item line as a sibling, not an ancestor", () => {
        expect(keysAt(`layers:\n  - type: pushpin\n    ${CURSOR}`)).toEqual(["layers"]);
    });

    it("keeps a sequence item's key out of the ancestors of a position level with it", () => {
        expect(keysAt(`query:\n  metrics:\n    - foo: 1\n      ${CURSOR}`)).toEqual(["query", "metrics"]);
    });

    it("keeps the innermost mapping on a blank line followed by a shallower sibling", () => {
        // The parse places this in the outer mapping; the indentation continues the inner block.
        expect(
            keysAt(`query:\n  fields:\n    revenue:\n      aggregation: SUM\n      ${CURSOR}\n    other: 1`),
        ).toEqual(["query", "fields", "revenue"]);
    });

    it("ignores every marker of a nested sequence when reading depth", () => {
        expect(keysAt(`outer:\n  - - foo: 1\n      ${CURSOR}`)).toEqual(["outer"]);
    });
});
