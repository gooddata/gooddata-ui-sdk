// (C) 2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    buildContainsIcClause,
    buildIsClause,
    buildIsNullClause,
    buildListClause,
    escapeValue,
    formatInValues,
    formatValue,
    joinClauses,
} from "../filtering.js";

describe("buildListClause", () => {
    it("should return undefined for undefined values", () => {
        expect(buildListClause("id", "in", undefined)).toBeUndefined();
    });

    it("should return undefined for empty array", () => {
        expect(buildListClause("id", "in", [])).toBeUndefined();
    });

    it("should build an in clause for multiple values", () => {
        expect(buildListClause("id", "in", ["a", "b"])).toBe('id=in=("a","b")');
    });

    it("should build an out clause for single value", () => {
        expect(buildListClause("id", "out", ["a"])).toBe('id=out=("a")');
    });

    it("should quote and escape values", () => {
        expect(buildListClause("title", "in", ['a "quote"', "a\\path"])).toBe(
            'title=in=("a \\"quote\\"","a\\\\path")',
        );
    });
});

describe("buildIsClause", () => {
    it("should return undefined for undefined value", () => {
        expect(buildIsClause("createdBy.id", undefined)).toBeUndefined();
    });

    it("should return undefined for empty string", () => {
        expect(buildIsClause("createdBy.id", "")).toBeUndefined();
    });

    it("should build an equality clause", () => {
        expect(buildIsClause("createdBy.id", "user-1")).toBe('createdBy.id=="user-1"');
    });

    it("should quote and escape the value", () => {
        expect(buildIsClause("title", 'a "quote"')).toBe('title=="a \\"quote\\""');
    });
});

describe("buildIsNullClause", () => {
    it("should return undefined for undefined input", () => {
        expect(buildIsNullClause("description", undefined)).toBeUndefined();
    });

    it("should build isnull=true clause", () => {
        expect(buildIsNullClause("description", true)).toBe("description=isnull=true");
    });

    it("should build isnull=false clause", () => {
        expect(buildIsNullClause("description", false)).toBe("description=isnull=false");
    });
});

describe("buildContainsIcClause", () => {
    it("should return undefined for undefined value", () => {
        expect(buildContainsIcClause("title", undefined)).toBeUndefined();
    });

    it("should return undefined for empty string", () => {
        expect(buildContainsIcClause("title", "")).toBeUndefined();
    });

    it("should build a case-insensitive contains clause", () => {
        expect(buildContainsIcClause("title", "Hello")).toBe('title=containsic="Hello"');
    });

    it("should quote and escape the value", () => {
        expect(buildContainsIcClause("title", 'a "quote"')).toBe('title=containsic="a \\"quote\\""');
    });
});

describe("joinClauses", () => {
    it("should return undefined for empty array", () => {
        expect(joinClauses([])).toBeUndefined();
    });

    it("should return undefined when all clauses are undefined", () => {
        expect(joinClauses([undefined, undefined])).toBeUndefined();
    });

    it("should join clauses with semicolon", () => {
        expect(joinClauses(["a", undefined, "b"])).toBe("a;b");
    });

    it("should ignore empty strings", () => {
        expect(joinClauses(["a", "", "b"])).toBe("a;b");
    });

    it("should return a single clause as-is", () => {
        expect(joinClauses(["a"])).toBe("a");
    });
});

describe("formatInValues", () => {
    it("should format values for RSQL in operator", () => {
        expect(formatInValues(["a", "b"])).toBe('"a","b"');
    });

    it("should quote and escape each value", () => {
        expect(formatInValues(['a "quote"', "a\\path"])).toBe('"a \\"quote\\"","a\\\\path"');
    });
});

describe("formatValue", () => {
    it("should wrap value in double quotes", () => {
        expect(formatValue("abc")).toBe('"abc"');
    });

    it("should escape quotes", () => {
        expect(formatValue('a"b')).toBe('"a\\"b"');
    });

    it("should escape backslashes", () => {
        expect(formatValue("a\\b")).toBe('"a\\\\b"');
    });
});

describe("escapeValue", () => {
    it("should not modify values without escapable characters", () => {
        expect(escapeValue("abc")).toBe("abc");
    });

    it("should escape double quotes", () => {
        expect(escapeValue('a"b')).toBe('a\\"b');
    });

    it("should escape backslashes", () => {
        expect(escapeValue("a\\b")).toBe("a\\\\b");
    });

    it("should escape backslashes and double quotes", () => {
        const input = 'a\\"b';
        const expected = "a" + "\\".repeat(3) + '"' + "b";

        expect(escapeValue(input)).toBe(expected);
    });
});
