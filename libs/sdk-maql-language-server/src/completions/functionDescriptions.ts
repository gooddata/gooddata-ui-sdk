// (C) 2022-2026 GoodData Corporation

import { CompletionItemKind, InsertTextFormat } from "vscode-languageserver";

import {
    type FunctionAstType,
    type FunctionDefinition,
    MaqlParser,
    functionDefinitions,
} from "@gooddata/maql-antlr4ts";

import { type ResolveTag } from "../docs/index.js";
import { getTokenIdFromName } from "../parseMaql.js";
import { transformFunctionDefinition } from "../types/signatures.js";

import { type CompletionDescription } from "./descriptions.js";

type FunctionResolveTags = {
    [astType in FunctionAstType]: {
        [funcName in keyof (typeof functionDefinitions)[astType]]: ResolveTag | undefined;
    };
};

/**
 * Tags for functions to resolve correct documentation
 */
const functionResolveTags: FunctionResolveTags = {
    "time macro": {
        THIS: "time-macros",
        NEXT: "time-macros",
        PREVIOUS: "time-macros",
    },
    function: {
        ABS: "abs",
        APPROXIMATE_COUNT: "approximate_count",
        AVG: "avg",
        CEIL: "ceiling",
        CEILING: "ceiling",
        CORREL: "correl",
        COUNT: "count",
        COVAR: "covariance-functions",
        COVARP: "covariance-functions",
        ROW_NUMBER: "rank-variations",
        RANK: "rank-variations",
        DENSE_RANK: "rank-variations",
        PERCENT_RANK: "rank-variations",
        CUME_DIST: "rank-variations",
        EXP: "exp",
        FIRST_VALUE: "first",
        FLOOR: "floor",
        // "FORECAST": "forecast", // not implemented
        GREATEST: "greatest",
        IFNULL: "ifnull",
        LAST_VALUE: "last",
        LEAST: "least",
        LN: "ln",
        LOG: "log",
        MAX: "max",
        MEDIAN: "median",
        MIN: "min",
        NEXT: "for-next",
        NEXTPERIOD: "for-next-period",
        PERCENTILE: "percentile",
        POWER: "power",
        PREVIOUS: "for-previous",
        PREVIOUSPERIOD: "for-previous-period",
        ROUND: "round",
        RSQ: "least-squares-functions",
        RUNAVG: "running-totals-for-core-functions",
        RUNMAX: "running-totals-for-core-functions",
        RUNMIN: "running-totals-for-core-functions",
        RUNSUM: "running-totals-for-core-functions",
        RUNSTDEV: "running-total-statistical-functions",
        RUNSTDEVP: "running-total-statistical-functions",
        RUNVAR: "running-total-statistical-functions",
        RUNVARP: "running-total-statistical-functions",
        SIGN: "sign",
        SQRT: "sqrt",
        STDEV: "standard-deviation-functions",
        STDEVP: "standard-deviation-functions",
        SUM: "sum",
        TRUNC: "trunc",
        VAR: "variance-functions",
        VARP: "variance-functions",
        DATETIME_ADD: "datetime-add",
        DATETIME_DIFF: "datetime-diff",
        INTERCEPT: undefined,
        SLOPE: undefined,
    },
};

export const functionDescriptions: CompletionDescription[] = Object.entries(functionDefinitions).flatMap(
    ([astType, astDefs]) => {
        return Object.entries(astDefs).flatMap(([name, defs]) => {
            return defs.map((def: FunctionDefinition): CompletionDescription => {
                const signature = transformFunctionDefinition(def, name);
                const ruleId = astType === "time macro" ? MaqlParser.RULE_timeMacroName : undefined;
                return {
                    label: signature.toString(),
                    kind: CompletionItemKind.Function,
                    insertText: name + snippetArgs(signature.parameters.length),
                    insertTextFormat: InsertTextFormat.Snippet,
                    sortText: name,
                    detail: `${name} function (MAQL)`,
                    resolveTag: (
                        functionResolveTags as unknown as Record<string, Record<string, ResolveTag>>
                    )[astType][name],
                    ruleId,
                    triggerTokenId: ruleId ? undefined : getTokenIdFromName(name),
                    maqlType: signature.returns.type,
                };
            });
        });
    },
);

function snippetArgs(count: number): string {
    return labelArgs(
        Array.from(Array(count)).map((_v, idx) => `$${idx + 1}`),
        undefined,
        ")$0",
    );
}

function labelArgs(
    args: string[],
    prefix: string = "(",
    suffix: string = ")",
    separator: string = ", ",
): string {
    return prefix + args.join(separator) + suffix;
}
