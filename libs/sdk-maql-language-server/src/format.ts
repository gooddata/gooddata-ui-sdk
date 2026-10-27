// (C) 2022-2026 GoodData Corporation

import type {
    CommonTokenStream,
    ErrorNode,
    ParseTree,
    ParserRuleContext,
    TerminalNode,
    Token,
} from "antlr4ng";
import { type FormattingOptions, type Position, type Range, TextEdit } from "vscode-languageserver";

import {
    type AdditionContext,
    type AttributeListContext,
    type ByContext,
    type CaseConditionalContext,
    type CaseContext,
    type ConjunctionContext,
    type DisjunctionContext,
    ExpressionListContext,
    type ForEachContext,
    type ForTransformationContext,
    type FunctionCallContext,
    type FunctionCallLastFirstValueContext,
    type FunctionCallRankContext,
    type FunctionCallRunContext,
    type HavingContext,
    type IfContext,
    type ListLiteralContext,
    type MaqlComputedAttributeContext,
    MaqlExpressionContext,
    type MaqlFilterContext,
    type MaqlMeasureContext,
    MaqlParser,
    MaqlParserVisitor,
    type MultiplicationContext,
    type RelationBetweenContext,
    type RelationInContext,
    type RelationLikeContext,
    type RelationNotContext,
    type RelationRelopContext,
    type SelectExpressionContext,
    type TimeMacroContext,
    type TransFunctionContext,
    type UsingContext,
    type WhereContext,
    type WithPfContext,
    type WithoutPfContext,
} from "@gooddata/maql-antlr4ts";

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
class MaqlFormatter extends MaqlParserVisitor<TextEdit[]> {
    private indentationLevel = 0;
    private formattedTokens: Set<number>;
    private readonly stream: CommonTokenStream;
    private readonly range?: Range;

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
        this.range = range;
    }

    protected override defaultResult(): TextEdit[] {
        return [];
    }

    protected override aggregateResult(aggregate: TextEdit[], nextResult: TextEdit[]): TextEdit[] {
        return aggregate.concat(nextResult);
    }

    override visit(tree: ParseTree): TextEdit[] {
        // if a range is specified do not enter contexts where the intersection with the context range is empty
        if (this.range) {
            return this.visitInRange(tree, this.range);
        }
        return super.visit(tree) ?? this.defaultResult();
    }

    visitInRange(tree: ParseTree, range: Range): TextEdit[] {
        const interval = tree.getSourceInterval();
        const treeRange = antlrContextRange(
            this.stream.get(interval.start),
            this.stream.get(interval.stop),
        ).toRange();
        if (!this.intersects(treeRange, range)) {
            return this.defaultResult();
        }
        return (super.visit(tree) ?? []).filter((edit) => this.intersects(edit.range, range));
    }

    override visitChildren(
        node: ParseTree,
        firstChild: number = 0,
        lastChild: number = node.getChildCount() - 1,
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

    override visitMaqlMeasure = this.visitMaqlQuery;
    override visitMaqlComputedAttribute = this.visitMaqlQuery;
    override visitMaqlFilter = this.visitMaqlQuery;

    visitMaqlQuery(ctx: MaqlMeasureContext | MaqlComputedAttributeContext | MaqlFilterContext): TextEdit[] {
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

    override visitFunctionCall = (ctx: FunctionCallContext): TextEdit[] => this.visitFunctionCallCommon(ctx);

    override visitFunctionCallRun = (ctx: FunctionCallRunContext): TextEdit[] => {
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
    };

    override visitFunctionCallRank = (ctx: FunctionCallRankContext): TextEdit[] => {
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
    };

    override visitFunctionCallLastFirstValue = (ctx: FunctionCallLastFirstValueContext): TextEdit[] => {
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
    };

    /**
     * Ensure new line before function modifying clauses e.g. WITHIN
     */
    private visitFunctionCallClause(ctx: ParserRuleContext): TextEdit[] {
        const edits: TextEdit[] = [];
        const start = ctx.start;
        if (start) {
            edits.push(...this.ensureNewline(this.getHiddenToLeft(start), tokenRange(start).start));
        }
        edits.push(...this.visit(ctx));
        return edits;
    }

    private visitFunctionCallCommon(ctx: FunctionCallCommonContext): TextEdit[] {
        const edits: TextEdit[] = [];
        const name = ctx.getChild(0);
        if (name) {
            edits.push(...this.visit(name));
        }
        const lparen = ctx.getToken(MaqlParser.LPAREN, 0)?.symbol;
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
            ctx.getRuleContext(0, ExpressionListContext) ?? ctx.getRuleContext(0, MaqlExpressionContext);
        if (argsCtx) {
            edits.push(...this.visit(argsCtx));
        }
        const rparen = ctx.getToken(MaqlParser.RPAREN, 0)?.symbol;
        if (rparen) {
            edits.push(...this.removeWhitespace(this.getHiddenToLeft(rparen)));
        }
        this.dedent();
        if (rparen) {
            edits.push(...this.visit(ctx.RPAREN()));
        }
        return edits;
    }

    override visitTimeMacro = (ctx: TimeMacroContext): TextEdit[] => {
        const edits: TextEdit[] = [];
        const name = ctx.getChild(0);
        if (name) {
            edits.push(...this.visit(name));
        }
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
    };

    override visitExpressionList = (ctx: ExpressionListContext): TextEdit[] => {
        const edits: TextEdit[] = [];
        for (const comma of ctx.COMMA().map((c) => c.symbol)) {
            edits.push(...this.removeWhitespace(this.getHiddenToLeft(comma)));
            const commaRange = tokenRange(comma);
            edits.push(...this.ensureSpace(this.getHiddenToRight(comma), commaRange.end));
        }
        edits.push(...this.visitChildren(ctx));
        return edits;
    };

    override visitDisjunction = (ctx: DisjunctionContext): TextEdit[] =>
        this.visitLogicalOperatorExpression(ctx, () => ctx.OR());

    override visitConjunction = (ctx: ConjunctionContext): TextEdit[] =>
        this.visitLogicalOperatorExpression(ctx, () => ctx.AND());

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

    override visitAddition = (ctx: AdditionContext): TextEdit[] =>
        this.visitArithmeticOperatorExpression(ctx, () =>
            ctx
                .additiveOperator()
                .map((it) => it.PLUS() ?? it.MINUS())
                .filter((it): it is TerminalNode => !!it),
        );

    override visitMultiplication = (ctx: MultiplicationContext): TextEdit[] =>
        this.visitArithmeticOperatorExpression(ctx, () =>
            ctx
                .multiplicativeOperator()
                .map((it) => it.MUL() ?? it.DIV())
                .filter((it): it is TerminalNode => !!it),
        );

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

    override visitRelationRelop = (ctx: RelationRelopContext): TextEdit[] => {
        const edits: TextEdit[] = [];
        const relop = ctx.RELOP().symbol;
        const relopRange = tokenRange(relop);
        edits.push(...this.ensureSpace(this.getHiddenToLeft(relop), relopRange.start));
        edits.push(...this.ensureSpace(this.getHiddenToRight(relop), relopRange.end));
        edits.push(...this.visitChildren(ctx));
        return edits;
    };

    override visitRelationLike = (ctx: RelationLikeContext): TextEdit[] => {
        const edits: TextEdit[] = [];
        const likeCtx = ctx.like();
        const item = likeCtx.LIKE() ?? likeCtx.ILIKE();
        const like = item!.symbol;
        const likeRange = tokenRange(like);
        edits.push(...this.ensureSpace(this.getHiddenToLeft(like), likeRange.start));
        edits.push(...this.ensureSpace(this.getHiddenToRight(like), likeRange.end));
        edits.push(...this.visit(likeCtx));
        return edits;
    };

    override visitRelationBetween = (ctx: RelationBetweenContext): TextEdit[] => {
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
    };

    override visitRelationNot = (ctx: RelationNotContext): TextEdit[] => {
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
    };

    override visitRelationIn = (ctx: RelationInContext): TextEdit[] => {
        const edits: TextEdit[] = [];
        const int = ctx.IN().symbol;
        const range = tokenRange(int);
        edits.push(...this.ensureSpace(this.getHiddenToLeft(int), range.start));
        edits.push(...this.ensureSpace(this.getHiddenToRight(int), range.end));
        edits.push(...this.visit(ctx.IN()));
        const lparen = ctx.LPAREN().symbol;
        const lparenRange = tokenRange(lparen);

        if (ctx.listLiteral() === null) {
            edits.push(...this.removeWhitespace(this.getHiddenToLeft(ctx.RPAREN().symbol)));
        } else {
            this.indent();
            edits.push(...this.ensureNewline(this.getHiddenToRight(lparen), lparenRange.end));
            edits.push(...this.visitChildren(ctx, 1, ctx.getChildCount() - 2));
            this.dedent();
        }
        edits.push(...this.visit(ctx.RPAREN()));
        return edits;
    };

    override visitSelectExpression = (ctx: SelectExpressionContext): TextEdit[] => {
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
    };

    override visitBy = (ctx: ByContext): TextEdit[] => this.visitKeywordOfStatement(ctx, () => ctx.BY());

    override visitForEach = (ctx: ForEachContext): TextEdit[] => {
        const edits: TextEdit[] = [];
        const forEach = ctx.FOR().symbol;
        const forEachRange = tokenRange(forEach);
        edits.push(...this.ensureNewline(this.getHiddenToLeft(forEach), forEachRange.start));
        this.indent();
        edits.push(...this.visitChildren(ctx, 1));
        this.dedent();
        return edits;
    };

    override visitForTransformation = (ctx: ForTransformationContext): TextEdit[] =>
        this.visitKeywordOfStatement(ctx, () => ctx.FOR());

    override visitWhere = (ctx: WhereContext): TextEdit[] =>
        this.visitKeywordOfStatement(ctx, () => ctx.WHERE());

    override visitHaving = (ctx: HavingContext): TextEdit[] =>
        this.visitKeywordOfStatement(ctx, () => ctx.HAVING());

    override visitUsing = (ctx: UsingContext): TextEdit[] =>
        this.visitKeywordOfStatement(ctx, () => ctx.USING());

    override visitWithPf = (ctx: WithPfContext): TextEdit[] =>
        this.visitKeywordOfStatement(ctx, () => ctx.WITH());

    override visitWithoutPf = (ctx: WithoutPfContext): TextEdit[] =>
        this.visitKeywordOfStatement(ctx, () => ctx.WITHOUT());

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

    override visitAttributeList = (ctx: AttributeListContext): TextEdit[] =>
        this.visitNewlineSeparatedCommaList(ctx);

    // oxlint-disable-next-line sonarjs/no-identical-functions -- distinct ANTLR visitor override with intentionally identical formatting behavior
    override visitListLiteral = (ctx: ListLiteralContext): TextEdit[] =>
        this.visitNewlineSeparatedCommaList(ctx);

    private visitNewlineSeparatedCommaList(ctx: AttributeListContext | ListLiteralContext): TextEdit[] {
        const edits: TextEdit[] = [];
        for (const comma of ctx.COMMA()) {
            const token = comma.symbol;
            edits.push(...this.removeWhitespace(this.getHiddenToLeft(token)));
            edits.push(...this.ensureNewline(this.getHiddenToRight(token), tokenRange(token).end));
        }
        edits.push(...this.visitChildren(ctx));
        return edits;
    }

    override visitIf = (ctx: IfContext): TextEdit[] => {
        const edits: TextEdit[] = [];
        edits.push(...this.visit(ctx.IF()));
        edits.push(...this.visitElse(ctx));
        return edits;
    };

    override visitCase = (ctx: CaseContext): TextEdit[] => {
        const edits: TextEdit[] = [];
        edits.push(...this.visit(ctx.CASE()));
        edits.push(...this.visitElse(ctx));
        return edits;
    };

    visitElse(ctx: IfContext | CaseContext): TextEdit[] {
        const edits: TextEdit[] = [];
        this.indent();
        const elseCtx = ctx.ELSE();
        if (elseCtx) {
            edits.push(
                ...this.ensureNewline(this.getHiddenToLeft(elseCtx.symbol), tokenRange(elseCtx.symbol).start),
            );
            edits.push(...this.visit(elseCtx));
        }
        // error recovery may leave an IF/CASE without its END token; the generated END() then returns null
        const endNode = ctx.getToken(MaqlParser.END, 0);
        const lastChild = endNode ? ctx.getChildCount() - 2 : ctx.getChildCount() - 1;
        edits.push(...this.visitChildren(ctx, 1, lastChild));
        this.dedent();
        if (endNode) {
            const end = endNode.symbol;
            edits.push(...this.ensureNewline(this.getHiddenToLeft(end), tokenRange(end).start));
            edits.push(...this.visit(endNode));
        }
        return edits;
    }

    override visitCaseConditional = (ctx: CaseConditionalContext): TextEdit[] => {
        const edits: TextEdit[] = this.defaultResult();
        for (const when of ctx.WHEN()) {
            const token = when.symbol;
            edits.push(...this.ensureNewline(this.getHiddenToLeft(token), tokenRange(token).start));
        }
        edits.push(...this.visitChildren(ctx));
        return edits;
    };

    override visitTransFunction = (ctx: TransFunctionContext): TextEdit[] => {
        const token = ctx.NEXT() ?? ctx.NEXTPERIOD() ?? ctx.PREVIOUS() ?? ctx.PREVIOUSPERIOD();
        const text = token?.getText();
        const edited = text ? formatTransFunction(text) : undefined;
        if (!token || !edited || text === edited) return this.defaultResult();
        const range = tokenRange(token.symbol);
        if (!this.inRange(range)) return this.defaultResult();
        return [TextEdit.replace(range, edited)];
    };

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
                if (token.type === MaqlParser.WS) {
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
            if (token.type === MaqlParser.WS) {
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
            prevIsLineComment = token.type === MaqlParser.Comment;
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
        return this.stream.getHiddenTokensToLeft(token.tokenIndex, -1) ?? [];
    }

    private getHiddenToRight(token: Token): Token[] {
        if (token.tokenIndex < 0 || token.tokenIndex >= this.stream.size) return [];
        return this.stream.getHiddenTokensToRight(token.tokenIndex, -1) ?? [];
    }
}

type FunctionCallCommonContext =
    | FunctionCallContext
    | FunctionCallRunContext
    | FunctionCallRankContext
    | FunctionCallLastFirstValueContext;

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
