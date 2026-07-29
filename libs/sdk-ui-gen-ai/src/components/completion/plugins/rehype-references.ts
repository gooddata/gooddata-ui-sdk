// (C) 2022-2026 GoodData Corporation

import cx from "classnames";
import { type Root } from "mdast";
import { type Node, type Parent } from "unist";

import { type TextContentObject } from "../../../model.js";

import { PLACEHOLDER_START, getPlaceholderRegex } from "./reference-placeholder.js";
import { type HtmlNode, type TextNode } from "./types.js";

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
                                    dashboard: obj.type === "dashboard",
                                    visualization: obj.type === "visualization",
                                }),
                                style: {},
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
): Parent[] {
    if (node.type === "text") {
        const value = (node as TextNode).value;
        if (!value.includes(PLACEHOLDER_START)) {
            return [node];
        }
        const res = iterateReferenceMatch(value, references, tokens, (ref) => {
            return callbacks.onTextNodeReference(node as TextNode, ref);
        });
        if (res.length) {
            return res;
        }
        (node as TextNode).value = restoreUnresolvedPlaceholders(value, tokens);
        return [node];
    }
    if (node.children) {
        node.children = node.children.reduce((acc, child) => {
            return [...acc, ...iterateTree(child as HtmlNode, references, tokens, callbacks)];
        }, [] as Node[]);
        return [node];
    }
    return [node];
}

/**
 * Replaces any placeholder occurrences left in a text node (i.e. ones that did not
 * resolve to a reference chip) with their original `{type/id}` token text, so the
 * output never leaks a raw placeholder sentinel (an invisible PUA-wrapped digit)
 * as visible text.
 */
function restoreUnresolvedPlaceholders(value: string, tokens: string[]): string {
    return value.replace(getPlaceholderRegex(), (match, indexStr: string) => {
        const originalToken = tokens[Number(indexStr)];
        return originalToken ?? match;
    });
}

function iterateReferenceMatch<T>(
    value: string,
    references: TextContentObject[],
    tokens: string[],
    onMatch: (obj: TextContentObject) => T[],
): T[] {
    const items: T[] = [];
    const regex = getPlaceholderRegex();

    let match = regex.exec(value);
    while (match) {
        const originalToken = tokens[Number(match[1])];
        if (originalToken) {
            const [type, id] = originalToken.slice(1, -1).split("/");
            const ref = references.find((ref) => ref.id === id && ref.type === type);
            if (ref) {
                items.push(...onMatch(ref));
            }
        }
        match = regex.exec(value);
    }
    return items;
}
