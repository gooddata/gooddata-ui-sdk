// (C) 2022-2026 GoodData Corporation

import { type Token, type TokenStream } from "antlr4ts";

import MaqlPkg, {
    type AstNode,
    type FunctionNode,
    type IPosition,
    type OrderByElementNode,
} from "@gooddata/maql-antlr4ts";
const { AbstractAstVisitor, MaqlParser, positionInRange } = MaqlPkg;

import { type MaqlMetric } from "../parseMaql.js";
import { MaqlType, abstractValueTypes } from "../types/hierarchy.js";
import {
    type IMaqlCallParameter,
    type MaqlCallDefinition,
    findFunctionDefinitions,
} from "../types/signatures.js";

export interface ICaretContext {
    /** List of AST nodes whose range includes the caret. Starts from the deepest node */
    nodeStack: AstNode[];
    /** List of types that are expected to be present at the caret position */
    expectedTypes: MaqlType[];
    /** Final tokens surrounding the caret position */
    tokens: { caretToken: Token; leftFinalToken: Token; rightFinalToken: Token };
}

export function findContext(metric: MaqlMetric, caretPosition: IPosition, offset: number): ICaretContext {
    const finder = new AstContextFinder(caretPosition);
    const [leftFinalToken, caretToken, rightFinalToken] = findCaretToken(metric.tokenStream, offset);
    const context = finder.visit(metric.ast);
    if (context.caretExpectedTypes.size === 0) {
        // no information is inferred therefore allow everything
        context.caretExpectedTypes.add(MaqlType.ANY);
    }
    return {
        nodeStack: context.nodeStack,
        expectedTypes: Array.from(context.caretExpectedTypes),
        tokens: {
            leftFinalToken,
            caretToken,
            rightFinalToken,
        },
    };
}

class AstContext {
    /**
     * @param nodeStack - List of AST nodes whose range includes the caret. Starts from the deepest node
     * @param caretExpectedTypes - List of possible MAQL types expected at caret position
     */
    constructor(
        readonly nodeStack: AstNode[] = [],
        readonly caretExpectedTypes: Set<MaqlType> = new Set(),
    ) {}
}

class AstContextFinder extends AbstractAstVisitor<AstContext> {
    constructor(readonly caretPosition: IPosition) {
        super();
    }

    defaultResult(): AstContext {
        return new AstContext();
    }

    protected override aggregateResult(aggregate: AstContext, nextResult: AstContext): AstContext {
        return aggregate.nodeStack.length === 0 ? nextResult : aggregate;
    }

    protected override mergeResultWithParent(parentNode: AstNode, result: AstContext): AstContext {
        // Add `parentNode` to `result.nodeStack` if the caret position is in range
        if (parentNode.contextRange && positionInRange(this.caretPosition, parentNode.contextRange)) {
            result.nodeStack.push(parentNode);
        }
        return result;
    }

    override visitFunctionNode(node: FunctionNode): AstContext {
        const args = node.content.map((child) => this.visit(child));
        // find the index of argument with the caret position
        const argIdx = args.findIndex((arg) => arg.nodeStack.length > 0);
        const argContext = args[argIdx] ?? new AstContext();
        if (this.isCaretContext(argContext)) {
            return this.mergeResultWithParent(node, argContext);
        }
        const defs: MaqlCallDefinition[] = findFunctionDefinitions(node.type, node.name);
        // if no argument has the caret position, definitions exists, and the caret is still within the function range,
        // assume that the user wants the next argument of the function
        const range = node.contextRange;
        const idx =
            argIdx === -1 && defs.length !== 0 && range && positionInRange(this.caretPosition, range)
                ? args.length
                : argIdx;
        if (idx === -1) {
            return this.mergeResultWithParent(node, argContext);
        }
        const allowedTypes = defs
            .map((def): IMaqlCallParameter[] => {
                return def.vararg ? Array(args.length).fill(def.parameters[0]) : def.parameters;
            })
            .map((paramTypes) => paramTypes[idx]?.type)
            .filter((type): type is MaqlType => type !== undefined);
        return this.mergeResultWithParent(node, new AstContext(argContext.nodeStack, new Set(allowedTypes)));
    }

