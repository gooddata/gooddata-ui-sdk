// (C) 2022-2025 GoodData Corporation
import { Parent } from "unist";
import { Options } from "react-markdown";

export type TextNode = Parent & { value: string };

export const EMPTY_OPTIONS: Readonly<Options> = {};

export const REFERENCE_REGEX_SPLIT = /(\{(?:label|metric)\/[a-z0-9._-]*\})/gi;
export const REFERENCE_REGEX_MATCH = /(\{((label|metric)\/([a-z0-9._-]*))\})/gi;
