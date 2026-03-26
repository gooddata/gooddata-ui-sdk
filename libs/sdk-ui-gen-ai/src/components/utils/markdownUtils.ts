// (C) 2025-2026 GoodData Corporation

const MARKDOWN_ESCAPE_PATTERN = /(\{[^{}]*\})|[\\`*_{}[\]()#+\-.!]/g;

export function escapeMarkdown(text: string): string {
    return text.replace(MARKDOWN_ESCAPE_PATTERN, (match, inBraces: string) => inBraces || `\\${match}`);
}

/**
 * Removes all markdown marks and replaces newlines with space.
 */
export function removeMarkdown(text: string): string {
    return text
        .replace(/(\*\*|__)(.*?)\1/g, "$2") // bold
        .replace(/(\*|_)(.*?)\1/g, "$2") // italic
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1") // links
        .replace(/`([^`]+)`/g, "$1") // code
        .replace(/#{1,6}\s+(.*)/gm, "$1") // headers
        .replace(/>\s+(.*)/gm, "$1") // blockquotes
        .replace(/^\s*[-*+]\s+(.*)/gm, "$1") // unordered lists
        .replace(/^\s*\d+\.\s+(.*)/gm, "$1") // ordered lists
        .replace(/(\r\n|\n|\r)/gm, " ") // replace newlines with space
        .replace(/ {2,}/g, " ") // remove double spaces
        .trim();
}
