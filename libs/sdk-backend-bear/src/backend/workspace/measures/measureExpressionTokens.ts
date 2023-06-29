// (C) 2019-2023 GoodData Corporation
import flow from "lodash/flow.js";
import filter from "lodash/fp/filter.js";
import map from "lodash/fp/map.js";
import uniq from "lodash/fp/uniq.js";

type ExpressionTokenType =
    | "text"
    | "quoted_text"
    | "number"
    | "bracket"
    | "identifier"
    | "uri"
    | "element_uri"
    | "comment";

export interface IExpressionToken {
    type: ExpressionTokenType;
    value: string;
}

const REMOVE_BRACKETS_REGEXP = /[[\]{}]/g;
const TOKEN_TYPE_REGEXP_PAIRS: Array<[ExpressionTokenType, RegExp]> = [
    ["text", /^[^#{}[\]"()0-9.]+/],
    ["quoted_text", /^"(?:[^"\\]|\\"|\\'|\\\\.)*"/],
    ["number", /^[+-]?((\d+(\.\d*)?)|(\.\d+))/],
    ["bracket", /^[()]+/],
    ["identifier", /^\{[^}]+\}/],
    ["element_uri", /^\[[a-zA-Z0-9\\/]+elements\?id=\d+\]/],
    ["uri", /^\[[a-zA-Z0-9\\/]+\]/],
    ["comment", /#[^\n]*/],
];

export const getTokenValuesOfType = (tokenType: ExpressionTokenType, tokens: IExpressionToken[]): string[] =>
    flow(
        filter((token: IExpressionToken) => token.type === tokenType),
        map((token) => token.value),
        uniq,
    )(tokens);

export const tokenizeExpression = (expression: string): IExpressionToken[] => {
    const tokens: IExpressionToken[] = [];

    let _expression = expression;
    while (_expression.length) {
        let match;

        for (const [type, regExp] of TOKEN_TYPE_REGEXP_PAIRS) {
            match = _expression.match(regExp);

            if (match) {
                const [value] = match;
                tokens.push({ type, value });
                _expression = _expression.substr(value.length);
                break;
            }
        }

        if (!match) {
            throw new Error(`Unable to match token, rest of output is: "${_expression}"`);
        }
    }

    return tokens.map((token) => ({
        ...token,
        value: token.type === "comment" ? token.value : token.value.replace(REMOVE_BRACKETS_REGEXP, ""),
    }));
};
