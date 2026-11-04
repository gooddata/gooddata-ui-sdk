// (C) 2021-2026 GoodData Corporation

import { format } from "sql-formatter";
import { type FormattingOptions } from "vscode-languageserver-types";

export const SQL_FORMATTING_OPTIONS: FormattingOptions = { tabSize: 4, insertSpaces: true };

/**
 * The text formatted as SQL, or as it is when the formatter cannot parse it.
 */
export function formatValue(text: string, options: FormattingOptions = SQL_FORMATTING_OPTIONS): string {
    try {
        return format(text, {
            useTabs: !options.insertSpaces,
            tabWidth: options.tabSize,
        });
    } catch {
        return text;
    }
}
