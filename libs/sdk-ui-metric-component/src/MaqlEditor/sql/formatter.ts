// (C) 2021-2026 GoodData Corporation

import type * as monaco from "monaco-editor/editor/editor.api.js";
import { format } from "sql-formatter";
import { type TextDocument } from "vscode-languageserver-textdocument";

//more info in README.md
import { type FormattingOptions, type Range } from "../monaco/MonacoEditor.js";

export function formatDocument(
    document: TextDocument,
    options: FormattingOptions,
    range: Range,
): monaco.languages.TextEdit[] {
    const formatted = formatValue(document.getText(), options);
    return [
        {
            range: range,
            text: formatted,
        },
    ];
}

export function formatValue(text: string, options: FormattingOptions): string {
    return format(text, {
        useTabs: !options.insertSpaces,
        tabWidth: options.tabSize,
    });
}
