// (C) 2023-2026 GoodData Corporation

import { SemanticTokensBuilder } from "vscode-languageserver";

import { type HighlightToken, semanticTokensLegend } from "./semanticsHighlight.js";
import { getModifiers, getType } from "./utils.js";

export function convertToSemanticTokens(tokens: HighlightToken[]) {
    const builder = new SemanticTokensBuilder();
    tokens.forEach(({ position, type, modifiers }) => {
        const length = position.end.character - position.start.character;
        builder.push(
            position.start.line,
            position.start.character,
            length,
            getType(semanticTokensLegend.tokenTypes, type),
            getModifiers(semanticTokensLegend.tokenModifiers, modifiers),
        );
    });
    return builder.build();
}
