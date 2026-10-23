// (C) 2021-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { LanguageId } from "../constants.js";

import { convertToSemanticTokens } from "./convert.js";
import { semanticTokensLegend, semanticsFull } from "./semanticsHighlight.js";

const types = new Map(semanticTokensLegend.tokenTypes.map((type, index) => [type, index]));
// save types of some of the symbols so that they can be easily switched if they are changed
types.set("select", types.get(`keyword.${LanguageId}`)!);
types.set("sum", types.get(`function.${LanguageId}`)!);
types.set("count", types.get(`function.${LanguageId}`)!);
types.set("plus", types.get(`operator.${LanguageId}`)!);
types.set("minus", types.get(`operator.${LanguageId}`)!);
types.set("operator", types.get(`operator.${LanguageId}`)!);
types.set("identifier", types.get(`variable.${LanguageId}`)!);
types.set("fact", types.get(`fact.${LanguageId}`)!);
types.set("label", types.get(`label.${LanguageId}`)!);
types.set("metric", types.get(`metric.${LanguageId}`)!);
types.set("dataset", types.get(`dataset.${LanguageId}`)!);
types.set("string", types.get(`string.${LanguageId}`)!);
types.set("number", types.get(`number.${LanguageId}`)!);
types.set("comment", types.get(`comment.${LanguageId}`)!);

function getTextSlice(
    lines: string[],
    token: number[] /* five number tuple */,
    prevLine: number,
    prevChar: number,
): [slice: string, prevLine: number, prevChar: number] {
    const line = prevLine + token[0],
        startChar = token[0] === 0 ? prevChar + token[1] : 0,
        endChar = startChar + token[2];
    const slice = lines[line]?.slice(startChar, endChar);
    return [slice, line, startChar];
}

describe.each([
    ["select", [0, 0, "select".length, types.get("select")!, 0]],
    ["sum", [0, 0, "sum".length, types.get("sum")!, 0]],
    ["{fact/1}", [0, 0, "{fact/1}".length, types.get("fact")!, 0]],
    ["+", [0, 0, "+".length, types.get("plus")!, 0]],
    [
        "select sum",
        [
            0,
            0,
            "select".length,
            types.get("select")!,
            0,
            0,
            "select".length + 1,
            "sum".length,
            types.get("sum")!,
            0,
        ],
    ],
    [
        "select\nselect",
        [0, 0, "select".length, types.get("select")!, 0, 1, 0, "select".length, types.get("select")!, 0],
    ],
    [
        "select {metric/abc} * {metric/def}",
        [
            0,
            0,
            "select".length,
            types.get("select")!,
            0,
            0,
            "select".length + 1,
            "{metric/abc}".length,
            types.get("metric")!,
            0,
            0,
            "{metric/abc}".length + 1,
            "*".length,
            types.get("operator")!,
            0,
            0,
            "*".length + 1,
            "{metric/def}".length,
            types.get("metric")!,
            0,
        ],
    ],
    ['"def"', [0, 0, '"def"'.length, types.get("string")!, 0]],
    [
        "0\n3.1415\n-6",
        [
            0,
            0,
            "0".length,
            types.get("number")!,
            0,
            1,
            0,
            "3.1415".length,
            types.get("number")!,
            0,
            1,
            0,
            "-".length,
            types.get("minus")!,
            0,
            0,
            "-".length,
            "6".length,
            types.get("number")!,
            0,
        ],
    ],
    [
        "# a comment\nSELECT",
        [
            0,
            0,
            "# a comment".length,
            types.get("comment")!,
            0,
            1,
            0,
            "SELECT".length,
            types.get("select")!,
            0,
        ],
    ],
    [
        "select count({dataset/d})",
        [
            // select
            0,
            0,
            "select".length,
            types.get("select")!,
            0,
            // count
            0,
            "select".length + 1,
            "count".length,
            types.get("count")!,
            0,
            // (
            0,
            "count".length,
            "(".length,
            types.get("operator")!,
            0,
            // {dataset/d}
            0,
            "(".length,
            "{dataset/d}".length,
            types.get("dataset")!,
            0,
            // )
            0,
            "{dataset/d}".length,
            ")".length,
            types.get("operator")!,
            0,
        ],
    ],
])("query = %s", (query, expected) => {
    const received = convertToSemanticTokens(semanticsFull(query)).data;
    const lines = query.split("\n");
    let expPrevLine = 0,
        expPrevChar = 0,
        recPrevLine = 0,
        recPrevChar = 0;
    // split the data into 5 number segments for easier debugging
    // index 0 - deltaLine: token line number, relative to the previous token
    // index 1 - deltaStart:  token start character, relative to the previous token
    // index 2 - length: the length of the token.
    // index 3 - tokenType: will be looked up in SemanticTokensLegend.tokenTypes
    // index 4 - tokenModifiers: each set bit will be looked up in SemanticTokensLegend.tokenModifiers
    const chunkSize = 5;
    for (let i = 0; i < received.length; i += chunkSize) {
        const exp: number[] = expected.slice(i, i + chunkSize); // expected token
        const rec: number[] = received.slice(i, i + chunkSize); // received token
        let expSlice: string, recSlice: string;
        [expSlice, expPrevLine, expPrevChar] = getTextSlice(lines, exp, expPrevLine, expPrevChar);
        [recSlice, recPrevLine, recPrevChar] = getTextSlice(lines, rec, recPrevLine, recPrevChar);
        if (!expSlice) expSlice = "**should not exist**";
        it(`semantic token ${(i / chunkSize) | 0} \\ ${expSlice} \\ texts equal`, () => {
            expect(recSlice).toEqual(expSlice);
        });
        it(`semantic token ${(i / chunkSize) | 0} \\ ${expSlice} \\ tokens equal`, () => {
            expect(rec).toEqual(exp);
        });
    }
});

describe("queries to check that no exceptions are triggered", () => {
    it("assumed attribute context with not attributes present", () => {
        const query = "SELECT (...) (BY ...) FOR (...)";
        // oxlint-disable-next-line @typescript-eslint/no-unused-expressions
        convertToSemanticTokens(semanticsFull(query)).data;
    });
});
