// (C) 2021-2026 GoodData Corporation

import { useMemo } from "react";

import { type IStandaloneEditorConstructionOptions } from "../MonacoEditor.js";

export function useEditorOptions(
    readonly: boolean,
    inline: boolean | undefined,
    options: Partial<IStandaloneEditorConstructionOptions> = {},
): IStandaloneEditorConstructionOptions {
    return useMemo<IStandaloneEditorConstructionOptions>(
        () => ({
            "semanticHighlighting.enabled": true,
            padding: { top: 15 },
            scrollBeyondLastLine: false,
            renderLineHighlight: "none",
            wordBasedSuggestions: "off",
            minimap: { enabled: false },
            fontFamily: "monospace",
            fontSize: 14,
            lineHeight: 22,
            glyphMargin: false,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 4,
            scrollbar: {
                ...(inline
                    ? {
                          verticalScrollbarSize: 12,
                      }
                    : {
                          vertical: "hidden",
                          verticalScrollbarSize: 0,
                      }),
                alwaysConsumeMouseWheel: !readonly,
            },
            overviewRulerBorder: false,
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            suggest: {
                snippetsPreventQuickSuggestions: false,
                showStatusBar: false,
            },
            suggestLineHeight: 22,
            suggestFontSize: 13,
            tabSize: 2,
            detectIndentation: false,
            readOnly: readonly,
            domReadOnly: readonly,
            ...(inline
                ? {
                      padding: { top: 10, bottom: 10, right: 0, left: 0 },
                      fontSize: 12,
                      lineHeight: 18,
                  }
                : {}),
            ...options,
            editContext: false,
        }),
        [inline, readonly, options],
    );
}
