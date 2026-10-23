// (C) 2022-2026 GoodData Corporation

import type { CommonTokenStream, ParserRuleContext, Token } from "antlr4ts";
import {
    AbstractParseTreeVisitor,
    type ErrorNode,
    type ParseTree,
    type RuleNode,
    type TerminalNode,
} from "antlr4ts/tree/index.js";
import { type FormattingOptions, type Position, type Range, TextEdit } from "vscode-languageserver";

import Maql from "@gooddata/maql-antlr4ts";

import { TokenTypes, tokenTypeMap } from "./highlight/semanticsHighlight.js";
import { MaqlMetric } from "./parseMaql.js";
import { antlrContextRange, tokenRange } from "./tokenRanges.js";

export function format(query: string, options: FormattingOptions): TextEdit[] {
    const metric = new MaqlMetric(query);
    const formatter = new MaqlFormatter(options, metric);
    return formatter.visit(metric.tree);
}

export function formatRange(query: string, range: Range, options: FormattingOptions): TextEdit[] {
    const metric = new MaqlMetric(query);
    const formatter = new MaqlFormatter(options, metric, range);
    return formatter.visit(metric.tree);
}

/**
 * Automatic formatting for MAQL metrics
 * MaqlFormatter class is a parse tree visitor that analyzes a MAQL metric and finds necessary text edits
 * to transform the metric into the preferred formatting.
 * The found text edits are not sorted. However, they are guaranteed to not be overlapping.
 *
 * The basic principle is to apply a text edit on each token only once. Take this query as an example
 * ```
 * SELECT AVG({fact/budget})
 *   WHERE {label/country.code}="US"
 * ```
 * the tokens here would be
 * ```
 * SELECT WS AVG LPAREN <fact tokens> RPAREN WS WHERE WS <label tokens> RELOP STRING
 * ```
 * From the tokens and the MAQL grammar a parse tree is constructed.
 * When traversing the parse tree, edits are added based on the defined rules. If multiple rules should be applied
 * using the same token, the first rule triggered has precedence.
 * Most important are the whitespace (WS) tokens, which are strings of whitespace characters - spaces, new lines, tabs etc.
 */
