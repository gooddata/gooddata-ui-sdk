// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _capitalize } from "./capitalize.js";

// Expected values match lodash-es@4.18.1 `capitalize`.
describe("capitalize", () => {
    describe("ascii", () => {
        it("upper-cases the first character and lower-cases the rest", () => {
            expect(_capitalize("FRED")).toBe("Fred");
            expect(_capitalize("fred")).toBe("Fred");
            expect(_capitalize("fRED")).toBe("Fred");
            expect(_capitalize("f")).toBe("F");
        });

        it("only touches the very first character, whatever it is", () => {
            expect(_capitalize("fred barney")).toBe("Fred barney");
            expect(_capitalize("FRED BARNEY")).toBe("Fred barney");
            expect(_capitalize("  fred")).toBe("  fred");
            expect(_capitalize("123abc")).toBe("123abc");
            expect(_capitalize("-fred")).toBe("-fred");
        });
    });

    describe("unicode", () => {
        it("handles accented letters, sharp s and ligatures", () => {
            expect(_capitalize("éclair")).toBe("Éclair");
            expect(_capitalize("ÉCLAIR")).toBe("Éclair");
            expect(_capitalize("straße")).toBe("Straße");
            expect(_capitalize("STRASSE")).toBe("Strasse");
            expect(_capitalize("ǆ")).toBe("Ǆ");
            expect(_capitalize("ﬁ")).toBe("FI");
        });

        it("handles other scripts, including the final sigma and the dotted I", () => {
            expect(_capitalize("ΣΊΣΥΦΟΣ")).toBe("Σίσυφος");
            expect(_capitalize("ПРИВЕТ")).toBe("Привет");
            expect(_capitalize("日本語")).toBe("日本語");
            // lower-casing the dotted I yields "i" plus a combining dot, which stays attached when upper-cased
            expect(_capitalize("İstanbul")).toBe("I\u0307stanbul");
        });

        it("keeps a leading emoji, joined sequence or flag whole", () => {
            expect(_capitalize("😀SMILE")).toBe("😀smile");
            expect(_capitalize("😀 smile")).toBe("😀 smile");
            expect(_capitalize("👨‍👩‍👧‍👦 FAMILY")).toBe("👨‍👩‍👧‍👦 family");
            expect(_capitalize("🇨🇿 CZECH")).toBe("🇨🇿 czech");
            expect(_capitalize("🏳️‍🌈 PRIDE")).toBe("🏳️‍🌈 pride");
            expect(_capitalize("👍🏽 THUMBS")).toBe("👍🏽 thumbs");
        });

        it("keeps combining marks and joiners attached to the first character", () => {
            expect(_capitalize("éCLAIR")).toBe("Éclair");
            expect(_capitalize("x⃐Y")).toBe("X⃐y");
            // a zero-width joiner makes the whole joined sequence the first character
            expect(_capitalize("a‍B")).toBe("A‍B");
        });

        it("tolerates lone surrogates", () => {
            expect(_capitalize("\ud83d")).toBe("\ud83d");
            expect(_capitalize("😀X")).toBe("😀x");
        });
    });

    describe("edge cases", () => {
        it("returns an empty string for empty, undefined and null input", () => {
            expect(_capitalize("")).toBe("");
            expect(_capitalize()).toBe("");
            expect(_capitalize(undefined)).toBe("");
            expect(_capitalize(null as unknown as undefined)).toBe("");
        });

        it("converts non-string input to a string first, as lodash does", () => {
            expect(_capitalize(123 as unknown as string)).toBe("123");
            expect(_capitalize(NaN as unknown as string)).toBe("Nan");
            expect(_capitalize(true as unknown as string)).toBe("True");
            expect(_capitalize(-0 as unknown as string)).toBe("-0");
            expect(_capitalize(["FRED", "BARNEY"] as unknown as string)).toBe("Fred,barney");
            expect(_capitalize([null] as unknown as string)).toBe("Null");
            expect(_capitalize({ toString: (): string => "OBJ" } as unknown as string)).toBe("Obj");
            expect(_capitalize(Symbol("SYM") as unknown as string)).toBe("Symbol(sym)");
            // oxlint-disable-next-line sonarjs/no-primitive-wrappers
            expect(_capitalize(new String("BOXED") as unknown as string)).toBe("Boxed");
        });

        it("handles long input", () => {
            expect(_capitalize("x".repeat(500))).toBe(`X${"x".repeat(499)}`);
            expect(_capitalize("É".repeat(100))).toBe(`É${"é".repeat(99)}`);
        });
    });

    describe("typing", () => {
        it("accepts an optional string and returns a string", () => {
            const result: string = _capitalize("fred");

            expect(result).toBe("Fred");
        });
    });
});
