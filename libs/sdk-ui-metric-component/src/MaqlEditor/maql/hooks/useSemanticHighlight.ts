// (C) 2021-2026 GoodData Corporation

import { useEffect } from "react";

import * as monaco from "monaco-editor/editor/editor.api.js";
//more info in README.md
import { type InitializeResult, type SemanticTokens } from "vscode-languageserver";

import { type MaqlLanguageService } from "@gooddata/sdk-maql-language-server";

import { createDocument } from "../utils.js";

export function useSemanticHighlight(
    languageId: string,
    languageService: MaqlLanguageService | undefined,
    initializeData: InitializeResult | undefined,
): void {
    useEffect(() => {
        if (!languageService || !initializeData) {
            return;
        }

        // Semantic highlighting - register a semantic tokens provider from MAQL LS
        const disposeHighlighting = monaco.languages.registerDocumentSemanticTokensProvider(languageId, {
            getLegend: () =>
                initializeData.capabilities.semanticTokensProvider?.legend || {
                    tokenTypes: [],
                    tokenModifiers: [],
                },
            provideDocumentSemanticTokens: (model) => {
                const document = createDocument(model);
                return languageService.doSemanticTokens(document).then((tokens: SemanticTokens) => {
                    return {
                        ...tokens,
                        data: new Uint32Array(tokens.data),
                    };
                });
            },
            releaseDocumentSemanticTokens: () => {
                /*do nothing*/
            },
        });

        return () => {
            disposeHighlighting.dispose();
        };
    }, [languageId, languageService, initializeData]);
}
