// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _deburr } from "./deburr.js";

// Expected values match lodash-es@4.18.1 `deburr`.
describe("deburr", () => {
    describe("letters", () => {
        it("converts Latin-1 Supplement letters to basic Latin letters", () => {
            expect(_deburr("déjà vu")).toBe("deja vu");
            expect(_deburr("ÀÁÂÃÄÅ àáâãäå")).toBe("AAAAAA aaaaaa");
            expect(_deburr("ÈÉÊË èéêë ÌÍÎÏ ìíîï")).toBe("EEEE eeee IIII iiii");
            expect(_deburr("ÒÓÔÕÖØ òóôõöø ÙÚÛÜ ùúûü")).toBe("OOOOOO oooooo UUUU uuuu");
            expect(_deburr("Ç ç Ð ð Ñ ñ Ý ý ÿ")).toBe("C c D d N n Y y y");
        });

        it("converts Latin Extended-A letters, including dotted and dotless I", () => {
            expect(_deburr("ĀĂĄ āăą ĆĈĊČ ćĉċč")).toBe("AAA aaa CCCC cccc");
            expect(_deburr("ĎĐ ďđ ĒĔĖĘĚ ēĕėęě")).toBe("DD dd EEEEE eeeee");
            expect(_deburr("ĹĻĽĿŁ ĺļľŀł ŃŅŇŊ ńņňŋ")).toBe("LLLLL lllll NNNN nnnn");
            expect(_deburr("ŔŖŘ ŕŗř ŚŜŞŠ śŝşš ŢŤŦ ţťŧ")).toBe("RRR rrr SSSS ssss TTT ttt");
            expect(_deburr("ŨŪŬŮŰŲ ũūŭůűų Ŵŵ ŶŷŸ ŹŻŽ źżž")).toBe("UUUUUU uuuuuu Ww YyY ZZZ zzz");
            expect(_deburr("İ ı ſ")).toBe("I i s");
        });

        it("expands ligatures and special letters to several letters", () => {
            expect(_deburr("Æ æ Œ œ Ĳ ĳ")).toBe("Ae ae Oe oe IJ ij");
            expect(_deburr("ß Þ þ ŉ")).toBe("ss Th th 'n");
        });

        it("leaves the multiplication and division signs, Latin Extended-B and other scripts alone", () => {
            expect(_deburr("× ÷")).toBe("× ÷");
            expect(_deburr("ƒ ƀ Ǆ")).toBe("ƒ ƀ Ǆ");
            expect(_deburr("Привет 你好 مرحبا déjà")).toBe("Привет 你好 مرحبا deja");
            expect(_deburr("😀 é 👍")).toBe("😀 e 👍");
        });
    });

    describe("combining marks", () => {
        it("removes combining diacritical marks, half marks and marks for symbols", () => {
            expect(_deburr("déjà vu")).toBe("deja vu");
            expect(_deburr("déjà".normalize("NFD"))).toBe("deja");
            expect(_deburr("à́̂ͯ")).toBe("a");
            expect(_deburr("a︠︯")).toBe("a");
            expect(_deburr("a⃐⃿")).toBe("a");
            expect(_deburr("́̀")).toBe("");
            expect(_deburr("я́")).toBe("я");
        });

        it("keeps marks outside those ranges", () => {
            expect(_deburr("a᪰ b᷀")).toBe("a᪰ b᷀");
        });
    });

    describe("inputs", () => {
        it("returns plain text and empty strings unchanged", () => {
            const plain = "plain ASCII text";

            expect(_deburr(plain)).toBe(plain);
            expect(_deburr("")).toBe("");
            expect(_deburr(" \t\n")).toBe(" \t\n");
            expect(_deburr("123")).toBe("123");
            expect(_deburr("é".repeat(5000))).toBe("e".repeat(5000));
        });

        it("coerces other values the way lodash does", () => {
            expect(_deburr()).toBe("");
            expect(_deburr(undefined)).toBe("");
            expect(_deburr(null as unknown as string)).toBe("");
            expect(_deburr(1.5 as unknown as string)).toBe("1.5");
            expect(_deburr(-0 as unknown as string)).toBe("-0");
            expect(_deburr(NaN as unknown as string)).toBe("NaN");
            expect(_deburr(true as unknown as string)).toBe("true");
            expect(_deburr(["é", "à"] as unknown as string)).toBe("e,a");
            expect(_deburr({ toString: () => "ñ" } as unknown as string)).toBe("n");
            expect(_deburr(Object("ü") as unknown as string)).toBe("u");
            expect(_deburr(Symbol("é") as unknown as string)).toBe("Symbol(e)");
        });

        it("is stateless and ignores extra arguments", () => {
            expect(_deburr("é")).toBe("e");
            expect(_deburr("é")).toBe("e");
            expect((_deburr as unknown as (a: string, b: string) => string)("é", "x")).toBe("e");
            expect(_deburr.length).toBe(1);
        });
    });
});