class MaqlFormatter
    extends AbstractParseTreeVisitor<TextEdit[]>
    implements Maql.MaqlParserVisitor<TextEdit[]>
{
    private indentationLevel = 0;
    private formattedTokens: Set<number>;
    private readonly stream: CommonTokenStream;

    get indentSpaces(): string {
        return " ".repeat(this.indentationLevel * this.options.tabSize);
    }

    constructor(
        readonly options: FormattingOptions,
        metric: MaqlMetric,
        range?: Range,
    ) {
        super();
        this.formattedTokens = new Set();
        this.stream = metric.tokenStream;
        if (range) {
            // if a range is specified do not enter contexts where the intersection with the context range is empty
            this.visit = (tree) => this.visitInRange(tree, range);
        }
    }

    protected defaultResult(): TextEdit[] {
        return [];
    }

    protected override aggregateResult(aggregate: TextEdit[], nextResult: TextEdit[]): TextEdit[] {
        return aggregate.concat(nextResult);
    }

    visitInRange(tree: ParseTree, range: Range): TextEdit[] {
        const treeRange = antlrContextRange(
            this.stream.get(tree.sourceInterval.a),
            this.stream.get(tree.sourceInterval.b),
        ).toRange();
        if (!this.intersects(treeRange, range)) {
            return this.defaultResult();
        }
        return super.visit(tree).filter((edit) => this.intersects(edit.range, range));
    }

    override visitChildren(
        node: RuleNode,
        firstChild: number = 0,
        lastChild: number = node.childCount - 1,
    ): TextEdit[] {
        let result = this.defaultResult();
        for (let i = firstChild; i <= lastChild; i++) {
            if (!this.shouldVisitNextChild(node, result)) {
                break;
            }
            const child = node.getChild(i);
            if (!child) continue;
            const childResult = this.visit(child);
            result = this.aggregateResult(result, childResult);
        }
        return result;
    }

    override visitTerminal(node: TerminalNode): TextEdit[] {
        const token = node.symbol;
        const wsEdits = this.ensureWhitespace(this.getHiddenToLeft(token), undefined, this.indentSpaces);
        const edits = this.formatToken(token);
        return wsEdits.concat(edits);
    }

    override visitErrorNode(node: ErrorNode): TextEdit[] {
        if (node.symbol.tokenIndex === -1) return this.defaultResult(); // conjured up symbol -> skip
        return this.visitTerminal(node); // format error nodes anyway if possible
    }

    private formatToken(token: Token): TextEdit[] {
        if (this.formattedTokens.has(token.tokenIndex)) return this.defaultResult();
        this.formattedTokens.add(token.tokenIndex);
        const semanticType = tokenTypeMap.get(token.type);
        const edits: TextEdit[] = [];
        const range = tokenRange(token);
        if (!this.inRange(range) || !token.text) return this.defaultResult();
        if (semanticType === TokenTypes.Keyword || semanticType === TokenTypes.Function) {
            const edited = token.text.toUpperCase();
            if (token.text !== edited) {
                edits.push(TextEdit.replace(range, edited));
            }
        }
        return edits;
    }

    visitMaqlMeasure = this.visitMaqlQuery;
    visitMaqlComputedAttribute = this.visitMaqlQuery;
    visitMaqlFilter = this.visitMaqlQuery;

    visitMaqlQuery(
        ctx: Maql.MaqlMeasureContext | Maql.MaqlComputedAttributeContext | Maql.MaqlFilterContext,
    ): TextEdit[] {
        const edits: TextEdit[] = [];
        const eof = ctx.EOF().symbol;
        const eofPosition = tokenRange(eof).start;
        const hidden = this.getHiddenToLeft(eof);
        if (this.options.trimFinalNewlines) {
            const final = this.options.insertFinalNewline ? "\n" : "";
            edits.push(...this.removeWhitespace(hidden, " ", final));
        } else if (this.options.insertFinalNewline) {
            edits.push(...this.ensureNewline(hidden, eofPosition));
        } else {
            edits.push(...this.ensureWhitespace(hidden, "", "", eofPosition));
        }
        edits.push(...this.visitChildren(ctx));
        return edits;
    }

    visitFunctionCall = this.visitFunctionCallCommon;

    visitFunctionCallRun(ctx: Maql.FunctionCallRunContext): TextEdit[] {
        const edits: TextEdit[] = [];
        edits.push(...this.visitFunctionCallCommon(ctx));
        const withinCtx = ctx.within();
        if (withinCtx) {
            edits.push(...this.visitFunctionCallClause(withinCtx));
        }
        const rollWindowCtx = ctx.rollWindow();
        if (rollWindowCtx) {
            edits.push(...this.visitFunctionCallClause(rollWindowCtx));
        }
        return edits;
    }

    visitFunctionCallRank(ctx: Maql.FunctionCallRankContext): TextEdit[] {
        const edits: TextEdit[] = [];
        edits.push(...this.visitFunctionCallCommon(ctx));
        const rankDirCtx = ctx.rankDir();
        if (rankDirCtx) {
            edits.push(...this.visitFunctionCallClause(rankDirCtx));
        }
        const withinCtx = ctx.within();
        if (withinCtx) {
            edits.push(...this.visitFunctionCallClause(withinCtx));
        }
        return edits;
    }

    visitFunctionCallLastFirstValue(ctx: Maql.FunctionCallLastFirstValueContext): TextEdit[] {
        const edits: TextEdit[] = [];
        edits.push(...this.visitFunctionCallCommon(ctx));
        const orderByCtx = ctx.orderby();
        if (orderByCtx) {
            edits.push(...this.visitFunctionCallClause(orderByCtx));
        }
        const withinCtx = ctx.within();
        if (withinCtx) {
            edits.push(...this.visitFunctionCallClause(withinCtx));
        }
        return edits;
    }

    /**
     * Ensure new line before function modifying clauses e.g. WITHIN
     */
    private visitFunctionCallClause(ctx: ParserRuleContext): TextEdit[] {
        const edits: TextEdit[] = [];
        edits.push(...this.ensureNewline(this.getHiddenToLeft(ctx.start), tokenRange(ctx.start).start));
        edits.push(...this.visit(ctx));
        return edits;
    }

    private visitFunctionCallCommon(ctx: FunctionCallCommonContext): TextEdit[] {
        const edits: TextEdit[] = [];
        edits.push(...this.visit(ctx.getChild(0)));
        const lparen = ctx.tryGetToken(Maql.MaqlParser.LPAREN, 0)?.symbol;
        if (lparen) {
            edits.push(...this.removeWhitespace(this.getHiddenToLeft(lparen)));
        }
        if (lparen) {
            edits.push(
                ...this.ensureWhitespace(
                    this.getHiddenToRight(lparen),
                    "",
                    undefined,
                    tokenRange(lparen).end,
                ),
            );
        }
        this.indent();
        const argsCtx =
            ctx.tryGetRuleContext(0, Maql.ExpressionListContext) ??
            ctx.tryGetRuleContext(0, Maql.MaqlExpressionContext);
        if (argsCtx) {
            edits.push(...this.visit(argsCtx));
        }
        const rparen = ctx.tryGetToken(Maql.MaqlParser.RPAREN, 0)?.symbol;
        if (rparen) {
            edits.push(...this.removeWhitespace(this.getHiddenToLeft(rparen)));
        }
        this.dedent();
        if (rparen) {
            edits.push(...this.visit(ctx.RPAREN()));
        }
        return edits;
    }

    visitTimeMacro(ctx: Maql.TimeMacroContext): TextEdit[] {
        const edits: TextEdit[] = [];
        edits.push(...this.visit(ctx.getChild(0)));
        const lparen = ctx.LPAREN().symbol;
        edits.push(...this.removeWhitespace(this.getHiddenToLeft(lparen)));
        edits.push(
            ...this.ensureWhitespace(this.getHiddenToRight(lparen), "", undefined, tokenRange(lparen).end),
        );
        this.indent();
        const rparen = ctx.RPAREN().symbol;
        edits.push(...this.removeWhitespace(this.getHiddenToLeft(rparen)));
        this.dedent();
        edits.push(...this.visit(ctx.RPAREN()));
        const comma = ctx.COMMA()?.symbol;
        if (comma) {
            edits.push(...this.removeWhitespace(this.getHiddenToLeft(comma)));
            const commaRange = tokenRange(comma);
            edits.push(...this.ensureSpace(this.getHiddenToRight(comma), commaRange.end));
        }
        edits.push(...this.visit(ctx.granularity()));
        const amountCtx = ctx.integer();
        if (amountCtx) {
            edits.push(...this.visit(amountCtx));
        }
        return edits;
    }

    visitExpressionList(ctx: Maql.ExpressionListContext): TextEdit[] {
        const edits: TextEdit[] = [];
        const commaContext = ctx.COMMA();
        const commas = (Array.isArray(commaContext) ? commaContext : [commaContext])
            .map((c) => c?.symbol)
            .filter((c): c is Token => c !== undefined);
        for (const comma of commas) {
            edits.push(...this.removeWhitespace(this.getHiddenToLeft(comma)));
            const commaRange = tokenRange(comma);
            edits.push(...this.ensureSpace(this.getHiddenToRight(comma), commaRange.end));
        }
        edits.push(...this.visitChildren(ctx));
        return edits;
    }

    visitDisjunction(ctx: Maql.DisjunctionContext): TextEdit[] {
        return this.visitLogicalOperatorExpression(ctx, () => ctx.OR());
    }

    visitConjunction(ctx: Maql.ConjunctionContext): TextEdit[] {
        return this.visitLogicalOperatorExpression(ctx, () => ctx.AND());
    }

    visitLogicalOperatorExpression(ctx: ParserRuleContext, ops: () => TerminalNode[]): TextEdit[] {
        const edits: TextEdit[] = [];
        for (const opNode of ops()) {
            const op = opNode.symbol;
            const opRange = tokenRange(op);
            edits.push(...this.ensureNewline(this.getHiddenToLeft(op), opRange.start));
            edits.push(...this.removeWhitespace(this.getHiddenToRight(op), " ", " ", opRange.end));
        }
        edits.push(...this.visitChildren(ctx));
        return edits;
    }

    visitAddition(ctx: Maql.AdditionContext): TextEdit[] {
        return this.visitArithmeticOperatorExpression(ctx, () =>
            ctx
                .additiveOperator()
                .map((it) => it.PLUS() ?? it.MINUS())
                .filter((it): it is TerminalNode => !!it),
        );
    }

    visitMultiplication(ctx: Maql.MultiplicationContext): TextEdit[] {
        return this.visitArithmeticOperatorExpression(ctx, () =>
            ctx
                .multiplicativeOperator()
                .map((it) => it.MUL() ?? it.DIV())
                .filter((it): it is TerminalNode => !!it),
        );
    }

    visitArithmeticOperatorExpression(ctx: ParserRuleContext, ops: () => TerminalNode[]): TextEdit[] {
        const edits: TextEdit[] = [];
        for (const opNode of ops()) {
            const op = opNode.symbol;
            const opRange = tokenRange(op);
            edits.push(...this.ensureSpace(this.getHiddenToLeft(op), opRange.start));
            edits.push(...this.ensureSpace(this.getHiddenToRight(op), opRange.end));
        }
        edits.push(...this.visitChildren(ctx));
        return edits;
    }

    visitRelationRelop(ctx: Maql.RelationRelopContext): TextEdit[] {
        const edits: TextEdit[] = [];
        const relop = ctx.RELOP().symbol;
        const relopRange = tokenRange(relop);
        edits.push(...this.ensureSpace(this.getHiddenToLeft(relop), relopRange.start));
        edits.push(...this.ensureSpace(this.getHiddenToRight(relop), relopRange.end));
        edits.push(...this.visitChildren(ctx));
        return edits;
    }

    visitRelationLike(ctx: Maql.RelationLikeContext): TextEdit[] {
        const edits: TextEdit[] = [];
        const likeCtx = ctx.like();
        const item = likeCtx.LIKE() || likeCtx.ILIKE();
        const like = item!.symbol;
        const likeRange = tokenRange(like);
        edits.push(...this.ensureSpace(this.getHiddenToLeft(like), likeRange.start));
        edits.push(...this.ensureSpace(this.getHiddenToRight(like), likeRange.end));
        edits.push(...this.visit(likeCtx));
        return edits;
    }

    visitRelationBetween(ctx: Maql.RelationBetweenContext): TextEdit[] {
        const edits: TextEdit[] = [];
        const between = ctx.BETWEEN().symbol;
        const betweenRange = tokenRange(between);
        edits.push(...this.ensureSpace(this.getHiddenToLeft(between), betweenRange.start));
        edits.push(...this.ensureSpace(this.getHiddenToRight(between), betweenRange.end));

        const and = ctx.AND().symbol;
        const andRange = tokenRange(and);
        edits.push(...this.ensureSpace(this.getHiddenToLeft(and), andRange.start));
        edits.push(...this.ensureSpace(this.getHiddenToRight(and), andRange.end));

        edits.push(...this.visitChildren(ctx));
        return edits;
    }

    visitRelationNot(ctx: Maql.RelationNotContext): TextEdit[] {
        const not = ctx.NOT();
        const edits: TextEdit[] = [];
        if (not) {
            const token = not.symbol;
            const range = tokenRange(token);
            edits.push(...this.ensureSpace(this.getHiddenToLeft(token), range.start));
            edits.push(...this.ensureSpace(this.getHiddenToRight(token), range.end));
            edits.push(...this.visit(not));
        }
        edits.push(...this.visit(ctx.relationNegatable()));
        return edits;
    }

    visitRelationIn(ctx: Maql.RelationInContext): TextEdit[] {
        const edits: TextEdit[] = [];
        const int = ctx.IN().symbol;
        const range = tokenRange(int);
        edits.push(...this.ensureSpace(this.getHiddenToLeft(int), range.start));
        edits.push(...this.ensureSpace(this.getHiddenToRight(int), range.end));
        edits.push(...this.visit(ctx.IN()));
        const lparen = ctx.LPAREN().symbol;
        const lparenRange = tokenRange(lparen);

        if (ctx.listLiteral() === undefined) {
            edits.push(...this.removeWhitespace(this.getHiddenToLeft(ctx.RPAREN().symbol)));
        } else {
            this.indent();
            edits.push(...this.ensureNewline(this.getHiddenToRight(lparen), lparenRange.end));
            edits.push(...this.visitChildren(ctx, 1, ctx.childCount - 2));
            this.dedent();
        }
        edits.push(...this.visit(ctx.RPAREN()));
        return edits;
    }

    visitSelectExpression(ctx: Maql.SelectExpressionContext): TextEdit[] {
        const edits: TextEdit[] = [];
        const select = ctx.SELECT().symbol;
        const selectRange = tokenRange(select);
        edits.push(...this.ensureNewline(this.getHiddenToLeft(select), selectRange.start));
        edits.push(...this.visit(ctx.SELECT()));
        this.indent();
        edits.push(...this.ensureSpace(this.getHiddenToRight(select), selectRange.end));
        edits.push(...this.visitChildren(ctx, 1));
        this.dedent();
        return edits;
    }

    visitBy(ctx: Maql.ByContext): TextEdit[] {
        return this.visitKeywordOfStatement(ctx, () => ctx.BY());
    }

    visitForEach(ctx: Maql.ForEachContext): TextEdit[] {
        const edits: TextEdit[] = [];
        const forEach = ctx.FOR().symbol;
        const forEachRange = tokenRange(forEach);
        edits.push(...this.ensureNewline(this.getHiddenToLeft(forEach), forEachRange.start));
        this.indent();
        edits.push(...this.visitChildren(ctx, 1));
        this.dedent();
        return edits;
    }

    visitForTransformation(ctx: Maql.ForTransformationContext): TextEdit[] {
        return this.visitKeywordOfStatement(ctx, () => ctx.FOR());
    }

    visitWhere(ctx: Maql.WhereContext): TextEdit[] {
        return this.visitKeywordOfStatement(ctx, () => ctx.WHERE());
    }

    visitHaving(ctx: Maql.HavingContext): TextEdit[] {
        return this.visitKeywordOfStatement(ctx, () => ctx.HAVING());
    }

    visitUsing(ctx: Maql.UsingContext): TextEdit[] {
        return this.visitKeywordOfStatement(ctx, () => ctx.USING());
    }

    visitWithPf(ctx: Maql.WithPfContext): TextEdit[] {
        return this.visitKeywordOfStatement(ctx, () => ctx.WITH());
    }

    visitWithoutPf(ctx: Maql.WithoutPfContext): TextEdit[] {
        return this.visitKeywordOfStatement(ctx, () => ctx.WITHOUT());
    }

    visitKeywordOfStatement(ctx: ParserRuleContext, keyword: () => TerminalNode): TextEdit[] {
        const edits: TextEdit[] = [];
        const kw = keyword().symbol;
        const kwRange = tokenRange(kw);
        edits.push(...this.ensureNewline(this.getHiddenToLeft(kw), kwRange.start));
        edits.push(...this.ensureSpace(this.getHiddenToRight(kw), kwRange.end));
        edits.push(...this.visit(keyword()));
        edits.push(...this.visitChildren(ctx, 1));
        return edits;
    }

    visitAttributeList(ctx: Maql.AttributeListContext): TextEdit[] {
        return this.visitNewlineSeparatedCommaList(ctx);
    }

    // oxlint-disable-next-line sonarjs/no-identical-functions -- distinct ANTLR visitor override with intentionally identical formatting behavior
    visitListLiteral(ctx: Maql.ListLiteralContext): TextEdit[] {
        return this.visitNewlineSeparatedCommaList(ctx);
    }

    private visitNewlineSeparatedCommaList(
        ctx: Maql.AttributeListContext | Maql.ListLiteralContext,
    ): TextEdit[] {
        const edits: TextEdit[] = [];
        for (const comma of ctx.COMMA()) {
            const token = comma.symbol;
            edits.push(...this.removeWhitespace(this.getHiddenToLeft(token)));
            edits.push(...this.ensureNewline(this.getHiddenToRight(token), tokenRange(token).end));
        }
        edits.push(...this.visitChildren(ctx));
        return edits;
    }

    visitIf(ctx: Maql.IfContext): TextEdit[] {
        const edits: TextEdit[] = [];
        edits.push(...this.visit(ctx.IF()));
        edits.push(...this.visitElse(ctx));
        return edits;
    }

    visitCase(ctx: Maql.CaseContext): TextEdit[] {
        const edits: TextEdit[] = [];
        edits.push(...this.visit(ctx.CASE()));
        edits.push(...this.visitElse(ctx));
        return edits;
    }

    visitElse(ctx: Maql.IfContext | Maql.CaseContext): TextEdit[] {
        const edits: TextEdit[] = [];
        this.indent();
        const elseCtx = ctx.ELSE();
        if (elseCtx) {
            edits.push(
                ...this.ensureNewline(this.getHiddenToLeft(elseCtx.symbol), tokenRange(elseCtx.symbol).start),
            );
            edits.push(...this.visit(elseCtx));
        }
        edits.push(...this.visitChildren(ctx, 1, ctx.childCount - 2));
        this.dedent();
        const end = ctx.END()?.symbol;
        edits.push(...this.ensureNewline(this.getHiddenToLeft(end), tokenRange(end).start));
        edits.push(...this.visit(ctx.END()));
        return edits;
    }

    visitCaseConditional(ctx: Maql.CaseConditionalContext) {
        const edits: TextEdit[] = this.defaultResult();
        for (const when of ctx.WHEN()) {
            const token = when.symbol;
            edits.push(...this.ensureNewline(this.getHiddenToLeft(token), tokenRange(token).start));
        }
        edits.push(...this.visitChildren(ctx));
        return edits;
    }

    visitTransFunction(ctx: Maql.TransFunctionContext): TextEdit[] {
        const token = ctx.NEXT() ?? ctx.NEXTPERIOD() ?? ctx.PREVIOUS() ?? ctx.PREVIOUSPERIOD();
        const text = token?.text;
        const edited = text ? formatTransFunction(text) : undefined;
        if (!token || !edited || text === edited) return this.defaultResult();
        const range = tokenRange(token.symbol);
        if (!this.inRange(range)) return this.defaultResult();
        return [TextEdit.replace(range, edited)];
    }

    /**
     * Shortens whitespace, trims trailing spaces, inserts string at the start of the last line
     * @param whitespace - is assumed to be the token text of a MaqlParser.WS token
     * @param finalInline - is the value to be used if there are no line breaks in the whitespace
     *  if undefined then by default trim the whitespace to at most one space
     * @param finalNewline - is the value to be after the last line break
     */
    private formatWhitespace(whitespace: string, finalInline?: string, finalNewline?: string): string {
        const lines = whitespace.split("\n");
        if (lines.length === 1)
            return finalInline === undefined ? (whitespace.length > 0 ? " " : "") : finalInline;
        if (this.options.trimTrailingWhitespace) {
            lines.slice(0, -1).forEach((_, idx) => (lines[idx] = ""));
        }
        if (finalNewline !== undefined) {
            lines[lines.length - 1] = finalNewline;
        }
        return lines.join("\n");
    }

    private ensureWhitespace(
        tokens: Token[],
        finalInline: string,
        finalNewline: undefined,
        position: Position,
    ): TextEdit[];
    private ensureWhitespace(tokens: Token[], finalInline: undefined, finalNewline: string): TextEdit[];
    private ensureWhitespace(
        tokens: Token[],
        finalInline: string,
        finalNewline: string,
        position: Position,
    ): TextEdit[];
    private ensureWhitespace(
        tokens: Token[],
        finalInline?: string,
        finalNewline?: string,
        position?: Position,
    ): TextEdit[] {
        if (tokens.length === 0 && finalInline) {
            return [TextEdit.insert(position as Position, finalInline)];
        }
        return tokens
            .map((token) => {
                if (!token.text || this.formattedTokens.has(token.tokenIndex)) return null;
                if (token.type === Maql.MaqlParser.WS) {
                    const range = tokenRange(token);
                    const edited = this.formatWhitespace(token.text, finalInline, finalNewline);
                    if (token.text !== edited) {
                        this.formattedTokens.add(token.tokenIndex);
                        return TextEdit.replace(range, edited);
                    }
                }
                return null;
            })
            .filter((edit): edit is TextEdit => !!edit);
    }

    private ensureSpace(tokens: Token[], position: Position): TextEdit[] {
        return this.ensureWhitespace(tokens, " ", this.indentSpaces, position);
    }

    private ensureNewline(tokens: Token[], position: Position): TextEdit[] {
        return this.ensureWhitespace(tokens, "\n" + this.indentSpaces, this.indentSpaces, position);
    }

    /**
     * Removes all whitespace if there are no preceding line comments
     */
    private removeWhitespace(tokens: Token[], separator = " ", final = "", position?: Position): TextEdit[] {
        if (tokens.length === 0 && position && final !== "") {
            return [TextEdit.insert(position, final)];
        }
        let prevIsLineComment = false;
        const edits: TextEdit[] = this.defaultResult();
        tokens.forEach((token, idx) => {
            if (!token.text || this.formattedTokens.has(token.tokenIndex)) return;
            this.formattedTokens.add(token.tokenIndex);
            if (token.type === Maql.MaqlParser.WS) {
                const range = tokenRange(token);
                const edited = prevIsLineComment
                    ? "\n" + this.indentSpaces
                    : idx < tokens.length - 1
                      ? separator
                      : final;
                if (token.text !== edited) {
                    edits.push(TextEdit.replace(range, edited));
                }
            }
            prevIsLineComment = token.type === Maql.MaqlParser.Comment;
        });
        return edits;
    }

    private indent() {
        this.indentationLevel += 1;
    }

    private dedent() {
        this.indentationLevel -= 1;
    }

    private inRange(range: Range): boolean {
        return range.start.line >= 0; // skip "PARSE METRIC\n"
    }

    private intersects(a: Range, b: Range): boolean {
        const { start: startA, end: endA } = a;
        const { start: startB, end: endB } = b;
        return (
            (endA.line > startB.line || (endA.line === startB.line && endA.character > startB.character)) &&
            (startA.line < endB.line || (startA.line === endB.line && startA.character < endB.character))
        );
    }

    private getHiddenToLeft(token: Token): Token[] {
        if (token.tokenIndex < 0 || token.tokenIndex >= this.stream.size) return [];
        return this.stream.getHiddenTokensToLeft(token.tokenIndex, -1);
    }

    private getHiddenToRight(token: Token): Token[] {
        if (token.tokenIndex < 0 || token.tokenIndex >= this.stream.size) return [];
        return this.stream.getHiddenTokensToRight(token.tokenIndex, -1);
    }
}

type FunctionCallCommonContext =
    | Maql.FunctionCallContext
    | Maql.FunctionCallRunContext
    | Maql.FunctionCallRankContext
    | Maql.FunctionCallLastFirstValueContext;

function formatTransFunction(func: string): string {
    switch (func.toUpperCase()) {
        case "NEXT":
            return "Next";
        case "NEXTPERIOD":
            return "NextPeriod";
        case "PREVIOUS":
            return "Previous";
        case "PREVIOUSPERIOD":
            return "PreviousPeriod";
        default:
            return func.charAt(0).toUpperCase() + func.slice(1);
    }
}
