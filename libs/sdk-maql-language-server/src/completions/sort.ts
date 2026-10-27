// (C) 2022-2026 GoodData Corporation

import { type CompletionItemKind, type CompletionList } from "vscode-languageserver";

import type { AstNode, FunctionNode } from "@gooddata/maql-antlr4ts";

import { Kind } from "./descriptions.js";
import { type ICaretContext } from "./findContext.js";

const defaultPrefix = "90__";

const sortPrefixes: { [key in CompletionItemKind]?: string } = {
    [Kind.LabelElement]: "00__",
    [Kind.Attribute]: "20__",
    //    [Kind.Label]: "20__", // this is the same as Kind.Label is the same as Kind.Attribute
    [Kind.Dataset]: "21__",
    [Kind.Fact]: "22__",
    [Kind.Metric]: "25__",
    [Kind.Granularity]: "30__",
    [Kind.Function]: "40__",
    [Kind.Keyword]: "41__",
    [Kind.Boolean]: "42__",
    [Kind.Operator]: "99__",
};

function getFunctionSortTemplate(
    functionName: string,
    prefixes: (order: CompletionItemKind[]) => { [key in CompletionItemKind]?: string },
) {
    // Handle IFNULL function
    if (functionName === "IFNULL") {
        return prefixes([Kind.Metric, Kind.Function]);
    }

    // Handle statistical functions
    const statisticalFunctions = [
        "CORREL",
        "COVAR",
        "COVARP",
        "FORECAST",
        "RSQ",
        "STDEV",
        "STDEVP",
        "VAR",
        "VARP",
    ];

    if (statisticalFunctions.includes(functionName)) {
        return prefixes([Kind.Fact, Kind.Metric]);
    }

    // Default case for other functions
    return prefixes([Kind.Granularity, Kind.Label, Kind.Fact, Kind.Metric, Kind.Function]);
}

export function adjustSortText(list: CompletionList, context: ICaretContext) {
    let template: { [key in CompletionItemKind]?: string } = Object.assign({}, sortPrefixes);
    const prefixes = (order: CompletionItemKind[]) =>
        order.reduce(
            (prev, curr, idx) => ({
                ...prev,
                [curr]: `${String(idx + 1).padStart(2, "0")}__`,
            }),
            template,
        );
    // Find the lowest non-empty (therefore complete and valid) AST node if such exists
    const lowestNode: AstNode | undefined = context.nodeStack.find((node) => node.type !== "");
    switch (lowestNode?.type) {
        case "metric":
            template = prefixes([Kind.Function, Kind.Metric, Kind.Fact]);
            break;
        case "and":
        case "or":
        case "not":
            template = prefixes([Kind.Label, Kind.Metric, Kind.Fact]);
            break;
        case "case":
        case "when":
            template = prefixes([Kind.Metric, Kind.Fact, Kind.Label, Kind.Function]);
            break;
        case "where":
        case "having":
            template = prefixes([Kind.Label, Kind.Metric, Kind.Fact, Kind.Function]);
            break;
        case "by":
            template = prefixes([Kind.Dataset, Kind.Label, Kind.Keyword]);
            break;
        case "+":
        case "=":
        case "/":
        case "*":
            template = prefixes([Kind.Fact, Kind.Metric]);
            break;
        case "function":
        case "time macro":
            template = getFunctionSortTemplate((lowestNode as FunctionNode).name, prefixes);
            break;
    }
    list.items = list.items.map((it) => {
        const prefix: string = it.kind ? (template[it.kind] ?? defaultPrefix) : defaultPrefix;
        return {
            ...it,
            sortText: prefix + (it.sortText ?? it.label),
            preselect: true, // a hack to force the client to use sortText
        };
    });
    return list;
}
