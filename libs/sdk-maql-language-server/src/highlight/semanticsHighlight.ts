// (C) 2021-2026 GoodData Corporation

import { type CommonTokenStream, type ParserRuleContext, type Token } from "antlr4ts";
import {
    type ErrorNode,
    type ParseTreeListener,
    ParseTreeWalker,
    type TerminalNode,
} from "antlr4ts/tree/index.js";
import { type Range, type SemanticTokensLegend } from "vscode-languageserver";

import MaqlPkg, {
    type AttributeContext,
    type FactContext,
    type MaqlParserListener,
    type NumericContext,
    type ObjectContext,
    type ParameterContext,
} from "@gooddata/maql-antlr4ts";
const { AttributeTypeContext, MaqlLexer, NumericTypeContext } = MaqlPkg;

import { LanguageId } from "../constants.js";
import { MaqlMetric } from "../parseMaql.js";
import { antlrContextRange } from "../tokenRanges.js";

/**
 * @internal
 */
export enum TokenTypes {
    Type,
    Keyword,
    Function,
    Operator,
    Number,
    Variable,
    String,
    Comment,
    Label,
    Fact,
    Metric,
    Dataset,
}

/**
 * @internal
 */
export enum ModifierTypes {
    Deprecated,
}

/**
 * @internal
 */
export const TokenTypesList = Object.values(TokenTypes).filter(
    (value: number | string) => typeof value === "string",
);

/**
 * @internal
 */
export const ModifierTypesList = Object.values(ModifierTypes).filter(
    (value: number | string) => typeof value === "string",
);

/**
 * @internal
 */
export const semanticTokensLegend: SemanticTokensLegend = {
    tokenTypes: TokenTypesList.map(mapToken),
    tokenModifiers: ModifierTypesList.map(mapToken),
};

function mapToken(value: string): string {
    return `${value.toLowerCase()}.${LanguageId}`;
}

const KEYWORD_TOKENS: number[] = [
    MaqlLexer.PARSE,
    MaqlLexer.SELECT,
    MaqlLexer.CASE,
    MaqlLexer.REPORT,
    MaqlLexer.METRIC,
    MaqlLexer.IF,
    MaqlLexer.WITHIN,
    MaqlLexer.CURRENT,
    MaqlLexer.ROWS,
    MaqlLexer.BY,
    MaqlLexer.WHERE,
    MaqlLexer.HAVING,
    MaqlLexer.USING,
    MaqlLexer.WITH,
    MaqlLexer.PF,
    MaqlLexer.PARENT,
    MaqlLexer.FILTER,
    MaqlLexer.EXCEPT,
    MaqlLexer.WITHOUT,
    MaqlLexer.OTHER,
    MaqlLexer.ORDER,
    MaqlLexer.ALL,
    MaqlLexer.IN,
    MaqlLexer.DIMENSIONS,
    MaqlLexer.BETWEEN,
    MaqlLexer.NOT,
    MaqlLexer.OF,
    MaqlLexer.LIKE,
    MaqlLexer.ILIKE,
    MaqlLexer.FOR,
    MaqlLexer.EACH,
    MaqlLexer.NEXT,
    MaqlLexer.NEXTPERIOD,
    MaqlLexer.PREVIOUS,
    MaqlLexer.PREVIOUSPERIOD,
    MaqlLexer.TOP,
    MaqlLexer.BOTTOM,
    MaqlLexer.THIS,
    MaqlLexer.ASC,
    MaqlLexer.DESC,
    MaqlLexer.UNBOUNDED,
    MaqlLexer.PRECEDING,
    MaqlLexer.FOLLOWING,
    MaqlLexer.ROW,
    MaqlLexer.WHEN,
    MaqlLexer.THEN,
    MaqlLexer.ELSE,
    MaqlLexer.END,
    MaqlLexer.OVER,
    MaqlLexer.TO,
    // date granularities
    MaqlLexer.SECOND,
    MaqlLexer.SECONDOFMINUTE,
    MaqlLexer.SECONDOFDAY,
    MaqlLexer.MINUTEOFDAY,
    MaqlLexer.DAY,
    MaqlLexer.DAYOFWEEK,
    MaqlLexer.DAYOFMONTH,
    MaqlLexer.DAYOFQUARTER,
    MaqlLexer.DAYOFYEAR,
    MaqlLexer.HOUR,
    MaqlLexer.HOUROFDAY,
    MaqlLexer.MINUTE,
    MaqlLexer.MINUTEOFHOUR,
    MaqlLexer.MONTH,
    MaqlLexer.MONTHOFYEAR,
    MaqlLexer.QUARTER,
    MaqlLexer.QUARTEROFYEAR,
    MaqlLexer.YEAR,
    MaqlLexer.WEEK,
    MaqlLexer.WEEKOFYEAR,
    MaqlLexer.FISCALMONTH,
    MaqlLexer.FISCALQUARTER,
    MaqlLexer.FISCALYEAR,
    // true, false
    MaqlLexer.TRUE,
    MaqlLexer.FALSE,
    // logical operators
    MaqlLexer.OR,
    MaqlLexer.AND,
    // null
    MaqlLexer.NULL,
];

