// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _escape } from "./escape.js";

// Expected values match lodash-es@4.18.1 `escape`.
describe("escape", () => {
    describe("escaping", () => {
        it("converts the five HTML characters to entities", () => {
            expect(_escape("fred, barney, & pebbles")).toBe("fred, barney, &amp; pebbles");
            expect(_escape("&<>\"'")).toBe("&amp;&lt;&gt;&quot;&#39;");
            expect(_escape("<b>bold</b>")).toBe("&lt;b&gt;bold&lt;/b&gt;");
            expect(_escape('<a href="x">y</a>')).toBe("&lt;a href=&quot;x&quot;&gt;y&lt;/a&gt;");
            expect(_escape("it's")).toBe("it&#39;s");
        });

        it("escapes every occurrence and escapes existing entities again", () => {
            expect(_escape("&&")).toBe("&amp;&amp;");
            expect(_escape("&amp;")).toBe("&amp;amp;");
            expect(_escape("&lt;b&gt;")).toBe("&amp;lt;b&amp;gt;");
            expect(_escape("&".repeat(3))).toBe("&amp;".repeat(3));
        });

        it("leaves every other character alone, backticks and slashes included", () => {
            expect(_escape("`")).toBe("`");
            expect(_escape("/")).toBe("/");
            expect(_escape("\\")).toBe("\\");
            expect(_escape("= {} []")).toBe("= {} []");
            expect(_escape("unicode ☃ <snow>")).toBe("unicode ☃ &lt;snow&gt;");
            expect(_escape("émoji 😀 & co")).toBe("émoji 😀 &amp; co");
            expect(_escape("\u0000 < \u0001")).toBe("\u0000 &lt; \u0001");
            expect(_escape("tab\t<\nnew")).toBe("tab\t&lt;\nnew");
        });

        it("returns the input unchanged when there is nothing to escape", () => {
            const plain = "no specials here";

            expect(_escape(plain)).toBe(plain);
            expect(_escape("abc")).toBe("abc");
        });

        it("handles long input", () => {
            expect(_escape(`${"x".repeat(1000)}<${"y".repeat(1000)}`)).toBe(
                `${"x".repeat(1000)}&lt;${"y".repeat(1000)}`,
            );
        });
    });

    describe("edge cases", () => {
        it("returns an empty string for empty, undefined and null input", () => {
            expect(_escape("")).toBe("");
            expect(_escape()).toBe("");
            expect(_escape(undefined)).toBe("");
            expect(_escape(null as unknown as undefined)).toBe("");
        });

        it("converts non-string input to a string first, as lodash does", () => {
            expect(_escape(123 as unknown as string)).toBe("123");
            expect(_escape(-0 as unknown as string)).toBe("-0");
            expect(_escape(NaN as unknown as string)).toBe("NaN");
            expect(_escape(true as unknown as string)).toBe("true");
            expect(_escape(["<a>", "&"] as unknown as string)).toBe("&lt;a&gt;,&amp;");
            expect(_escape(["<", null] as unknown as string)).toBe("&lt;,null");
            expect(_escape({ toString: (): string => "<obj>" } as unknown as string)).toBe("&lt;obj&gt;");
            expect(_escape(Symbol("<sym>") as unknown as string)).toBe("Symbol(&lt;sym&gt;)");
            // oxlint-disable-next-line sonarjs/no-primitive-wrappers
            expect(_escape(new String("<boxed>") as unknown as string)).toBe("&lt;boxed&gt;");
        });
    });

    describe("typing", () => {
        it("accepts an optional string and returns a string", () => {
            const result: string = _escape("<");

            expect(result).toBe("&lt;");
        });
    });
});
