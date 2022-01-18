// (C) 2019-2022 GoodData Corporation
export type ExpressionTokenType =
    | "text"
    | "quoted_text"
    | "fact"
    | "metric"
    | "attribute"
    | "label"
    | "comment";

export interface IExpressionToken {
    type: ExpressionTokenType;
    value: string;
}

const REMOVE_BRACKETS_REGEXP = /[[\]{}]/g;
const TOKEN_TYPE_REGEXP_PAIRS: Array<[ExpressionTokenType, RegExp]> = [
    ["text", /^[^#{}[\]"]+/],
    ["quoted_text", /^"(?:[^"\\]|\\"|\\\\.)*"/],
    ["fact", /^\{fact\/[^}]*\}/],
    ["metric", /^\{metric\/[^}]*\}/],
    ["label", /^\{label\/[^}]*\}/],
    ["attribute", /^\{attribute\/[^}]*\}/],
    ["comment", /#[^\n]*/],
];

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