const FUNCTION_TOKENS: number[] = [
    // functions
    MaqlLexer.Identifier,
    // rank functions, rankfuncname
    MaqlLexer.ROW_NUMBER,
    MaqlLexer.RANK,
    MaqlLexer.DENSE_RANK,
    MaqlLexer.PERCENT_RANK,
    MaqlLexer.CUME_DIST,
    // run functions
    MaqlLexer.RUNAVG,
    MaqlLexer.RUNSUM,
    MaqlLexer.RUNMAX,
    MaqlLexer.RUNMIN,
    MaqlLexer.RUNVAR,
    MaqlLexer.RUNVARP,
    MaqlLexer.RUNSTDEV,
    MaqlLexer.RUNSTDEVP,
    // lastfirst value functions
    MaqlLexer.LAST_VALUE,
    MaqlLexer.FIRST_VALUE,
];

const OPERATOR_TOKENS: number[] = [
    // base operators
    MaqlLexer.PLUS,
    MaqlLexer.MINUS,
    MaqlLexer.MUL,
    MaqlLexer.DIV,
    MaqlLexer.PERCENT,
    // relational operators
    MaqlLexer.RELOP,
    // punctuation
    MaqlLexer.COMMA,
    MaqlLexer.SEMICOLON,
    MaqlLexer.LPAREN,
    MaqlLexer.RPAREN,
];

const NUMBER_TOKENS: number[] = [MaqlLexer.ZERO, MaqlLexer.Natural, MaqlLexer.Real];

const IDENTIFIER_TOKENS: number[] = [
    // braces: { , }
    MaqlLexer.LBRACE,
    MaqlLexer.RBRACE,
    // types
    MaqlLexer.ATTRIBUTE,
    MaqlLexer.COMPUTED_ATTRIBUTE_OBJECT,
    MaqlLexer.FACT,
    MaqlLexer.METRIC_TYPE,
    MaqlLexer.LABEL,
    MaqlLexer.LOCAL,
    MaqlLexer.PROMPT,
    MaqlLexer.PARAMETER,
    MaqlLexer.UNKNOWN_TYPE,
    // separator
    MaqlLexer.SEP,
    // identifiers
    MaqlLexer.ID,
];

const STRING_TOKENS: number[] = [MaqlLexer.String, MaqlLexer.UnterminatedString];

const COMMENT_TOKENS: number[] = [MaqlLexer.Comment];

const SKIP_TOKENS: number[] = [
    MaqlLexer.PARSE,
    MaqlLexer.METRIC,
    MaqlLexer.EOF,
    MaqlLexer.WS,
    MaqlLexer.ERROR_CHARACTER,
];

export const tokenTypeMap = new Map<number, number>();

KEYWORD_TOKENS.forEach((tokenId) => {
    tokenTypeMap.set(tokenId, TokenTypes.Keyword);
});
FUNCTION_TOKENS.forEach((tokenId) => {
    tokenTypeMap.set(tokenId, TokenTypes.Function);
});
OPERATOR_TOKENS.forEach((tokenId) => {
    tokenTypeMap.set(tokenId, TokenTypes.Operator);
});
NUMBER_TOKENS.forEach((tokenId) => {
    tokenTypeMap.set(tokenId, TokenTypes.Number);
});
IDENTIFIER_TOKENS.forEach((tokenId) => {
    tokenTypeMap.set(tokenId, TokenTypes.Variable);
});
STRING_TOKENS.forEach((tokenId) => {
    tokenTypeMap.set(tokenId, TokenTypes.String);
});
COMMENT_TOKENS.forEach((tokenId) => {
    tokenTypeMap.set(tokenId, TokenTypes.Comment);
});

function getObjectTypeTokenType(typeId: number) {
    switch (typeId) {
        case MaqlLexer.ATTRIBUTE:
        case MaqlLexer.COMPUTED_ATTRIBUTE_OBJECT:
        case MaqlLexer.LABEL:
            return TokenTypes.Label;
        case MaqlLexer.FACT:
            return TokenTypes.Fact;
        case MaqlLexer.METRIC_TYPE:
            return TokenTypes.Metric;
        case MaqlLexer.DATASET:
            return TokenTypes.Dataset;
        case MaqlLexer.PARAMETER:
            return TokenTypes.Variable;
        default:
            return TokenTypes.Variable;
    }
}

