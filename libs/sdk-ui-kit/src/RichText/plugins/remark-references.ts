// (C) 2022-2025 GoodData Corporation
import { Parent, Point } from "unist";

import { REFERENCE_REGEX_SPLIT, TextNode } from "./types.js";

export function remarkReferences() {
    return function () {
        return function (tree: Parent) {
            iterateTree(tree, {
                onText: (text) => {
                    const nodes: TextNode[] = [];
                    const parts = text.value.split(REFERENCE_REGEX_SPLIT);

                    let start = text.position?.start ?? { line: 0, column: 0, offset: 0 };
                    parts.forEach((part) => {
                        const end: Point = {
                            line: start.line,
                            column: start.column + part.length,
                            offset: start.offset + part.length,
                        };

                        nodes.push({
                            ...text,
                            value: part,
                            position: {
                                start,
                                end,
                            },
                        });

                        start = end;
                    });
                    return nodes;
                },
            });
            return tree;
        };
    };
}

function iterateTree(node: Parent, callbacks: { onText: (text: TextNode) => Parent[] }): Parent[] {
    //Text type
    if (node.type === "text") {
        return callbacks.onText(node as TextNode);
    }

    // has children
    if (node.children) {
        node.children = node.children.reduce((acc, child) => {
            return [...acc, ...iterateTree(child as Parent, callbacks)];
        }, []);
        return [node];
    }

    // no children
    return [node];
}
