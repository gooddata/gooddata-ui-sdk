// (C) 2022-2025 GoodData Corporation

import { Parent } from "unist";

export type HtmlNode = Parent & { type: string; tagName: string; properties: Record<string, string> };
export type TextNode = HtmlNode & { value: string };

export const REFERENCE_REGEX_SPLIT = /(\{(?:label|metric)\/[a-z0-9._-]*\})/gi;
export const REFERENCE_REGEX_MATCH = /(\{((label|metric)\/([a-z0-9._-]*))\})/gi;
