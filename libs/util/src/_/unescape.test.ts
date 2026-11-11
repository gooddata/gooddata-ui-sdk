// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _escape } from "./escape.js";
import { _unescape } from "./unescape.js";

// Expected values match lodash-es@4.18.1 `unescape`.
describe("unescape", () => {
    describe("unescaping", () => {
        it("converts the five supported HTML entities to characters", () => {
            expect(_unescape("fred, barney, &amp; pebbles")).toBe("fred, barney, & pebbles");
            expect(_unescape("&amp;&lt;&gt;&quot;&#39;")).toBe("&<>\"'");
            expect(_unescape("&lt;b&gt;bold&lt;/b&gt;")).toBe("<b>bold</b>");
            expect(_unescape("&lt;a href=&quot;x&quot;&gt;y&lt;/a&gt;")).toBe('<a href="x">y</a>');
            expect(_unescape("it&#39;s")).toBe("it's");
        });

        it("unescapes every occurrence, in a single pass", () => {
            expect(_unescape("&amp;&amp;")).toBe("&&");
            expect(_unescape("&amp;amp;")).toBe("&amp;");
            expect(_unescape("&amp;lt;")).toBe("&lt;");
            expect(_unescape("&amp;".repeat(3))).toBe("&&&");
            expect(_unescape("&amp;".repeat(1000))).toBe("&".repeat(1000));
        });

        it("leaves unsupported, malformed and differently cased entities alone", () => {
            expect(_unescape("&nbsp;")).toBe("&nbsp;");
            expect(_unescape("&apos;")).toBe("&apos;");
            expect(_unescape("&#x27;")).toBe("&#x27;");
            expect(_unescape("&#38;")).toBe("&#38;");
            expect(_unescape("&AMP;")).toBe("&AMP;");
            expect(_unescape("&Lt;")).toBe("&Lt;");
            expect(_unescape("&amp")).toBe("&amp");
            expect(_unescape("&#39")).toBe("&#39");
            expect(_unescape("& amp;")).toBe("& amp;");
            expect(_unescape("amp;")).toBe("amp;");
            expect(_unescape("&&amp;")).toBe("&&");
        });

        it("leaves every other character alone", () => {
            expect(_unescape("`/\\= {} []")).toBe("`/\\= {} []");
            expect(_unescape("unicode ☃ &lt;snow&gt;")).toBe("unicode ☃ <snow>");
            expect(_unescape("émoji 😀 &amp; co")).toBe("émoji 😀 & co");
            expect(_unescape("\u0000 &lt; \u0001")).toBe("\u0000 < \u0001");
            expect(_unescape("tab\t&lt;\nnew")).toBe("tab\t<\nnew");
            expect(_unescape("<>\"'&")).toBe("<>\"'&");
        });

        it("returns the input unchanged when there is nothing to unescape", () => {
            const plain = "no entities here";

            expect(_unescape(plain)).toBe(plain);
            expect(_unescape("abc")).toBe("abc");
        });

        it("is the inverse of escape for the five characters", () => {
            const samples = [
                "&<>\"'",
                "fred, barney, & pebbles",
                '<a href="x">it\'s</a>',
                "&amp; already",
                "",
            ];

            for (const sample of samples) {
                expect(_unescape(_escape(sample))).toBe(sample);
            }
        });

        it("is stateless across calls", () => {
            expect(_unescape("&amp;")).toBe("&");
            expect(_unescape("&amp;")).toBe("&");
            expect(_unescape("x&amp;y")).toBe("x&y");
            expect(_unescape("&lt;&lt;")).toBe("<<");
        });
    });

    describe("non-string input", () => {
        it("returns an empty string for nullish and missing input", () => {
            expect(_unescape()).toBe("");
            expect(_unescape(undefined)).toBe("");
            expect(_unescape(null as unknown as string)).toBe("");
            expect(_unescape("")).toBe("");
        });

        it("coerces other values the way lodash does before unescaping", () => {
            expect(_unescape(0 as unknown as string)).toBe("0");
            expect(_unescape(-0 as unknown as string)).toBe("-0");
            expect(_unescape(1.5 as unknown as string)).toBe("1.5");
            expect(_unescape(NaN as unknown as string)).toBe("NaN");
            expect(_unescape(true as unknown as string)).toBe("true");
            expect(_unescape(["&amp;", "&lt;"] as unknown as string)).toBe("&,<");
            expect(_unescape([null, undefined] as unknown as string)).toBe("null,undefined");
            expect(_unescape({ toString: () => "&gt;" } as unknown as string)).toBe(">");
            expect(_unescape(Object("&quot;") as unknown as string)).toBe('"');
            expect(_unescape(Symbol("&amp;") as unknown as string)).toBe("Symbol(&)");
            expect(_unescape({} as unknown as string)).toBe("[object Object]");
        });

        it("ignores extra arguments", () => {
            expect((_unescape as unknown as (a: string, b: string) => string)("&amp;", "&lt;")).toBe("&");
            expect(_unescape.length).toBe(1);
        });
    });
});
