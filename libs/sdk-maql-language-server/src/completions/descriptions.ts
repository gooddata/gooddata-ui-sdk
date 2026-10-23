// (C) 2021-2026 GoodData Corporation

import { type CompletionItem, CompletionItemKind, InsertTextFormat } from "vscode-languageserver";

import MaqlPkg from "@gooddata/maql-antlr4ts";
const { MaqlParser } = MaqlPkg;

import { errorTokens } from "../diagnostics.js";
import { type ResolveTag } from "../docs/index.js";
import { getTokenIdFromName } from "../parseMaql.js";
import { MaqlType } from "../types/hierarchy.js";

import { functionDescriptions } from "./functionDescriptions.js";

/**
 * Maps concepts from MAQL to completionItemKind values
 */
export const Kind = {
    Attribute: CompletionItemKind.Enum,
    Label: CompletionItemKind.Enum,
    Metric: CompletionItemKind.Variable,
    Parameter: CompletionItemKind.Value,
    Fact: CompletionItemKind.Field,
    Dataset: CompletionItemKind.Constant,
    LabelElement: CompletionItemKind.Text,
    Function: CompletionItemKind.Function,
    Keyword: CompletionItemKind.Keyword,
    Operator: CompletionItemKind.Operator,
    Boolean: CompletionItemKind.Value,
    Granularity: CompletionItemKind.EnumMember,
    Snippet: CompletionItemKind.Snippet,
};

/**
 * CompletionDescription - CompletionItem with additional information so that it can be offered appropriately
 */
export type CompletionDescription = CompletionItem & ICompletionMaqlData;

/**
 * Data that links a completion item to documentation and MAQL parser objects
 * Either triggerTokenId or ruleId must be set
 */
export interface ICompletionMaqlData {
    resolveTag?: ResolveTag;
    triggerTokenId?: number;
    ruleId?: number;
    maqlType?: MaqlType;
}

/**
 * Tokens that will not generate any completion items
 * Note that this can be overwritten by creating a CompletionDescription that triggers on that token
 */
export const ignoredTokens = new Set([
    MaqlParser.String,
    MaqlParser.OVER,
    MaqlParser.TO,
    MaqlParser.LPAREN,
    MaqlParser.LBRACE,
    MaqlParser.ID,
    MaqlParser.SEP,
    MaqlParser.RBRACE,
    MaqlParser.ZERO,
    MaqlParser.Natural,
    MaqlParser.Real,
    MaqlParser.COMMA,
    MaqlParser.METRIC_TYPE,
    MaqlParser.ATTRIBUTE,
    MaqlParser.COMPUTED_ATTRIBUTE_OBJECT,
    MaqlParser.LABEL,
    MaqlParser.DATASET,
    MaqlParser.PROMPT,
    MaqlParser.PARAMETER,
    MaqlParser.FACT,
    MaqlParser.LOCAL,
    MaqlParser.WS,
    MaqlParser.Comment,
    MaqlParser.REPORT,
    MaqlParser.METRIC,
    MaqlParser.SEMICOLON,
    MaqlParser.EOF,
    MaqlParser.NEXT,
    MaqlParser.PREVIOUS,
    MaqlParser.THIS,
    // fiscal granularities below are parsed by the grammar but not yet fully
    // delivered in the product, so they are hidden from completion suggestions
    MaqlParser.FISCALWEEK,
    MaqlParser.FISCALSEMESTER,
    MaqlParser.FISCALDAYOFFISCALWEEK,
    MaqlParser.FISCALDAYOFFISCALMONTH,
    MaqlParser.FISCALDAYOFFISCALQUARTER,
    MaqlParser.FISCALDAYOFFISCALSEMESTER,
    MaqlParser.FISCALDAYOFFISCALYEAR,
    MaqlParser.FISCALWEEKOFFISCALMONTH,
    MaqlParser.FISCALWEEKOFFISCALQUARTER,
    MaqlParser.FISCALWEEKOFFISCALSEMESTER,
    MaqlParser.FISCALWEEKOFFISCALYEAR,
    MaqlParser.FISCALMONTHOFFISCALQUARTER,
    MaqlParser.FISCALMONTHOFFISCALSEMESTER,
    MaqlParser.FISCALMONTHOFFISCALYEAR,
    MaqlParser.FISCALQUARTEROFFISCALSEMESTER,
    MaqlParser.FISCALQUARTEROFFISCALYEAR,
    MaqlParser.FISCALSEMESTEROFFISCALYEAR,
    ...errorTokens,
]);

