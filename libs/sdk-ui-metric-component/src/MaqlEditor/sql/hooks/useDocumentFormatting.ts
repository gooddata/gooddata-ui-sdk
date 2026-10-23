// (C) 2022-2026 GoodData Corporation

import { useEffect } from "react";

import * as monaco from "monaco-editor/editor/editor.api.js";

//more info in README.md
import { formatDocument } from "../formatter.js";
import { createDocument } from "../utils.js";

export function useDocumentFormatting(languageId: string): void {
    useEffect(() => {
        const disposeFormatting = monaco.languages.registerDocumentFormattingEditProvider(languageId, {
            provideDocumentFormattingEdits: (model, options) => {
                const document = createDocument(model);
                return formatDocument(document, options, model.getFullModelRange());
            },
        });

        const disposeRangeFormatting = monaco.languages.registerDocumentRangeFormattingEditProvider(
            languageId,
            {
                provideDocumentRangeFormattingEdits: (model, range, options) => {
                    const document = createDocument(model, range);
                    return formatDocument(document, options, range);
                },
            },
        );

        return () => {
            disposeFormatting.dispose();
            disposeRangeFormatting.dispose();
        };
    }, [languageId]);
}
