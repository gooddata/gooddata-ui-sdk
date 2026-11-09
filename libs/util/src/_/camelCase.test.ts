// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _camelCase } from "./camelCase.js";

// Expected values match lodash-es@4.18.1 `camelCase`.
describe("camelCase", () => {
    describe("word splitting", () => {
        it("joins words split on spaces, separators and punctuation", () => {
            expect(_camelCase("Foo Bar")).toBe("fooBar");
            expect(_camelCase("--foo-bar--")).toBe("fooBar");
            expect(_camelCase("__FOO_BAR__")).toBe("fooBar");
            expect(_camelCase("foo.bar/baz")).toBe("fooBarBaz");
            expect(_camelCase("hello, world!")).toBe("helloWorld");
            expect(_camelCase("a-b_c d.e")).toBe("aBCDE");
            expect(_camelCase("Mixed-Case_String here")).toBe("mixedCaseStringHere");
            expect(_camelCase("  both  ")).toBe("both");
        });

        it("splits on case changes, keeping acronyms as one word", () => {
            expect(_camelCase("fooBar")).toBe("fooBar");
            expect(_camelCase("FooBar")).toBe("fooBar");
            expect(_camelCase("FOO BAR")).toBe("fooBar");
            expect(_camelCase("XMLHttpRequest")).toBe("xmlHttpRequest");
            expect(_camelCase("getHTTPResponse")).toBe("getHttpResponse");
            expect(_camelCase("parseXML2JSON")).toBe("parseXml2Json");
            expect(_camelCase("iPhone")).toBe("iPhone");
        });

        it("splits digits from letters and keeps ordinal suffixes with their number", () => {
            expect(_camelCase("foo2bar")).toBe("foo2Bar");
            expect(_camelCase("foo 2 bar")).toBe("foo2Bar");
            expect(_camelCase("2foo")).toBe("2Foo");
            expect(_camelCase("a1b2c3")).toBe("a1B2C3");
            expect(_camelCase("A1B2C3")).toBe("a1B2C3");
            expect(_camelCase("007 bond")).toBe("007Bond");
            expect(_camelCase("1st place")).toBe("1stPlace");
            expect(_camelCase("22ND place")).toBe("22ndPlace");
            expect(_camelCase("4th")).toBe("4th");
            // "111th" is not an ordinal lodash recognises, so "th" becomes its own word
            expect(_camelCase("111th")).toBe("111Th");
        });

        it("keeps contractions together and strips the apostrophes", () => {
            expect(_camelCase("don't stop")).toBe("dontStop");
            expect(_camelCase("DON'T STOP")).toBe("dontStop");
            expect(_camelCase("don’t stop")).toBe("dontStop");
            expect(_camelCase("we're here")).toBe("wereHere");
            expect(_camelCase("they've")).toBe("theyve");
            expect(_camelCase("rock'n'roll")).toBe("rocknroll");
        });

        it("treats every kind of whitespace and invisible separator as a break", () => {
            expect(_camelCase("foo\tbar\nbaz")).toBe("fooBarBaz");
            expect(_camelCase("foo bar")).toBe("fooBar");
            expect(_camelCase("foo​bar")).toBe("fooBar");
            expect(_camelCase("foo‍bar")).toBe("fooBar");
            expect(_camelCase("ab­cd")).toBe("abCd");
            expect(_camelCase("a—b")).toBe("aB");
            expect(_camelCase("a×b")).toBe("aB");
        });
    });

    describe("unicode", () => {
        it("deburrs Latin-1 and Latin Extended-A letters and drops combining marks", () => {
            expect(_camelCase("déjà vu")).toBe("dejaVu");
            expect(_camelCase("Crème Brûlée")).toBe("cremeBrulee");
            expect(_camelCase("naïve café")).toBe("naiveCafe");
            expect(_camelCase("straße")).toBe("strasse");
            expect(_camelCase("Æther")).toBe("aether");
            expect(_camelCase("Łódź")).toBe("lodz");
            expect(_camelCase("café")).toBe("cafe");
            expect(_camelCase("x⃐y")).toBe("xy");
        });

        it("lower-cases and joins words in other scripts", () => {
            expect(_camelCase("Привет мир")).toBe("приветМир");
            expect(_camelCase("ПРИВЕТ МИР")).toBe("приветМир");
            expect(_camelCase("日本語 テスト")).toBe("日本語テスト");
        });

        it("keeps emoji, joined sequences and flags intact as words", () => {
            expect(_camelCase("😀 smile")).toBe("😀Smile");
            expect(_camelCase("👨‍👩‍👧‍👦 family")).toBe("👨‍👩‍👧‍👦Family");
            expect(_camelCase("🇨🇿 czech")).toBe("🇨🇿Czech");
        });
    });

    describe("edge cases", () => {
        it("returns an empty string for empty, blank, null and undefined input", () => {
            expect(_camelCase("")).toBe("");
            expect(_camelCase("   ")).toBe("");
            expect(_camelCase()).toBe("");
            expect(_camelCase(undefined)).toBe("");
            expect(_camelCase(null as unknown as undefined)).toBe("");
        });

        it("lower-cases a single word", () => {
            expect(_camelCase("a")).toBe("a");
            expect(_camelCase("A")).toBe("a");
            expect(_camelCase("AB")).toBe("ab");
            expect(_camelCase("123")).toBe("123");
        });

        it("converts non-string input to a string first", () => {
            expect(_camelCase(123 as unknown as string)).toBe("123");
            expect(_camelCase(true as unknown as string)).toBe("true");
            expect(_camelCase(NaN as unknown as string)).toBe("naN");
            expect(_camelCase(["Foo", "bar"] as unknown as string)).toBe("fooBar");
            expect(_camelCase({ toString: (): string => "to String" } as unknown as string)).toBe("toString");
            expect(_camelCase(Symbol("sym") as unknown as string)).toBe("symbolSym");
            // oxlint-disable-next-line sonarjs/no-primitive-wrappers
            expect(_camelCase(new String("boxed Str") as unknown as string)).toBe("boxedStr");
        });

        it("handles long input", () => {
            expect(_camelCase("x".repeat(1000))).toBe("x".repeat(1000));
            expect(_camelCase("ab ".repeat(3))).toBe("abAbAb");
        });
    });

    describe("typing", () => {
        it("accepts an optional string and returns a string", () => {
            const result: string = _camelCase("foo bar");

            expect(result).toBe("fooBar");
        });
    });
});
