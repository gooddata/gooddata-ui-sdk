// (C) 2022-2025 GoodData Corporation
import { Parent } from "unist";

export type HtmlNode = Parent & { type: string; tagName: string; properties: Record<string, string> };
export type TextNode = HtmlNode & { value: string };
