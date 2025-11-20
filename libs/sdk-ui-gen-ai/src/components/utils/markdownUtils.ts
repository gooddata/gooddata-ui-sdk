// (C) 2025 GoodData Corporation

const MARKDOWN_ESCAPE_PATTERN = /(\{[^{}]*\})|[\\`*_{}[\]()#+\-.!]/g;

export function escapeMarkdown(text: string): string {
    return text.replace(MARKDOWN_ESCAPE_PATTERN, (match, inBraces: string) => inBraces || `\\${match}`);
}
