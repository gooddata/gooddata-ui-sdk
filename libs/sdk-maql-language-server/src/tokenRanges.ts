// (C) 2021-2026 GoodData Corporation

import { type Token } from "antlr4ts";
import { type Range } from "vscode-languageserver";

import { type IRange } from "@gooddata/maql-antlr4ts";

import { type ITigerMetadataObject, type ITigerMetadataObjectStub } from "./metadata/model.js";

export type MetadataObjectAndRange = ITigerMetadataObject & { range: Range };

export interface IOperand {
    readonly range: AntlrRange;
}
export interface IMaqlObject extends IOperand, ITigerMetadataObjectStub {
    readonly actualType: string;
}

export interface IMaqlString extends IOperand {
    readonly string: string;
}

export interface IMaqlTimeMacro extends IOperand {
    readonly transformationFunction: string;
    readonly granularity: string;
}

export function isMaqlObject(obj: IOperand): obj is IMaqlObject {
    return "actualType" in obj;
}

export function isMaqlString(obj: IOperand): obj is IMaqlString {
    return "string" in obj;
}

export function isMaqlTimeMacro(obj: IOperand): obj is IMaqlTimeMacro {
    return "transformationFunction" in obj && "granularity" in obj;
}

export function tokenRange(token: Token): Range {
    // subtract one line to change to indexing from zero
    // subtract one more for the added "parse metric" line
    const startLine = token.line - 2;
    const startCharacter = token.charPositionInLine;
    const lines = token.text?.split("\n") ?? [""];
    const endLine = startLine + lines.length - 1;
    const endCharacter = lines[lines.length - 1].length + (startLine === endLine ? startCharacter : 0);
    return {
        start: { line: startLine, character: startCharacter },
        end: { line: endLine, character: endCharacter },
    };
}

export function defaultRange(
    line: number,
    character: number,
    endLine: number = line,
    endCharacter: number = character,
): Range {
    // subtract one line to change to indexing from zero
    // subtract one more for the added "parse metric" line
    line = line - 2;
    endLine = endLine - 2;
    return {
        start: { line: line, character: character },
        end: { line: endLine, character: endCharacter },
    };
}

export function antlrContextRange(start: Token, stop: Token = start): AntlrRange {
    return new AntlrRange(
        start.line,
        start.charPositionInLine,
        stop.line,
        stop.charPositionInLine + (stop.text?.length ?? 1),
    );
}

export class AntlrRange {
    constructor(
        readonly startLine: number,
        readonly startCharacter: number,
        readonly endLine: number = startLine,
        readonly endCharacter: number = startCharacter,
    ) {}

    static fromAstRange(astRange: IRange) {
        return new AntlrRange(
            astRange.start.line + 1,
            astRange.start.character,
            astRange.end.line + 1,
            astRange.end.character,
        );
    }

    toRange(): Range {
        return defaultRange(this.startLine, this.startCharacter, this.endLine, this.endCharacter);
    }
}
