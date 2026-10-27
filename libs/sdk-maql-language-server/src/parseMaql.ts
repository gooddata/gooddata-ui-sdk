// (C) 2022-2026 GoodData Corporation

import {
    type ANTLRErrorListener,
    CommonTokenStream,
    type DefaultErrorStrategy,
    type ParserRuleContext,
} from "antlr4ng";

import {
    type AstNode,
    CaseInsensitiveCharStream,
    MaqlAstVisitor,
    MaqlLexer,
    type MaqlLexer as MaqlLexerType,
    MaqlParser,
    type MaqlParser as MaqlParserType,
} from "@gooddata/maql-antlr4ts";

/**
 * Class holding different representations of a MAQL query
 * Raw string, ANTLR4 classes (Lexer, TokenStream, Parser, parse tree), abstract syntax tree (AST)
 */
class MaqlQuery {
    get lexer(): MaqlLexerType {
        this._lexer.reset();
        return this._lexer;
    }

    get tokenStream(): CommonTokenStream {
        this._tokenStream.fill();
        return this._tokenStream;
    }

    get parser(): MaqlParserType {
        this._parser.reset();
        return this._parser;
    }

    get tree(): ParserRuleContext {
        if (!this._tree) {
            this._tree = this.parser.maql();
        }
        return this._tree;
    }

    get ast(): AstNode {
        if (!this._ast) {
            const maqlAstVisitor = new MaqlAstVisitor("", this.tokenStream);
            this._ast = maqlAstVisitor.visit(this.tree);
        }
        return this._ast;
    }

    private readonly _lexer: MaqlLexerType;
    private readonly _tokenStream: CommonTokenStream;
    private readonly _parser: MaqlParserType;
    private _tree: ParserRuleContext | undefined;
    private _ast: AstNode | undefined;

    constructor(readonly raw: string) {
        const charStream = new CaseInsensitiveCharStream(raw);
        this._lexer = new MaqlLexer(charStream);
        this._tokenStream = new CommonTokenStream(this._lexer);
        this._parser = new MaqlParser(this._tokenStream);
    }

    addErrorListener(listener: ANTLRErrorListener): this {
        this._parser.addErrorListener(listener);
        this.notifyChangedConfiguration();
        return this;
    }

    removeErrorListeners(): this {
        this._parser.removeErrorListeners();
        this.notifyChangedConfiguration();
        return this;
    }

    setErrorHandler(errorHandler: DefaultErrorStrategy): this {
        this._parser.errorHandler = errorHandler;
        this.notifyChangedConfiguration();
        return this;
    }

    private notifyChangedConfiguration() {
        this._tree = undefined;
        this._ast = undefined;
    }
}

/**
 * Class holding different representations of a MAQL metric
 * Used for convenience, adds the string "parse metric\\n" to the beginning of the metric so
 * that it is a valid MAQL query.
 */
export class MaqlMetric extends MaqlQuery {
    private static readonly prefix: string = "parse metric\n";

    static offset(offset: number): number {
        return MaqlMetric.prefix.length + offset;
    }

    /** Inverse of {@link MaqlMetric.offset}: a parser offset back into the metric's own text. */
    static rawOffset(parserOffset: number): number {
        return parserOffset - MaqlMetric.prefix.length;
    }

    constructor(raw: string, addDefaultErrorListener = false) {
        super(MaqlMetric.prefix + raw);
        if (!addDefaultErrorListener) {
            super.removeErrorListeners();
        }
    }

    get length(): number {
        return this.raw.length - MaqlMetric.prefix.length;
    }
}

/**
 * Get the first token ID matching a given string `name`
 */
export function getTokenIdFromName(name: string): number {
    return new MaqlLexer(new CaseInsensitiveCharStream(name)).nextToken().type;
}
