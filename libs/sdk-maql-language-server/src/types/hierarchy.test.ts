// (C) 2022-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { MaqlType as T, isSubtype, lowestCommonAncestor } from "./hierarchy.js";

describe.each([
    [T.ANY, T.ANY],
    [T.NUMERIC, T.ANY],
    [T.STRING, T.ANY],
    [T.DATE, T.ANY],
    [T.STRING_AND_DATE, T.STRING],
    [T.STRING_AND_DATE, T.DATE],
    [T.NUMERIC_LITERAL, T.NUMERIC],
    [T.NULL_LITERAL, T.NUMERIC],
    [T.STRING_LITERAL, T.STRING],
    [T.NULL_LITERAL, T.STRING],
    [T.STRING_LITERAL, T.DATE],
    [T.NULL_LITERAL, T.DATE],
    [T.INTEGER_LITERAL, T.NUMERIC_LITERAL],
    [T.PERIODICAL_GRANULARITY, T.GRANULARITY],
    [T.CHRONOLOGICAL_GRANULARITY, T.GRANULARITY],
    [T.UNIT, T.ANY],
    [T.ALL, T.ANY],
    [T.ALL, T.NUMERIC],
    [T.ALL, T.NULL_LITERAL],
    [T.ALL, T.GRANULARITY],
])("tests that type is subtype", (type: T, supertype: T) => {
    it(`${T[type]} is subtype of ${T[supertype]}`, () => {
        expect(isSubtype(type, supertype)).toBe(true);
    });
});

describe.each([
    [T.ANY, T.ALL],
    [T.UNIT, T.ALL],
    [T.NULL_LITERAL, T.NUMERIC_LITERAL],
    [T.NUMERIC, T.NUMERIC_LITERAL],
])("tests that type is not subtype", (type: T, supertype: T) => {
    it(`${T[type]} is not subtype of ${T[supertype]}`, () => {
        expect(isSubtype(type, supertype)).toBe(false);
    });
});

describe.each([
    [T.STRING_LITERAL, T.STRING, T.STRING],
    [T.STRING_LITERAL, T.DATE, T.DATE],
    [T.STRING_LITERAL, T.STRING_LITERAL, T.STRING_LITERAL],
    [T.NUMERIC_LITERAL, T.NULL_LITERAL, T.NUMERIC],
    [T.NUMERIC_LITERAL, T.INTEGER_LITERAL, T.NUMERIC_LITERAL],
    [T.NUMERIC_LITERAL, T.STRING_LITERAL, T.ANY],
    [T.CHRONOLOGICAL_GRANULARITY, T.PERIODICAL_GRANULARITY, T.GRANULARITY],
    [T.ALL, T.BOOLEAN, T.BOOLEAN],
])("find the lowest common ancestor (LCA)", (t1: T, t2: T, expected: T) => {
    it(`LCA(${T[t1]}, ${T[t2]}) = ${T[expected]}`, () => {
        expect(T[lowestCommonAncestor(t1, t2)]).toEqual(T[expected]);
    });
});
