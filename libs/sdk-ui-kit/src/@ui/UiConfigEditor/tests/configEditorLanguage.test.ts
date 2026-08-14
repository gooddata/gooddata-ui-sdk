// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { beautify, convertText, isProjectable } from "../configEditorLanguage.js";

const CANONICAL_JSON = JSON.stringify({ a: { b: [1, 2] }, c: "x" }, null, 4);

describe("configEditorLanguage", () => {
    describe("convertText", () => {
        it("returns text unchanged when the display language is the primary one", () => {
            // The pass-through that makes a single-language editor unable to touch its value.
            expect(convertText('{"a":1}', "json", "json")).toBe('{"a":1}');
            expect(convertText("a: 1   # keep me\n", "yaml", "yaml")).toBe("a: 1   # keep me\n");
        });

        it("converts JSON text to YAML", () => {
            expect(convertText('{"a":{"b":1}}', "json", "yaml")).toBe("a:\n  b: 1\n");
        });

        it("converts YAML text to JSON", () => {
            expect(convertText("a:\n  b: 1\n", "yaml", "json")).toBe(
                JSON.stringify({ a: { b: 1 } }, null, 4),
            );
        });

        it("keeps an empty value empty rather than emitting a scalar for it", () => {
            expect(convertText("", "json", "yaml")).toBe("");
            expect(convertText("   ", "json", "yaml")).toBe("   ");
        });

        it("keeps a null value rather than blanking it", () => {
            expect(convertText("null", "json", "yaml")).toBe("null\n");
        });

        it("passes unparseable text through, so a language switch never discards it", () => {
            expect(convertText('{"a": ', "json", "yaml")).toBe('{"a": ');
        });

        it("keeps a comment-only YAML document rather than projecting it to nothing", () => {
            expect(convertText("# just a note\n", "yaml", "json")).toBe("# just a note\n");
        });

        it("does not fold long strings across lines", () => {
            const url = `https://example.com/${"a".repeat(120)}`;
            expect(convertText(JSON.stringify({ url }), "json", "yaml")).toBe(`url: ${url}\n`);
        });
    });

    describe("convertText", () => {
        it("returns text unchanged when the display language is the primary one", () => {
            expect(convertText('{"a":1}', "json", "json")).toBe('{"a":1}');
            expect(convertText("a: 1   # keep me\n", "yaml", "yaml")).toBe("a: 1   # keep me\n");
        });

        it("converts a YAML draft to canonical JSON", () => {
            expect(convertText("a:\n  b: 1\n", "yaml", "json")).toBe(
                JSON.stringify({ a: { b: 1 } }, null, 4),
            );
        });

        it("converts a JSON draft to canonical YAML", () => {
            expect(convertText('{"a":{"b":1}}', "json", "yaml")).toBe("a:\n  b: 1\n");
        });

        it("passes an unparseable draft through verbatim", () => {
            // This is what makes a host's existing validation report the problem: it receives the
            // broken text rather than a stale last-good value.
            const broken = "a:\n  - b\n c: bad indent";
            expect(convertText(broken, "yaml", "json")).toBe(broken);
        });

        it("passes a draft with duplicate keys through rather than silently keeping one of them", () => {
            const dupes = "a: 1\na: 2\n";
            expect(convertText(dupes, "yaml", "json")).toBe(dupes);
        });

        it("passes a multi-document draft through — the value is a single document", () => {
            const stream = "a: 1\n---\nb: 2\n";
            expect(convertText(stream, "yaml", "json")).toBe(stream);
        });

        it("keeps an empty draft empty", () => {
            expect(convertText("", "yaml", "json")).toBe("");
        });

        it("passes a comment-only YAML draft through rather than emitting an empty value", () => {
            // Emitting "" would let a later language switch rebuild the view from the empty value
            // and silently erase the comment the user still sees on screen.
            expect(convertText("# TODO\n", "yaml", "json")).toBe("# TODO\n");
        });
    });

    describe("beautify", () => {
        it("re-formats JSON with the canonical indent", () => {
            expect(beautify('{"a":{"b":1}}', "json")).toBe(JSON.stringify({ a: { b: 1 } }, null, 4));
        });

        it("normalizes YAML indentation", () => {
            expect(beautify("a:\n      b: 1\n", "yaml")).toBe("a:\n  b: 1\n");
        });

        it("keeps YAML comments and blank lines while re-formatting around them", () => {
            // The property that makes the action safe on a hand-annotated document, like the ones the
            // catalog's as-code serializers produce.
            const annotated = "# top comment\na: 1\n\n# about b\nb:\n      c: 2   # trailing\n";
            expect(beautify(annotated, "yaml")).toBe(
                "# top comment\na: 1\n\n# about b\nb:\n  c: 2 # trailing\n",
            );
        });

        it("keeps the authored style of collections rather than rewriting them", () => {
            expect(beautify("a:    {b: 1}", "yaml")).toBe("a: { b: 1 }\n");
        });

        it("keeps a tag it cannot resolve verbatim rather than dropping it", () => {
            expect(beautify("blob: !!binary aGk=", "yaml")).toBe("blob: !!binary aGk=\n");
        });

        it("reports nothing to do for blank input", () => {
            expect(beautify("", "json")).toBeUndefined();
            expect(beautify("  \n ", "yaml")).toBeUndefined();
        });

        it("reports nothing to do for unparseable input, so the action can be disabled", () => {
            expect(beautify('{"a": ', "json")).toBeUndefined();
            expect(beautify("a:\n  - b\n c: bad", "yaml")).toBeUndefined();
        });
    });

    describe("isProjectable", () => {
        it("accepts a parseable value", () => {
            expect(isProjectable('{"a":1}', "json")).toBe(true);
            expect(isProjectable("a: 1", "yaml")).toBe(true);
        });

        it("rejects blank and unparseable text", () => {
            expect(isProjectable("", "json")).toBe(false);
            expect(isProjectable('{"a": ', "json")).toBe(false);
            expect(isProjectable("a:\n  - b\n c: bad", "yaml")).toBe(false);
        });

        it("rejects a comment-only YAML document, whose projection would lose the comments", () => {
            expect(isProjectable("# just a note\n", "yaml")).toBe(false);
        });
    });

    describe("YAML values that JSON cannot represent", () => {
        // These load as Uint8Array / NaN / Infinity, and JSON.stringify then quietly rewrites them,
        // so the value saved would differ from the text on screen.
        it("keeps an unquoted timestamp as the string it looks like", () => {
            expect(convertText("at: 2020-01-01", "yaml", "json")).toBe(
                JSON.stringify({ at: "2020-01-01" }, null, 4),
            );
        });

        it("rejects a binary tag instead of corrupting the value", () => {
            const draft = "blob: !!binary aGk=";
            // Not convertible, so it is passed through and the caller reports it as invalid.
            expect(convertText(draft, "yaml", "json")).toBe(draft);
        });

        it("rejects a tag it cannot resolve instead of quietly reading its bare scalar", () => {
            const draft = "a: !myTag foo";
            expect(convertText(draft, "yaml", "json")).toBe(draft);
        });

        it.each([".nan", ".inf", "-.inf", ".NaN", ".Inf"])(
            "rejects %s rather than saving null while the screen still says otherwise",
            (scalar) => {
                const draft = `a: ${scalar}`;
                expect(convertText(draft, "yaml", "json")).toBe(draft);
            },
        );

        it("rejects a non-finite number nested deep in the document", () => {
            const draft = "a:\n  b:\n    - c: .inf";
            expect(convertText(draft, "yaml", "json")).toBe(draft);
        });

        it("rejects an integer beyond the safe range rather than emitting a rounded one", () => {
            // Both parsers read 9007199254740993 as the double 9007199254740992, so a projection
            // would write a different number than the text on screen says.
            const yamlDraft = "id: 9007199254740993";
            expect(convertText(yamlDraft, "yaml", "json")).toBe(yamlDraft);

            const jsonText = '{"id": 9007199254740993}';
            expect(isProjectable(jsonText, "json")).toBe(false);
            expect(convertText(jsonText, "json", "yaml")).toBe(jsonText);
            // Auto-format goes through the same guard, so it cannot rewrite the number either.
            expect(beautify(jsonText, "json")).toBeUndefined();
        });

        it("still accepts the largest safe integer", () => {
            expect(convertText(`id: ${Number.MAX_SAFE_INTEGER}`, "yaml", "json")).toBe(
                JSON.stringify({ id: Number.MAX_SAFE_INTEGER }, null, 4),
            );
        });

        it("rejects negative zero, which JSON.stringify writes as plain 0", () => {
            const yamlDraft = "value: -0";
            expect(convertText(yamlDraft, "yaml", "json")).toBe(yamlDraft);
            // JSON.parse produces -0 too, so the projection out of JSON is refused the same way.
            expect(isProjectable('{"value": -0}', "json")).toBe(false);
        });

        it("rejects typed mapping keys, which JSON coerces into strings", () => {
            // `1:` and `true:` are a number and a boolean key on screen, but the emitted JSON could
            // only ever say "1" / "true".
            for (const draft of ["1: a", "true: a", "? [a, b]\n: c"]) {
                expect(convertText(draft, "yaml", "json")).toBe(draft);
            }
            // A quoted key is already the string JSON would write.
            expect(convertText('"1": a', "yaml", "json")).toBe(JSON.stringify({ "1": "a" }, null, 4));
        });

        it("still reads the scalars JSON does have", () => {
            expect(convertText("a: true\nb: 1.5\nc: null\nd: text", "yaml", "json")).toBe(
                JSON.stringify({ a: true, b: 1.5, c: null, d: "text" }, null, 4),
            );
        });
    });

    describe("round trips", () => {
        it("leaves canonical JSON byte-identical through YAML and back", () => {
            // The property that keeps a language switch from marking a host form dirty: hosts seed
            // their field with JSON.stringify(content, null, 4), and a switch must reproduce it.
            const asYaml = convertText(CANONICAL_JSON, "json", "yaml");
            expect(convertText(asYaml, "yaml", "json")).toBe(CANONICAL_JSON);
        });

        it("re-formats sloppy JSON once it has been through YAML", () => {
            // The user-visible effect of switching to YAML and back.
            const sloppy = '{"a":{"b":[1,2]},"c":"x"}';
            const asYaml = convertText(sloppy, "json", "yaml");
            expect(convertText(asYaml, "yaml", "json")).toBe(CANONICAL_JSON);
        });

        it("preserves strings that older YAML dialects would reinterpret as booleans", () => {
            // `yes` / `off` are booleans only in YAML 1.1; the 1.2 parser used here reads them back
            // as the strings they were, so the round trip holds without quoting.
            const json = JSON.stringify({ y: "yes", no: "off" }, null, 4);
            expect(convertText(convertText(json, "json", "yaml"), "yaml", "json")).toBe(json);
        });
    });
});
