// (C) 2021-2026 GoodData Corporation

import { useEffect } from "react";

import * as monaco from "monaco-editor/editor/editor.api.js";

//more info in README.md

export function useSyntaxHighlight(languageId: string): void {
    useEffect(() => {
        // Syntax highlighting - register a tokens provider for MAQL - works for code blocks in Markdown
        const disposeHighlighting = monaco.languages.setMonarchTokensProvider(languageId, {
            tokenizer: {
                root: [
                    [/\{fact\/[^}]*\}/gi, "fact"],
                    [/\{metric\/[^}]*\}/gi, "metric"],
                    [/\{dataset\/[^}]*\}/gi, "dataset"],
                    [/\{attribute\/[^}]*\}/gi, "attribute"],
                    [/\{computed_attribute\/[^}]*\}/gi, "attribute"],
                    [/\{label\/[^}]*\}/gi, "label"],
                    [/\{[^}]*\}/g, "variable"],
                    [/\w+/g, "keyword"],
                    [/"(?:[^"\\]|\\.)*"/g, "string"],
                    [/#[^\n]*/g, "comment"],
                ],
            },
        });

        return () => {
            disposeHighlighting.dispose();
        };
    }, [languageId]);
}
