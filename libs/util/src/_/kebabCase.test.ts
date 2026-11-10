// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _kebabCase } from "./kebabCase.js";

// Expected values match lodash-es@4.18.1 `kebabCase`.
describe("kebabCase", () => {
    describe("word splitting", () => {
        it("joins words with hyphens, splitting on spaces, separators and punctuation", () => {
            expect(_kebabCase("Foo Bar")).toBe("foo-bar");
            expect(_kebabCase("__FOO_BAR__")).toBe("foo-bar");
            expect(_kebabCase("--foo-bar--")).toBe("foo-bar");
            expect(_kebabCase("foo.bar/baz")).toBe("foo-bar-baz");
            expect(_kebabCase("hello, world!")).toBe("hello-world");
            expect(_kebabCase("a-b_c d.e")).toBe("a-b-c-d-e");
            expect(_kebabCase("Mixed-Case_String here")).toBe("mixed-case-string-here");
            expect(_kebabCase("  both  ")).toBe("both");
        });

        it("splits on case changes, keeping acronyms as one word", () => {
            expect(_kebabCase("fooBar")).toBe("foo-bar");
            expect(_kebabCase("FooBar")).toBe("foo-bar");
            expect(_kebabCase("FOO BAR")).toBe("foo-bar");
            expect(_kebabCase("XMLHttpRequest")).toBe("xml-http-request");
            expect(_kebabCase("getHTTPResponse")).toBe("get-http-response");
            expect(_kebabCase("parseXML2JSON")).toBe("parse-xml-2-json");
            expect(_kebabCase("iPhone")).toBe("i-phone");
        });

        it("splits digits from letters and keeps ordinal suffixes with their number", () => {
            expect(_kebabCase("foo2bar")).toBe("foo-2-bar");
            expect(_kebabCase("foo 2 bar")).toBe("foo-2-bar");
            expect(_kebabCase("2foo")).toBe("2-foo");
            expect(_kebabCase("a1b2c3")).toBe("a-1-b-2-c-3");
            expect(_kebabCase("007 bond")).toBe("007-bond");
            expect(_kebabCase("1st place")).toBe("1st-place");
            expect(_kebabCase("22ND place")).toBe("22nd-place");
            expect(_kebabCase("4th")).toBe("4th");
            // "111th" is not an ordinal lodash recognises, so "th" becomes its own word
            expect(_kebabCase("111th")).toBe("111-th");
        });

        it("keeps contractions together and strips the apostrophes", () => {
            expect(_kebabCase("don't stop")).toBe("dont-stop");
            expect(_kebabCase("DON'T STOP")).toBe("dont-stop");
            expect(_kebabCase("don’t stop")).toBe("dont-stop");
            expect(_kebabCase("we're here")).toBe("were-here");
            expect(_kebabCase("rock'n'roll")).toBe("rocknroll");
        });

        it("treats every kind of whitespace and invisible separator as a break", () => {
            expect(_kebabCase("foo\tbar\nbaz")).toBe("foo-bar-baz");
            expect(_kebabCase("foo bar")).toBe("foo-bar");
            expect(_kebabCase("foo​bar")).toBe("foo-bar");
            expect(_kebabCase("ab­cd")).toBe("ab-cd");
            expect(_kebabCase("a—b")).toBe("a-b");
        });
    });

    describe("unicode", () => {
        it("deburrs Latin letters and drops combining marks", () => {
            expect(_kebabCase("déjà vu")).toBe("deja-vu");
            expect(_kebabCase("Crème Brûlée")).toBe("creme-brulee");
            expect(_kebabCase("straße")).toBe("strasse");
            expect(_kebabCase("Æther")).toBe("aether");
            expect(_kebabCase("Łódź")).toBe("lodz");
            expect(_kebabCase("café")).toBe("cafe");
            expect(_kebabCase("x⃐y")).toBe("xy");
        });

        it("lower-cases and joins words in other scripts and keeps emoji whole", () => {
            expect(_kebabCase("Привет мир")).toBe("привет-мир");
            expect(_kebabCase("日本語 テスト")).toBe("日本語-テスト");
            expect(_kebabCase("😀 smile")).toBe("😀-smile");
            expect(_kebabCase("👨‍👩‍👧‍👦 family")).toBe("👨‍👩‍👧‍👦-family");
            expect(_kebabCase("🇨🇿 czech")).toBe("🇨🇿-czech");
        });
    });

    describe("edge cases", () => {
        it("returns an empty string for empty, blank, null and undefined input", () => {
            expect(_kebabCase("")).toBe("");
            expect(_kebabCase("   ")).toBe("");
            expect(_kebabCase()).toBe("");
            expect(_kebabCase(undefined)).toBe("");
            expect(_kebabCase(null as unknown as undefined)).toBe("");
        });

        it("lower-cases a single word", () => {
            expect(_kebabCase("a")).toBe("a");
            expect(_kebabCase("A")).toBe("a");
            expect(_kebabCase("AB")).toBe("ab");
            expect(_kebabCase("123")).toBe("123");
        });

        it("converts non-string input to a string first", () => {
            expect(_kebabCase(123 as unknown as string)).toBe("123");
            expect(_kebabCase(-0 as unknown as string)).toBe("0");
            expect(_kebabCase(true as unknown as string)).toBe("true");
            expect(_kebabCase(NaN as unknown as string)).toBe("na-n");
            expect(_kebabCase(["Foo", "bar"] as unknown as string)).toBe("foo-bar");
            expect(_kebabCase([null] as unknown as string)).toBe("null");
            expect(_kebabCase({ toString: (): string => "to String" } as unknown as string)).toBe(
                "to-string",
            );
            expect(_kebabCase(Symbol("sym") as unknown as string)).toBe("symbol-sym");
            // oxlint-disable-next-line sonarjs/no-primitive-wrappers
            expect(_kebabCase(new String("boxed Str") as unknown as string)).toBe("boxed-str");
        });

        it("handles long input", () => {
            expect(_kebabCase("x".repeat(1000))).toBe("x".repeat(1000));
            expect(_kebabCase("ab ".repeat(3))).toBe("ab-ab-ab");
        });
    });

    describe("typing", () => {
        it("accepts an optional string and returns a string", () => {
            const result: string = _kebabCase("foo bar");

            expect(result).toBe("foo-bar");
        });
    });
});