export const descriptions: CompletionDescription[] = [
    ...functionDescriptions,
    desc("%", Kind.Operator, "PERCENT operator (MAQL)"),
    desc("()", Kind.Operator),
    desc(")", Kind.Operator),
    desc("*", Kind.Operator, "MULTIPLICATION operator (MAQL)", "arithmetic-operations", undefined, " "),
    desc("+", Kind.Operator, "PLUS operator (MAQL)", "arithmetic-operations", undefined, " "),
    desc("-", Kind.Operator, "MINUS operator (MAQL)", "arithmetic-operations", undefined, " "),
    desc("/", Kind.Operator, "DIVISION operator (MAQL)", "arithmetic-operations", undefined, " "),
    desc("<", Kind.Operator, "LESSER filtering operator (MAQL)", "relational-operators", undefined, " "),
    desc(
        "<=",
        Kind.Operator,
        "LESSER OR EQUAL filtering operator (MAQL)",
        "relational-operators",
        undefined,
        " ",
    ),
    desc(
        "<>",
        Kind.Operator,
        "DOES NOT EQUAL filtering operator (MAQL)",
        "relational-operators",
        undefined,
        " ",
    ),
    desc("=", Kind.Operator, "EQUALS filtering operator (MAQL)", "relational-operators", undefined, " "),
    desc(">", Kind.Operator, "GREATER filtering operator (MAQL)", "relational-operators", undefined, " "),
    desc(
        ">=",
        Kind.Operator,
        "GREATER OR EQUAL filtering operator (MAQL)",
        "relational-operators",
        undefined,
        " ",
    ),
    desc("ALL", Kind.Keyword, "ALL keyword (MAQL)", "by-all", undefined, " "),
    desc("AND", Kind.Keyword, "AND logical operator (MAQL)", "and", undefined, " "),
    desc("ASC", Kind.Keyword, "ASC keyword (MAQL)", undefined, undefined, " "),
    desc("BETWEEN", Kind.Keyword, "BETWEEN keyword (MAQL)", "relational-operators", undefined, " "),
    desc(
        "ALL OTHER EXCEPT",
        Kind.Keyword,
        "ALL OTHER EXCEPT clause (MAQL)",
        "by-all-in-all-other-dimensions-except-for-attribute",
        undefined,
        " ",
    ),
    desc("ALL OTHER", Kind.Keyword, "ALL OTHER clause (MAQL)", "by-all-in-all-other-dimensions", undefined),
    desc("BY", Kind.Keyword, "BY keyword (MAQL)", "by", undefined, " "),
    desc("CASE", Kind.Keyword, "CASE keyword (MAQL)", "case", undefined, " "),
    desc("COMPUTED ATTRIBUTE", Kind.Keyword, "COMPUTED ATTRIBUTE keyword (MAQL)", undefined, undefined, " "),
    desc("CURRENT", Kind.Keyword, "CURRENT keyword (MAQL)", undefined, undefined, ""),
    desc("DESC", Kind.Keyword, "DESC keyword (MAQL)", undefined, undefined, " "),
    desc("DIMENSIONS", Kind.Keyword, "DIMENSIONS keyword (MAQL)", undefined, undefined, " "),
    desc("ELSE", Kind.Keyword, "ELSE keyword (MAQL)", undefined, undefined, " "),
    desc("END", Kind.Keyword, "END keyword (MAQL)", undefined, undefined, " "),
    desc("EXCEPT", Kind.Keyword, "EXCEPT keyword (MAQL)", undefined, undefined, " "),
    desc("FILTER", Kind.Keyword, "FILTER keyword (MAQL)", undefined, undefined, " "),
    desc("FOLLOWING", Kind.Keyword, "FOLLOWING keyword (MAQL)", undefined, undefined, " "),
    desc("FOR", Kind.Keyword, "FOR keyword (MAQL)", undefined, undefined, " "),
    desc("FOR EACH", Kind.Keyword, "FOR EACH keyword (MAQL)", "for-each", undefined, " "),
    desc("EACH", Kind.Keyword, "FOR EACH keyword (MAQL)", "for-each", undefined, " "),
    desc("HAVING", Kind.Keyword, "HAVING keyword (MAQL)", "filtering-with-the-having-clause", undefined, " "),
    desc("IF", Kind.Keyword, "IF keyword (MAQL)", "if-then-else", undefined, " "),
    desc("ILIKE", Kind.Keyword, "ILIKE keyword (MAQL)", "filtering-with-the-like-clause", undefined, " "),
    desc("LIKE", Kind.Keyword, "LIKE keyword (MAQL)", "filtering-with-the-like-clause", undefined, " "),
    desc("METRIC", Kind.Keyword, "METRIC keyword (MAQL)", undefined, undefined, " "),
    desc("NOT", Kind.Keyword, "NOT keyword (MAQL)", "not", undefined, " "),
    desc("NULL", Kind.Keyword, "NULL keyword (MAQL)", undefined, undefined, " "),
    desc("OR", Kind.Keyword, "OR logical operator (MAQL)", "or", undefined, " "),
    desc("OTHER", Kind.Keyword, "OTHER keyword (MAQL)", undefined, undefined),
    desc("ORDER BY", Kind.Keyword, "ORDER BY keyword (MAQL)", undefined, undefined, " "),
    desc("PARENT FILTER", Kind.Keyword, "PARENT FILTER keyword (MAQL)", undefined, undefined, " "),
    desc("PARENT", Kind.Keyword, "PARENT keyword (MAQL)", undefined, undefined, " "),
    desc("PARSE", Kind.Keyword, "PARSE keyword (MAQL)", undefined, undefined, " "),
    desc("PF", Kind.Keyword, "PF keyword (MAQL)", undefined, undefined, " "),
    desc("PRECEDING", Kind.Keyword, "PRECEDING keyword (MAQL)", undefined, undefined, " "),
    desc("ROW", Kind.Keyword, "ROW keyword (MAQL)", undefined, undefined, " "),
    desc("ROWS", Kind.Keyword, "ROWS keyword (MAQL)", undefined, undefined, " "),
    desc("SELECT", Kind.Keyword, "SELECT keyword (MAQL)", undefined, undefined, " "),
    desc("THEN", Kind.Keyword, "THEN keyword (MAQL)", undefined, undefined, " "),
    desc("UNBOUNDED", Kind.Keyword, "UNBOUNDED keyword (MAQL)", undefined, undefined, " "),
    desc("USING", Kind.Keyword, "USING keyword (MAQL)", undefined, undefined, " "),
    desc("WHEN", Kind.Keyword, "WHEN keyword (MAQL)", undefined, undefined, " "),
    desc("WHERE", Kind.Keyword, "WHERE keyword (MAQL)", "filtering-with-the-where-clause", undefined, " "),
    desc("WITH", Kind.Keyword, "WITH keyword (MAQL)", "with-parent-filter", undefined, " "),
    desc("WITHOUT", Kind.Keyword, "WITHOUT keyword (MAQL)", "without-parent-filter", undefined, " "),
    booleanDesc("FALSE"),
    booleanDesc("TRUE"),
    granularityDesc("SECOND", MaqlType.CHRONOLOGICAL_GRANULARITY),
    granularityDesc("MINUTE", MaqlType.CHRONOLOGICAL_GRANULARITY),
    granularityDesc("DAY", MaqlType.CHRONOLOGICAL_GRANULARITY),
    granularityDesc("HOUR", MaqlType.CHRONOLOGICAL_GRANULARITY),
    granularityDesc("WEEK", MaqlType.CHRONOLOGICAL_GRANULARITY),
    granularityDesc("MONTH", MaqlType.CHRONOLOGICAL_GRANULARITY),
    granularityDesc("QUARTER", MaqlType.CHRONOLOGICAL_GRANULARITY),
    granularityDesc("YEAR", MaqlType.CHRONOLOGICAL_GRANULARITY),
    granularityDesc("FISCALMONTH", MaqlType.CHRONOLOGICAL_GRANULARITY),
    granularityDesc("FISCALQUARTER", MaqlType.CHRONOLOGICAL_GRANULARITY),
    granularityDesc("FISCALYEAR", MaqlType.CHRONOLOGICAL_GRANULARITY),
    granularityDesc("SECONDOFMINUTE", MaqlType.PERIODICAL_GRANULARITY),
    granularityDesc("SECONDOFDAY", MaqlType.PERIODICAL_GRANULARITY),
    granularityDesc("MINUTEOFHOUR", MaqlType.PERIODICAL_GRANULARITY),
    granularityDesc("MINUTEOFDAY", MaqlType.PERIODICAL_GRANULARITY),
    granularityDesc("HOUROFDAY", MaqlType.PERIODICAL_GRANULARITY),
    granularityDesc("DAYOFWEEK", MaqlType.PERIODICAL_GRANULARITY),
    granularityDesc("DAYOFMONTH", MaqlType.PERIODICAL_GRANULARITY),
    granularityDesc("DAYOFQUARTER", MaqlType.PERIODICAL_GRANULARITY),
    granularityDesc("DAYOFYEAR", MaqlType.PERIODICAL_GRANULARITY),
    granularityDesc("WEEKOFYEAR", MaqlType.PERIODICAL_GRANULARITY),
    granularityDesc("MONTHOFYEAR", MaqlType.PERIODICAL_GRANULARITY),
    granularityDesc("QUARTEROFYEAR", MaqlType.PERIODICAL_GRANULARITY),
    objectDesc(
        "label",
        undefined,
        "LABEL object (MAQL)",
        undefined,
        MaqlParser.RULE_attribute,
        Kind.Label,
        MaqlType.STRING_AND_DATE,
    ),
    objectDesc(
        "computed_attribute",
        undefined,
        "COMPUTED_ATTRIBUTE object (MAQL)",
        undefined,
        MaqlParser.RULE_attribute,
        Kind.Attribute,
        MaqlType.STRING,
    ),
    objectDesc(
        "dataset",
        undefined,
        "DATASET object (MAQL)",
        undefined,
        MaqlParser.RULE_attribute,
        Kind.Dataset,
        MaqlType.DATASET,
    ),
    objectDesc(
        "fact",
        undefined,
        "FACT object (MAQL)",
        undefined,
        MaqlParser.RULE_numeric,
        Kind.Fact,
        MaqlType.NUMERIC,
    ),
    objectDesc("metric", undefined, "METRIC object (MAQL)", undefined, MaqlParser.RULE_numeric, Kind.Metric),
    objectDesc(
        "parameter",
        undefined,
        "PARAMETER object (MAQL)",
        undefined,
        MaqlParser.RULE_parameter,
        Kind.Parameter,
        MaqlType.NUMERIC,
    ),
    // This description does not have an appropriate trigger place, disable for now
    // {
    //     label: "BY attribute ALL OTHER",
    //     kind: Kind.Snippet,
    //     insertTextFormat: InsertTextFormat.Snippet,
    //     insertText: "BY ${1:attribute} ALL OTHER $0",
    //     detail: "BY attribute ALL OTHER clause (MAQL)",
    //     resolveTag: "by-attribute-all-in-all-other-dimensions",
    //     ruleId: MaqlParser.RULE_by,
    // },
    {
        label: "WITHIN(DIMENSIONS)",
        kind: Kind.Snippet,
        insertTextFormat: InsertTextFormat.Snippet,
        insertText: "WITHIN($1)$0",
        sortText: "WITHIN",
        detail: "WITHIN clause (MAQL)",
        resolveTag: "within-clause",
        triggerTokenId: getTokenIdFromName("WITHIN"),
    },
    {
        label: "BOTTOM(NUMERIC) ... -> BOOLEAN",
        kind: Kind.Function,
        insertTextFormat: InsertTextFormat.Snippet,
        insertText: "BOTTOM($1)$0",
        sortText: "BOTTOM",
        detail: "BOTTOM ranking filter (MAQL)",
        resolveTag: "filtering-with-ranking-filters",
        triggerTokenId: getTokenIdFromName("BOTTOM"),
        maqlType: MaqlType.BOOLEAN,
    },
    {
        label: "TOP(NUMERIC) ... -> BOOLEAN",
        kind: Kind.Function,
        insertTextFormat: InsertTextFormat.Snippet,
        insertText: "TOP($1)$0",
        sortText: "TOP",
        detail: "TOP ranking filter (MAQL)",
        resolveTag: "filtering-with-ranking-filters",
        triggerTokenId: getTokenIdFromName("TOP"),
        maqlType: MaqlType.BOOLEAN,
    },
    {
        label: "IF ... THEN ... ELSE ... END",
        kind: Kind.Snippet,
        insertTextFormat: InsertTextFormat.Snippet,
        insertText: "IF $1 THEN $2 ELSE $3 END",
        sortText: "IF THEN ELSE",
        detail: "IF THEN ELSE conditional statement (MAQL)",
        resolveTag: "if-then-else",
        triggerTokenId: getTokenIdFromName("IF"),
    },
    {
        label: "IN (...)", // TODO: IN disambiguation (TOP IN, object IN (...))
        kind: Kind.Keyword,
        insertTextFormat: InsertTextFormat.Snippet,
        insertText: "IN ($1)$0",
        detail: "IN keyword (MAQL)",
        resolveTag: "relational-operators",
        triggerTokenId: getTokenIdFromName("IN"),
    },
    {
        label: "OF (...)",
        kind: Kind.Keyword,
        insertTextFormat: InsertTextFormat.Snippet,
        insertText: "OF ($1)$0",
        detail: "OF keyword (MAQL)",
        resolveTag: "where-top-or-bottom-of",
        triggerTokenId: getTokenIdFromName("OF"),
    },
];