    override visitOrderByElement(node: OrderByElementNode): AstContext {
        const elementCtx = this.visit(node.content[0]);
        if (this.isCaretContext(elementCtx)) {
            return this.mergeResultWithParent(node, elementCtx);
        }
        return this.mergeResultWithParent(
            node,
            new AstContext(elementCtx.nodeStack, new Set(abstractValueTypes)),
        );
    }

    /**
     * Check that the context is the one most relevant to the location of the caret
     */
    private isCaretContext(ctx: AstContext): boolean {
        // nodeStack > 1 means caret is in a deeper rule, expected types mean that the context is already restricted
        return ctx.nodeStack.length > 1 || ctx.caretExpectedTypes.size > 0;
    }
}

/**
 * Function to find position of the caret for the purposes of completions.
 * The caret position may be ambiguous in regard to the caret token.
 * The caret token is the place at which position we want to place completions.
 * We can imagine it as removing the token and everything after it
 * Consider these two examples, '|' signifies caret position
 * 1. parse metric SELECT SUM(|)
 * 2. parse metric SELECT SUM(Price|)
 * In both queries, we want to see suggestions as if the query was 'SELECT SUM('.
 * In query 1, the caret token is on the RIGHT of the caret: ')'.
 * In query 2, the caret token is on the LEFT of the caret: 'Price'
 * This function resolves this by separating tokens into two categories - "final" (F) and "extensible" (X).
 * Final tokens cannot change by appending characters to them. These are tokens like parentheses, commas, operators,
 * completed strings and end-of-file. Extensible tokens are rewritable - these include all keywords, functions,
 * unterminated strings and incomplete objects (missing '\}'). When the caret is at the boundary of two tokens, the caret
 * token is decided as follows:
 * F | F -\> RIGHT
 * F | X -\> RIGHT
 * X | F -\> LEFT
 * X | X -\> LEFT
 * After caret token is found, the function looks for the closest final tokens on the left and right to serve as
 * boundaries for text edit range on completion.
 * @returns [Token, Token, Token]
 *          - leftFinalToken - last final token before or including caret token
 *          - caretToken - the actual token where the caret is currently placed, to be passed into antlr4c3 completion core
 *          - rightFinalToken - first final token after or including caret token
 */
function findCaretToken(
    tokenStream: TokenStream,
    offset: number,
): [leftFinalToken: Token, caretToken: Token, rightFinalToken: Token] {
    let caretToken = tokenStream.get(0),
        leftFinalToken,
        rightFinalToken;
    // first find the caret token
    for (let tokenIndex = 0; tokenIndex < tokenStream.size; tokenIndex++) {
        const nextToken = tokenStream.get(tokenIndex);
        if (nextToken.startIndex < offset || (nextToken.startIndex === offset && isFinal(caretToken))) {
            caretToken = nextToken;
        }
        if (nextToken.startIndex >= offset) break;
    }
    for (let tokenIndex = caretToken.tokenIndex; tokenIndex < tokenStream.size; tokenIndex++) {
        const nextToken = tokenStream.get(tokenIndex);
        if (nextToken.type !== MaqlParser.RBRACE && isFinal(nextToken)) {
            // rewriting RBRACE is allowed if approached from the left side
            rightFinalToken = nextToken;
            break;
        }
    }
    for (let tokenIndex = caretToken.tokenIndex; tokenIndex > 0; tokenIndex--) {
        const prevToken = tokenStream.get(tokenIndex);
        if (isFinal(prevToken)) {
            leftFinalToken = prevToken;
            break;
        }
    }
    return [leftFinalToken ?? caretToken, caretToken, rightFinalToken ?? caretToken];
}

const finalTokens = new Set([
    MaqlParser.WS,
    MaqlParser.EOF,
    MaqlParser.String,
    MaqlParser.ZERO,
    MaqlParser.Natural,
    MaqlParser.Real,
    MaqlParser.PLUS,
    MaqlParser.MINUS,
    MaqlParser.MUL,
    MaqlParser.DIV,
    MaqlParser.PERCENT,
    MaqlParser.RELOP,
    MaqlParser.COMMA,
    MaqlParser.SEMICOLON,
    MaqlParser.LPAREN,
    MaqlParser.RPAREN,
    MaqlParser.RBRACE,
]);

export function isFinal(token: Token): boolean {
    return finalTokens.has(token.type);
}
