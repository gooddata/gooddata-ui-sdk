// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { convertText } from "./configEditorLanguage.js";
import { getWarningDiagnostics } from "./configEditorWarnings.js";

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
    return getWarningDiagnostics(text, [{ path, part, message: "Check this" }]).map(
        ({ from, to, severity }) => ({
            text: text.slice(from, to),
            severity,
        }),
    );
}

describe("getWarningDiagnostics", () => {
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

    it("marks nothing for a path the text does not hold, or for text that does not parse", () => {
        expect(marked(json, ["content", "pages", 5, "style"])).toEqual([]);
        expect(marked('{ "content": ', ["content"])).toEqual([]);
    });
});
