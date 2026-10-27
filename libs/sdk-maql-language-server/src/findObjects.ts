// (C) 2021-2026 GoodData Corporation

import { ParseTreeWalker } from "antlr4ng";

import {
    type AttributeContext,
    AttributeTypeContext,
    type FactContext,
    MaqlParser,
    MaqlParserListener,
    type NumericContext,
    NumericTypeContext,
    type ObjectContext,
    type ParameterContext,
    type PromptContext,
} from "@gooddata/maql-antlr4ts";
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
class ObjectFinder extends MaqlParserListener {
    constructor(readonly objects: IMaqlObjectAt[] = []) {
        super();
    }

    pushObject(ctx: ObjectContext, type: string | undefined): void {
        const lbrace = ctx.getToken(MaqlParser.LBRACE, 0);
        const sep = ctx.getToken(MaqlParser.SEP, 0);
        const id = ctx.getToken(MaqlParser.ID, 0);
        const rbrace = ctx.getToken(MaqlParser.RBRACE, 0);
        const start = ctx.start;
        // check that the object is complete
        if (
            lbrace === null ||
            lbrace.symbol.tokenIndex === -1 ||
            sep === null ||
            sep.symbol.tokenIndex === -1 ||
            id === null ||
            id.symbol.tokenIndex === -1 ||
            rbrace === null ||
            rbrace.symbol.tokenIndex === -1 ||
            type === undefined ||
            start === null
        ) {
            return;
        }
        const range = antlrContextRange(start, ctx.stop);
        // `actualType` keeps the MAQL spelling so diagnostics quote what the author wrote.
        //NOTE: The lexer accepts any casing, so fold it before the type is looked up.
        const tigerType = normalizeMaqlObjectType(type.toLowerCase());
        this.objects.push({
            tigerType: isTigerType(tigerType) ? tigerType : undefined,
            actualType: type,
            id: id.getText(),
            ref: {
                type: (tigerIdTypeToObjectType as unknown as Record<string, ObjectType | undefined>)[
                    tigerType
                ],
                identifier: id.getText(),
            },
            range: range,
            offsets: {
                start: MaqlMetric.rawOffset(start.start),
                end: MaqlMetric.rawOffset((ctx.stop?.stop ?? start.stop) + 1),
            },
        });
    }

    override exitAttribute = (ctx: AttributeContext): void => {
        this.pushObject(ctx, ctx.getRuleContext(0, AttributeTypeContext)?.getText());
    };

    override exitNumeric = (ctx: NumericContext): void => {
        this.pushObject(ctx, ctx.getRuleContext(0, NumericTypeContext)?.getText());
    };

    override exitFact = (ctx: FactContext): void => {
        this.pushObject(ctx, ctx.getToken(MaqlParser.FACT, 0)?.getText());
    };

    override exitPrompt = (ctx: PromptContext): void => {
        this.pushObject(ctx, ctx.getToken(MaqlParser.PROMPT, 0)?.getText());
    };

    override exitParameter = (ctx: ParameterContext): void => {
        this.pushObject(ctx, ctx.getToken(MaqlParser.PARAMETER, 0)?.getText());
    };
}
