// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { _escapeRegExp } from "./escapeRegExp.js";

// Expected values match lodash-es@4.18.1 `escapeRegExp`.
describe("escapeRegExp", () => {
    describe("escaping", () => {
        it("escapes the fourteen RegExp syntax characters with a backslash", () => {
            expect(_escapeRegExp("^")).toBe("\\^");
            expect(_escapeRegExp("$")).toBe("\\$");
            expect(_escapeRegExp("\\")).toBe("\\\\");
            expect(_escapeRegExp(".")).toBe("\\.");
            expect(_escapeRegExp("*")).toBe("\\*");
            expect(_escapeRegExp("+")).toBe("\\+");
            expect(_escapeRegExp("?")).toBe("\\?");
            expect(_escapeRegExp("(")).toBe("\\(");
            expect(_escapeRegExp(")")).toBe("\\)");
            expect(_escapeRegExp("[")).toBe("\\[");
            expect(_escapeRegExp("]")).toBe("\\]");
            expect(_escapeRegExp("{")).toBe("\\{");
            expect(_escapeRegExp("}")).toBe("\\}");
            expect(_escapeRegExp("|")).toBe("\\|");
            expect(_escapeRegExp("^$\\.*+?()[]{}|")).toBe("\\^\\$\\\\\\.\\*\\+\\?\\(\\)\\[\\]\\{\\}\\|");
        });

        it("escapes every occurrence inside longer text", () => {
            expect(_escapeRegExp("[lodash](https://lodash.com/)")).toBe(
                "\\[lodash\\]\\(https://lodash\\.com/\\)",
            );
            expect(_escapeRegExp("a.b*c")).toBe("a\\.b\\*c");
            expect(_escapeRegExp("(?:x)")).toBe("\\(\\?:x\\)");
            expect(_escapeRegExp("[a-z]+")).toBe("\\[a-z\\]\\+");
            expect(_escapeRegExp("{1,3}")).toBe("\\{1,3\\}");
            expect(_escapeRegExp("\\d\\$")).toBe("\\\\d\\\\\\$");
            expect(_escapeRegExp(".".repeat(3))).toBe("\\.".repeat(3));
            expect(_escapeRegExp(".".repeat(1000))).toBe("\\.".repeat(1000));
        });

        it("does not escape the slash, hyphen, hash, ampersand or whitespace", () => {
            expect(_escapeRegExp("/")).toBe("/");
            expect(_escapeRegExp("a/b")).toBe("a/b");
            expect(_escapeRegExp("-")).toBe("-");
            expect(_escapeRegExp("a-b")).toBe("a-b");
            expect(_escapeRegExp("#")).toBe("#");
            expect(_escapeRegExp("&")).toBe("&");
            expect(_escapeRegExp("a b\tc\nd")).toBe("a b\tc\nd");
            expect(_escapeRegExp("= , ; : ! @ % ~ ` ' \" < >")).toBe("= , ; : ! @ % ~ ` ' \" < >");
        });

        it("treats replacement patterns like $& and $1 as plain text", () => {
            expect(_escapeRegExp("$&")).toBe("\\$&");
            expect(_escapeRegExp("$1")).toBe("\\$1");
            expect(_escapeRegExp("$$")).toBe("\\$\\$");
            expect(_escapeRegExp("$'")).toBe("\\$'");
            expect(_escapeRegExp("$`")).toBe("\\$`");
        });

        it("leaves non-ASCII text alone", () => {
            expect(_escapeRegExp("é.ü")).toBe("é\\.ü");
            expect(_escapeRegExp("😀.😀")).toBe("😀\\.😀");
            expect(_escapeRegExp("\u0000.\u0001")).toBe("\u0000\\.\u0001");
            expect(_escapeRegExp("ünïcödé")).toBe("ünïcödé");
        });

        it("returns the input unchanged when there is nothing to escape", () => {
            const plain = "plain text";

            expect(_escapeRegExp(plain)).toBe(plain);
            expect(_escapeRegExp("abc")).toBe("abc");
        });

        it("produces a pattern that matches the original literally and nothing else", () => {
            for (const sample of ["a.b*c", "[x](y)", "^$|\\", "{1}?+", "[lodash](https://lodash.com/)"]) {
                expect(new RegExp(`^${_escapeRegExp(sample)}$`).test(sample)).toBe(true);
            }

            expect(new RegExp(`^${_escapeRegExp("a.b")}$`).test("axb")).toBe(false);
            expect(new RegExp(`^${_escapeRegExp("x*")}$`).test("xx")).toBe(false);
            expect(new RegExp(`^${_escapeRegExp("[ab]")}$`).test("a")).toBe(false);
        });

        it("is stateless across calls", () => {
            expect(_escapeRegExp("a.b")).toBe("a\\.b");
            expect(_escapeRegExp("a.b")).toBe("a\\.b");
            expect(_escapeRegExp(".")).toBe("\\.");
            expect(_escapeRegExp("x")).toBe("x");
        });
    });

    describe("non-string input", () => {
        it("returns an empty string for nullish and missing input", () => {
            expect(_escapeRegExp()).toBe("");
            expect(_escapeRegExp(undefined)).toBe("");
            expect(_escapeRegExp(null as unknown as string)).toBe("");
            expect(_escapeRegExp("")).toBe("");
        });

        it("coerces other values the way lodash does before escaping", () => {
            expect(_escapeRegExp(1.5 as unknown as string)).toBe("1\\.5");
            expect(_escapeRegExp(0 as unknown as string)).toBe("0");
            expect(_escapeRegExp(-0 as unknown as string)).toBe("-0");
            expect(_escapeRegExp(NaN as unknown as string)).toBe("NaN");
            expect(_escapeRegExp(true as unknown as string)).toBe("true");
            expect(_escapeRegExp([".", "*"] as unknown as string)).toBe("\\.,\\*");
            expect(_escapeRegExp([null, undefined] as unknown as string)).toBe("null,undefined");
            expect(_escapeRegExp({ toString: () => ".*" } as unknown as string)).toBe("\\.\\*");
            expect(_escapeRegExp(Object("(x)") as unknown as string)).toBe("\\(x\\)");
            expect(_escapeRegExp(Symbol(".") as unknown as string)).toBe("Symbol\\(\\.\\)");
            expect(_escapeRegExp(/a.b/g as unknown as string)).toBe("/a\\.b/g");
            expect(_escapeRegExp({} as unknown as string)).toBe("\\[object Object\\]");
        });

        it("ignores extra arguments", () => {
            expect((_escapeRegExp as unknown as (a: string, b: string) => string)("a.b", "c.d")).toBe(
                "a\\.b",
            );
            expect(_escapeRegExp.length).toBe(1);
        });
    });
});
