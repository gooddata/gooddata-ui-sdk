// (C) 2019-2026 GoodData Corporation

import { type IMeasureExpressionToken } from "@gooddata/sdk-backend-spi";
import { type ObjectType, idRef } from "@gooddata/sdk-model";

export type ExpressionTokenType =
    | "text"
    | "quoted_text"
    | "number"
    | "bracket"
    | "fact"
    | "metric"
    | "attribute"
    | "computed_attribute"
    | "label"
    | "dataset"
    | "parameter"
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
    ["fact", /^\{fact\/[^}]*\}/],
    ["metric", /^\{metric\/[^}]*\}/],
    ["label", /^\{label\/[^}]*\}/],
    ["attribute", /^\{attribute\/[^}]*\}/],
    // computed attributes can be referenced from a metric and from another computed attribute; the
    // brace-delimited patterns are distinct literals, so the order among them does not matter
    ["computed_attribute", /^\{computed_attribute\/[^}]*\}/],
    ["dataset", /^\{dataset\/[^}]*\}/],
    ["parameter", /^\{parameter\/[^}]*\}/],
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

/**
 * MAQL object types that can be resolved to a title, mapped to the JSON:API type of the included
 * object that carries it. They coincide for everything except a computed attribute, whose MAQL
 * token is snake_case while its entity type is camelCase.
 */
const INCLUDED_TYPE_BY_TOKEN_TYPE = {
    metric: "metric",
    fact: "fact",
    attribute: "attribute",
    label: "label",
    dataset: "dataset",
    parameter: "parameter",
    computed_attribute: "computedAttribute",
} as const;

type ResolvableTokenType = keyof typeof INCLUDED_TYPE_BY_TOKEN_TYPE;

const OBJECT_TYPE_BY_TOKEN_TYPE: { [tokenType in ResolvableTokenType]: ObjectType } = {
    metric: "measure",
    fact: "fact",
    attribute: "attribute",
    label: "attribute",
    dataset: "dataSet",
    parameter: "parameter",
    computed_attribute: "computedAttribute",
};

const isResolvableTokenType = (type: string): type is ResolvableTokenType =>
    Object.hasOwn(INCLUDED_TYPE_BY_TOKEN_TYPE, type);

/**
 * Resolves one tokenized MAQL fragment into a display token: a referenced object becomes the title
 * of the included object it points at, everything else stays verbatim.
 *
 * Shared by metrics and computed attributes - both are MAQL expressions whose references are
 * resolved from the same `included` payload.
 *
 * @param regexToken - one token out of {@link tokenizeExpression}
 * @param included - the `included` array of the entity the expression belongs to
 * @param identifier - id of the entity the expression belongs to
 */
export function resolveExpressionToken(
    regexToken: IExpressionToken,
    included: ReadonlyArray<any>,
    identifier: string,
): IMeasureExpressionToken {
    if (
        regexToken.type === "text" ||
        regexToken.type === "quoted_text" ||
        regexToken.type === "comment" ||
        regexToken.type === "number" ||
        regexToken.type === "bracket"
    ) {
        return { type: regexToken.type, value: regexToken.value };
    }

    const [tokenType, objectId] = regexToken.value.split("/");

    if (!isResolvableTokenType(tokenType)) {
        throw new Error(`Cannot resolve title of object type ${tokenType}`);
    }

    const includedType = INCLUDED_TYPE_BY_TOKEN_TYPE[tokenType];
    const includedObject = included.find((object) => object.id === objectId && object.type === includedType);

    return {
        type: OBJECT_TYPE_BY_TOKEN_TYPE[tokenType],
        value: includedObject?.attributes?.title || `${tokenType}/${objectId}`,
        id: objectId,
        ref: idRef(identifier),
    };
}