export function semanticsFull(query: string): HighlightToken[] {
    const metric = new MaqlMetric(query);
    return tokenize(metric.tree, metric.tokenStream);
}

function tokenize(tree: ParserRuleContext, stream: CommonTokenStream): HighlightToken[] {
    const tokenizer = new SemanticTokenizer(stream);
    ParseTreeWalker.DEFAULT.walk(tokenizer, tree);
    return tokenizer.build();
}

/**
 * @internal
 */
export type HighlightToken = {
    position: Range;
    type: string;
    modifiers: string[];
};

/**
 * Parse tree listener that assigns semantic tokens to nodes of a MAQL parse tree, usually by directly mapping
 * from a MAQL token, but is able to use more complicated logic in special cases.
 */
class SemanticTokenizer implements MaqlParserListener, ParseTreeListener {
    private readonly tokens: HighlightToken[] = [];
    private skipNodes: boolean = false;

    constructor(private readonly stream: CommonTokenStream) {}

    visitTerminal(node: TerminalNode) {
        if (this.skipNodes) return;
        const token = node.symbol;
        this.pushHiddenTokensToLeft(token.tokenIndex);
        this.pushToken(token);
    }

    visitErrorNode(node: ErrorNode) {
        if (node.symbol.tokenIndex === -1) return; // conjured up symbol -> skip
        this.visitTerminal(node); // for syntax highlighting error nodes do not differ from terminal nodes
    }

    enterObject(_: ObjectContext) {
        this.skipNodes = true;
    }

    exitObject(ctx: ObjectContext, objectTypeId: number = -1) {
        this.skipNodes = false;
        this.pushHiddenTokensToLeft(ctx.start.tokenIndex);
        this.pushRule(ctx, objectTypeId);
    }

    enterAttribute = this.enterObject;

    exitAttribute(ctx: AttributeContext) {
        const typeCtx = ctx.tryGetChild(0, AttributeTypeContext);
        const type =
            typeCtx?.ATTRIBUTE() ??
            typeCtx?.COMPUTED_ATTRIBUTE_OBJECT() ??
            typeCtx?.LABEL() ??
            typeCtx?.DATASET();
        this.exitObject(ctx, this.getTokenId(type));
    }

    enterNumeric = this.enterObject;

    exitNumeric(ctx: NumericContext) {
        const typeCtx = ctx.tryGetChild(0, NumericTypeContext);
        this.exitObject(ctx, this.getTokenId(typeCtx?.FACT() ?? typeCtx?.METRIC_TYPE()));
    }

    exitFact(ctx: FactContext) {
        this.exitObject(ctx, this.getTokenId(ctx.FACT()));
    }

    enterParameter = this.enterObject;

    exitParameter(ctx: ParameterContext) {
        this.exitObject(ctx, this.getTokenId(ctx.PARAMETER()));
    }

    private getTokenId = (node?: TerminalNode): number | undefined => node?.symbol.type;

    private pushHiddenTokensToLeft(tokenIndex: number) {
        if (tokenIndex < 0 || this.stream.size < tokenIndex) return;
        this.stream.getHiddenTokensToLeft(tokenIndex, -1).forEach((token) => this.pushToken(token));
    }

    private pushToken(token: Token) {
        if (SKIP_TOKENS.includes(token.type)) return;
        const tokenType: number = tokenTypeMap.get(token.type) ?? TokenTypes.Type;
        if (!token.text) return;
        this.push(token.text, token.line, token.charPositionInLine, tokenType);
    }

    private pushRule(rule: ParserRuleContext, objectTypeId: number) {
        const tokenType: number = getObjectTypeTokenType(objectTypeId) ?? TokenTypes.Type;
        const range = antlrContextRange(rule.start, rule.stop);
        this.push(rule.text, range.startLine, range.startCharacter, tokenType);
    }

    private push(
        text: string,
        antlrLine: number,
        antlrCharacter: number,
        tokenType: TokenTypes,
        tokenModifiers: ModifierTypes[] = [],
    ) {
        const lines = text.split("\n");
        const type = mapToken(TokenTypes[tokenType]);
        const modifiers = tokenModifiers.map((mod) => mapToken(ModifierTypes[mod]));
        lines.forEach((line: string, index: number) => {
            const startLine = antlrLine - 2 + index;
            const startCharacter = index === 0 ? antlrCharacter : 0;
            this.tokens.push({
                position: {
                    start: { line: startLine, character: startCharacter },
                    end: { line: startLine, character: startCharacter + line.length },
                },
                type,
                modifiers,
            });
        });
    }

    build() {
        return this.tokens;
    }
}
