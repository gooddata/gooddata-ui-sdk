// (C) 2022-2026 GoodData Corporation

import { useMemo } from "react";

import type * as monaco from "monaco-editor/editor/editor.api.js";
//more info in README.md

export type ILanguageConfiguration = monaco.languages.LanguageConfiguration;

export function useLanguageConfiguration(): ILanguageConfiguration {
    return useMemo<ILanguageConfiguration>(
        () => ({
            comments: {
                lineComment: "#",
                blockComment: null,
            },
            brackets: [["(", ")"]],
            autoClosingPairs: [
                { open: "{", close: "}" },
                { open: "(", close: ")" },
                { open: '"', close: '"' },
            ],
            surroundingPairs: [
                { open: "{", close: "}" },
                { open: "(", close: ")" },
                { open: '"', close: '"' },
            ],
        }),
        [],
    );
}
