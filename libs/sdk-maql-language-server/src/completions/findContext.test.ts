// (C) 2021-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type AstType, type IPosition, MaqlParser } from "@gooddata/maql-antlr4ts";

import { MaqlMetric } from "../parseMaql.js";
import { MaqlType } from "../types/hierarchy.js";

import { findContext } from "./findContext.js";

describe("query context tests", () => {
    it.each([
        [
            "nested function",
            "SELECT SUM(COUNT())",
            "SELECT SUM(COUNT(".length,
            [MaqlParser.RPAREN, MaqlParser.RPAREN, MaqlParser.RPAREN],
            ["", "function", "function", "metric"] as AstType[],
            [MaqlType.DATE, MaqlType.DATASET, MaqlType.STRING],
        ],
        [
            "caret at EOF",
            "SELECT ",
            "SELECT ".length,
            [MaqlParser.EOF, MaqlParser.EOF, MaqlParser.EOF],
            ["", "metric"] as AstType[],
            [MaqlType.ANY],
        ],
        [
            "object starting with '{'",
            "SELECT SUM({fact)",
            "SELECT SUM({fact".length,
            [MaqlParser.LPAREN, MaqlParser.UNKNOWN_TYPE, MaqlParser.EOF],
            ["", "function", "metric"] as AstType[],
            [MaqlType.NUMERIC],
        ],
        [
            "object starting with object id",
            "SELECT MAX(Price)",
            "SELECT MAX(Price".length,
            [MaqlParser.LPAREN, MaqlParser.Identifier, MaqlParser.RPAREN],
            ["function", "function", "metric"] as AstType[],
            [MaqlType.NUMERIC, MaqlType.STRING, MaqlType.DATE],
        ],
        [
            "second argument of MAX function",
            "SELECT MAX({label/date.day},)",
            "SELECT MAX({label/date.day},".length,
            [MaqlParser.RPAREN, MaqlParser.RPAREN, MaqlParser.RPAREN],
            ["function", "metric"] as AstType[],
            [MaqlType.DATASET, MaqlType.STRING],
        ],
        [
            "almost completed object",
            "SELECT AVG({fact/example)",
            "SELECT AVG({fact/example".length,
            [MaqlParser.LPAREN, MaqlParser.ID, MaqlParser.EOF],
            ["identifier", "function", "metric"] as AstType[],
            [MaqlType.NUMERIC],
        ],
        [
            "middle of function",
            "SELECT DATETIME_ADD( , ,)",
            "SELECT DATETIME_ADD(".length,
            [MaqlParser.WS, MaqlParser.WS, MaqlParser.WS],
            ["", "function", "metric"] as AstType[],
            [MaqlType.DATE],
        ],
        [
            "inner select",
            "SELECT SUM(SELECT {metric/revenue} BY {})",
            "SELECT SUM(SELECT {metric/revenue} BY {".length,
            [MaqlParser.WS, MaqlParser.LBRACE, MaqlParser.RPAREN],
            ["identifier", "by", "metric", "function", "metric"] as AstType[],
            [MaqlType.ANY],
        ],
        [
            "arithmetic",
            "SELECT ABS(10 + 20 - 30 + 4",
            "SELECT ABS(10 + 20 - 30 + 4".length,
            [MaqlParser.EOF, MaqlParser.EOF, MaqlParser.EOF],
            ["number", "+", "function", "metric"] as AstType[],
            [MaqlType.ANY],
        ],
        [
            "order by dataset",
            "SELECT LAST_VALUE({fact/campaign_channels.spend}) ORDER BY ",
            "SELECT LAST_VALUE({fact/campaign_channels.spend}) ORDER BY ".length,
            [MaqlParser.EOF, MaqlParser.EOF, MaqlParser.EOF],
            ["", "order by element", "order by", "lastfirstvalue function", "metric"] as AstType[],
            [MaqlType.NUMERIC, MaqlType.STRING, MaqlType.DATE],
        ],
    ])(
        "%s",
        (
            _desc: string,
            query: string,
            offset: number,
            tokens: number[],
            nodeStackTypes: AstType[],
            types: MaqlType[],
        ) => {
            const metric = new MaqlMetric(query);
            const realOffset = MaqlMetric.offset(offset);
            const position: IPosition = { line: 1, character: offset };
            const context = findContext(metric, position, realOffset);
            const tokenName = (id: number) => MaqlParser.VOCABULARY.getSymbolicName(id);
            const { leftFinalToken, caretToken, rightFinalToken } = context.tokens;
            const actualNodeStackType = context.nodeStack.map((node) => node.type);
            const actualTypes = context.expectedTypes.map((type) => MaqlType[type]);
            expect(actualNodeStackType).toEqual(nodeStackTypes);
            expect(actualTypes.sort()).toEqual(types.map((type) => MaqlType[type]).sort());
            expect([
                tokenName(leftFinalToken.type),
                tokenName(caretToken.type),
                tokenName(rightFinalToken.type),
            ]).toEqual([tokenName(tokens[0]), tokenName(tokens[1]), tokenName(tokens[2])]);
        },
    );
});
