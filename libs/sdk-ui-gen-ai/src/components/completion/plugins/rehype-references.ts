// (C) 2022-2025 GoodData Corporation

import { Parent, Node } from "unist";
import { Root } from "mdast";
import cx from "classnames";

import { TextContentObject } from "../../../model.js";
import { getReferenceRegex } from "../utils.js";

import { HtmlNode, TextNode } from "./types.js";

export function rehypeReferences(references: TextContentObject[]) {
    return function () {
        return function (tree: Root) {
            iterateTree(tree as HtmlNode, references, {
                onTextNodeReference: (text, obj) => {
                    return [
                        {
                            type: "element",
                            tagName: "span",
                            properties: {
                                className: cx("gd-gen-ai-chat__message__object", {
                                    metric: obj.type === "metric",
                                    attribute: obj.type === "attribute",
                                    fact: obj.type === "fact",
                                    date: obj.type === "dataset",
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
    callbacks: {
        onTextNodeReference: (text: TextNode, obj: TextContentObject) => Parent[];
    },
): Parent[] {
    //Text type
    if (node.type === "text") {
        const res = iterateReferenceMatch((node as TextNode).value, references, (ref) => {
            return callbacks.onTextNodeReference(node as TextNode, ref);
        });
        return res.length ? res : [node];
    }
    if (node.children) {
        // has children
        node.children = node.children.reduce((acc, child) => {
            return [...acc, ...iterateTree(child as HtmlNode, references, callbacks)];
        }, [] as Node[]);
        return [node];
    }

    // no children
    return [node];
}

function iterateReferenceMatch<T>(
    value: string,
    references: TextContentObject[],
    onMatch: (obj: TextContentObject) => T[],
): T[] {
    const items: T[] = [];
    const regex = getReferenceRegex();

    let match = regex.exec(value);
    while (match) {
        const [type, id] = match[1].split("/");

        const ref = references.find((ref) => {
            return ref.id === id && ref.type === type;
        });

        if (ref) {
            items.push(...onMatch(ref));
        }
        match = regex.exec(value);
    }
    return items;
}
