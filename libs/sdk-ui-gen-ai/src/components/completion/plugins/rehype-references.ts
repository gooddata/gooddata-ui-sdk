// (C) 2022-2026 GoodData Corporation

import cx from "classnames";
import { type Root } from "mdast";
import { type Node, type Parent } from "unist";

import { type TextContentObject } from "../../../model.js";

import { PLACEHOLDER_START, getPlaceholderRegex } from "./reference-placeholder.js";
import { type HtmlNode, type TextNode } from "./types.js";

const VERBATIM_TAG_NAMES = ["code", "pre"];

/**
 * `tokens` must be the `tokens` array `extractReferences()` returned for the same
 * Markdown text — placeholders are resolved by looking up their embedded index in it.
 */
export function rehypeReferences(references: TextContentObject[], tokens: string[]) {
    return function () {
        return function (tree: Root) {
            iterateTree(tree as HtmlNode, references, tokens, {
                onTextNodeReference: (text, obj) => {
                    return [
                        {
                            type: "element",
                            tagName: "span",
                            properties: {
                                className: cx("gd-gen-ai-chat__message__object", {
                                    metric: obj.type === "metric",
                                    attribute: obj.type === "attribute",
                                    label: obj.type === "label",
                                    fact: obj.type === "fact",
                                    date: obj.type === "date",
                                    dataset: obj.type === "dataset",
                                    dashboard: obj.type === "dashboard",
                                    visualization: obj.type === "visualization",
                                }),
                                style: {},
                                "data-id": obj.id,
                                "data-type": obj.type,
                                tabIndex: 0,
                            },
                            position: text?.position ?? undefined,
                            children: [
                                {
                                    type: "element",
                                    tagName: "span",
                                    properties: {
                                        className: cx("gd-gen-ai-chat__message-icon"),
                                        style: {},
                                    },
                                    children: [],
                                },
                                { type: "text", value: obj.title },
                            ],
                        },
                    ];
                },
            });
            return tree;
        };
    };
}

function iterateTree(
    node: HtmlNode,
    references: TextContentObject[],
    tokens: string[],
    callbacks: {
        onTextNodeReference: (text: TextNode, obj: TextContentObject) => Parent[];
    },
    verbatim = false,
): Parent[] {
    if (node.type === "text") {
        const value = (node as TextNode).value;
        if (!value.includes(PLACEHOLDER_START)) {
            return [node];
        }
        return splitTextNode(node as TextNode, references, tokens, callbacks.onTextNodeReference, verbatim);
    }
    const inVerbatim = verbatim || VERBATIM_TAG_NAMES.includes(node.tagName);
    if (node.children) {
        node.children = node.children.reduce((acc, child) => {
            return [...acc, ...iterateTree(child as HtmlNode, references, tokens, callbacks, inVerbatim)];
        }, [] as Node[]);
        return [node];
    }
    return [node];
}

/**
 * Replaces placeholder occurrences with their original `{type/id}` token text, so the
 * output never leaks a raw placeholder sentinel (an invisible PUA-wrapped digit)
 * as visible text.
 */
function restorePlaceholders(value: string, tokens: string[]): string {
    return value.replace(getPlaceholderRegex(), (match, indexStr: string) => {
        const originalToken = tokens[Number(indexStr)];
        return originalToken ?? match;
    });
}

function splitTextNode(
    text: TextNode,
    references: TextContentObject[],
    tokens: string[],
    onTextNodeReference: (text: TextNode, obj: TextContentObject) => Parent[],
    verbatim: boolean,
): Parent[] {
    const nodes: Parent[] = [];
    const regex = getPlaceholderRegex();
    let lastIndex = 0;

    const pushText = (value: string) => {
        if (value) {
            const textNode: TextNode = { ...text, value: restorePlaceholders(value, tokens) };
            nodes.push(textNode);
        }
    };

    let match = regex.exec(text.value);
    while (match) {
        const originalToken = tokens[Number(match[1])];
        const ref = resolveReference(originalToken, references);
        if (ref) {
            pushText(text.value.slice(lastIndex, match.index));
            nodes.push(...onTextNodeReference(text, ref));
            if (verbatim) {
                pushText(` ${originalToken}`);
            }
            lastIndex = match.index + match[0].length;
        }
        match = regex.exec(text.value);
    }
    pushText(text.value.slice(lastIndex));

    return nodes;
}

function resolveReference(
    originalToken: string | undefined,
    references: TextContentObject[],
): TextContentObject | undefined {
    if (!originalToken) {
        return undefined;
    }
    const [type, id] = originalToken.slice(1, -1).split("/");
    return references.find((ref) => ref.id === id && ref.type === type);
}
