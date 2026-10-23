// (C) 2022-2026 GoodData Corporation

//more info in README.md
import { useEffect } from "react";

import * as monaco from "monaco-editor/editor/editor.api.js";

import { type MaqlLanguageService } from "@gooddata/sdk-maql-language-server";

import { formatDocument } from "../formatter.js";
import { createDocument } from "../utils.js";

export function useDocumentFormatting(
    languageId: string,
    languageService: MaqlLanguageService | undefined,
): void {
    useEffect(() => {
        if (!languageService) {
            return;
        }

        const disposeFormatting = monaco.languages.registerDocumentFormattingEditProvider(languageId, {
            provideDocumentFormattingEdits: (model, options) => {
                const document = createDocument(model);
                return formatDocument(languageService, document, options);
            },
        });

        const disposeRangeFormatting = monaco.languages.registerDocumentRangeFormattingEditProvider(
            languageId,
            {
                provideDocumentRangeFormattingEdits: (model, range, options) => {
                    const document = createDocument(model);
                    return formatDocument(languageService, document, options, range);
                },
            },
        );

        return () => {
            disposeFormatting.dispose();
            disposeRangeFormatting.dispose();
        };
    }, [languageId, languageService]);
}
