// (C) 2021-2026 GoodData Corporation

import { type ParseTreeListener, ParseTreeWalker, type TerminalNode } from "antlr4ts/tree/index.js";

import MaqlPkg, {
    type AttributeContext,
    type FactContext,
    type MaqlParserListener,
    type NumericContext,
    type ObjectContext,
    type ParameterContext,
    type PromptContext,
} from "@gooddata/maql-antlr4ts";
const { AttributeTypeContext, MaqlParser, NumericTypeContext } = MaqlPkg;
import { isTigerType, tigerIdTypeToObjectType } from "@gooddata/sdk-backend-tiger";
import { type ObjectType } from "@gooddata/sdk-model";

import { normalizeMaqlObjectType } from "./maqlObjectTypes.js";
import { MaqlMetric } from "./parseMaql.js";
import { type IMaqlObject, antlrContextRange } from "./tokenRanges.js";

/**
 * A `{type/id}` reference together with where it sits in the metric's own text.
 */
export interface IMaqlObjectAt extends IMaqlObject {
    readonly offsets: { readonly start: number; readonly end: number };
}

export function findAllObjects(metric: MaqlMetric): IMaqlObjectAt[] {
    const finder: ObjectFinder = new ObjectFinder();
    ParseTreeWalker.DEFAULT.walk(finder, metric.tree);
    return finder.objects;
}

// TODO rewrite using AbstractAstVisitor
class ObjectFinder implements MaqlParserListener, ParseTreeListener {
    visitTerminal?: (/*@NotNull*/ node: TerminalNode) => void; // to satisfy TS2559 - weak type detection

    constructor(readonly objects: IMaqlObjectAt[] = []) {}

    pushObject(ctx: ObjectContext, type: string | undefined): void {
        const lbrace = ctx.tryGetToken(MaqlParser.LBRACE, 0);
        const sep = ctx.tryGetToken(MaqlParser.SEP, 0);
        const id = ctx.tryGetToken(MaqlParser.ID, 0);
        const rbrace = ctx.tryGetToken(MaqlParser.RBRACE, 0);
        // check that the object is complete
        if (
            lbrace === undefined ||
            lbrace.symbol.tokenIndex === -1 ||
            sep === undefined ||
            sep.symbol.tokenIndex === -1 ||
            id === undefined ||
            id.symbol.tokenIndex === -1 ||
            rbrace === undefined ||
            rbrace.symbol.tokenIndex === -1 ||
            type === undefined
        ) {
            return;
        }
        const range = antlrContextRange(ctx.start, ctx.stop);
        // `actualType` keeps the MAQL spelling so diagnostics quote what the author wrote.
        //NOTE: The lexer accepts any casing, so fold it before the type is looked up.
        const tigerType = normalizeMaqlObjectType(type.toLowerCase());
        this.objects.push({
            tigerType: isTigerType(tigerType) ? tigerType : undefined,
            actualType: type,
            id: ctx.ID().text,
            ref: {
                type: (tigerIdTypeToObjectType as unknown as Record<string, ObjectType | undefined>)[
                    tigerType
                ],
                identifier: ctx.ID().text,
            },
            range: range,
            offsets: {
                start: MaqlMetric.rawOffset(ctx.start.startIndex),
                end: MaqlMetric.rawOffset((ctx.stop?.stopIndex ?? ctx.start.stopIndex) + 1),
            },
        });
    }

    exitAttribute(ctx: AttributeContext) {
        this.pushObject(ctx, ctx.tryGetRuleContext(0, AttributeTypeContext)?.text);
    }

    exitNumeric(ctx: NumericContext) {
        this.pushObject(ctx, ctx.tryGetRuleContext(0, NumericTypeContext)?.text);
    }

    exitFact(ctx: FactContext) {
        this.pushObject(ctx, ctx.tryGetToken(MaqlParser.FACT, 0)?.text);
    }

    exitPrompt(ctx: PromptContext) {
        this.pushObject(ctx, ctx.tryGetToken(MaqlParser.PROMPT, 0)?.text);
    }

    exitParameter(ctx: ParameterContext) {
        this.pushObject(ctx, ctx.tryGetToken(MaqlParser.PARAMETER, 0)?.text);
    }
}