function desc(
    label: string,
    kind: CompletionItemKind,
    detail?: string,
    resolveTag?: ResolveTag,
    insertPrefix?: string,
    insertSuffix?: string,
    ruleId?: number,
    maqlType?: MaqlType,
): CompletionDescription {
    return {
        label,
        kind,
        insertText: (insertPrefix ?? "") + label + (insertSuffix ?? ""),
        detail,
        resolveTag,
        triggerTokenId: getTokenIdFromName(label),
        ruleId,
        maqlType,
    };
}

function booleanDesc(value: string): CompletionDescription {
    return {
        label: value,
        kind: Kind.Boolean,
        insertText: value,
        triggerTokenId: getTokenIdFromName(value),
        maqlType: MaqlType.BOOLEAN,
    };
}

type ANY_GRANULARITY =
    | MaqlType.GRANULARITY
    | MaqlType.CHRONOLOGICAL_GRANULARITY
    | MaqlType.PERIODICAL_GRANULARITY;

function granularityDesc(name: string, type: ANY_GRANULARITY): CompletionDescription {
    return {
        label: name,
        kind: Kind.Granularity,
        insertText: name,
        detail: name + " time granularity (MAQL)",
        triggerTokenId: getTokenIdFromName(name),
        maqlType: type,
    };
}

function objectDesc(
    type: string,
    id: string | undefined = undefined,
    detail: string | undefined = undefined,
    resolveTag: ResolveTag | undefined = undefined,
    ruleId: number | undefined,
    kind: CompletionItemKind,
    maqlType?: MaqlType,
): CompletionDescription {
    const format = id ? InsertTextFormat.PlainText : InsertTextFormat.Snippet;
    return {
        label: `${type}/${id ?? "$identifier"}`,
        kind,
        insertText: `{${type}/${id ?? "${1:identifier}"}}`,
        insertTextFormat: format,
        filterText: `{ ${type} / }`,
        sortText: `{${type}/}`,
        detail,
        resolveTag,
        ruleId,
        maqlType,
    };
}
