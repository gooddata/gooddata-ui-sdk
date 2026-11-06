// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { getPathDiagnostics } from "./configEditorDiagnostics.js";
import { convertText } from "./configEditorLanguage.js";

const json = JSON.stringify(
    {
        content: {
            pages: [
                { id: "cover", layout: { type: "text", id: "intro", markdown: "Hello {notAVariable}" } },
                { id: "charts", style: { background_color: "{theme.colors.backgrounds.nope}" } },
            ],
        },
    },
    null,
    4,
);
const yaml = convertText(json, "json", "yaml");

function marked(text: string, path: Array<string | number>, part?: string) {
    return getPathDiagnostics(text, [{ path, part, severity: "warning", message: "Check this" }]).map(
        ({ from, to, severity }) => ({
            text: text.slice(from, to),
            severity,
        }),
    );
}

function markedKey(text: string, path: Array<string | number>) {
    return getPathDiagnostics(text, [{ path, target: "key", severity: "error", message: "Unknown key" }]).map(
        ({ from, to }) => text.slice(from, to),
    );
}

describe("getPathDiagnostics", () => {
    it.each([
        ["JSON", json],
        ["YAML", yaml],
    ])("marks the value a path names, through an array index, in %s", (_, text) => {
        expect(marked(text, ["content", "pages", 1, "style", "background_color"])).toEqual([
            { text: expect.stringContaining("{theme.colors.backgrounds.nope}"), severity: "warning" },
        ]);
        expect(marked(text, ["content", "pages", 0, "layout", "markdown"])[0]?.text).toContain(
            "Hello {notAVariable}",
        );
    });

    it.each([
        ["JSON", json],
        ["YAML", yaml],
    ])("marks only the part of the value the warning names, in %s", (_, text) => {
        expect(marked(text, ["content", "pages", 0, "layout", "markdown"], "{notAVariable}")).toEqual([
            { text: "{notAVariable}", severity: "warning" },
        ]);
    });

    it.each([
        ["JSON", JSON.stringify({ markdown: "{x} and {x}" }, null, 4)],
        ["YAML", convertText(JSON.stringify({ markdown: "{x} and {x}" }), "json", "yaml")],
    ])("marks each place the value holds the part, in %s", (_, text) => {
        expect(marked(text, ["markdown"], "{x}")).toEqual([
            { text: "{x}", severity: "warning" },
            { text: "{x}", severity: "warning" },
        ]);
    });

    it("marks the whole value for an empty part", () => {
        expect(marked(json, ["content", "pages", 0, "layout", "markdown"], "")).toEqual([
            { text: '"Hello {notAVariable}"', severity: "warning" },
        ]);
    });

    it("marks the whole value when it does not hold the part", () => {
        expect(marked(json, ["content", "pages", 0, "layout", "markdown"], "{other}")[0]?.text).toBe(
            '"Hello {notAVariable}"',
        );
    });

    it("marks a value in JSON in which another key repeats", () => {
        expect(marked('{ "title": "Q3", "title": "Q4", "color": "{x}" }', ["color"])).toEqual([
            { text: '"{x}"', severity: "warning" },
        ]);
    });

    it.each([
        ["in the middle", "title: Q3\nmaql: \nid: m1\n"],
        ["at the end", "title: Q3\nmaql: "],
    ])("marks the key of a blank value %s", (_, text) => {
        expect(marked(text, ["maql"])).toEqual([{ text: "maql", severity: "warning" }]);
    });

    it("marks the sequence key for a blank list item", () => {
        expect(marked("title: Q3\ntags:\n  -\n", ["tags", 0])).toEqual([
            { text: "tags", severity: "warning" },
        ]);
    });

    it.each([
        ["a key with a value", "foo: bar\n", ["foo"]],
        ["a key with an empty value", "title: Q3\nfoo:\n", ["foo"]],
        ["a nested key", "definition:\n  foo: 1\n", ["definition", "foo"]],
    ])("marks exactly the key for %s", (_, text, path) => {
        expect(markedKey(text, path)).toEqual(["foo"]);
    });

    it("marks no key for an array index", () => {
        expect(markedKey("tags:\n  - a\n", ["tags", 0])).toEqual([]);
    });

    it("marks nothing for a path the text does not hold, or for text that does not parse", () => {
        expect(marked(json, ["content", "pages", 5, "style"])).toEqual([]);
        expect(marked('{ "content": ', ["content"])).toEqual([]);
    });
});
