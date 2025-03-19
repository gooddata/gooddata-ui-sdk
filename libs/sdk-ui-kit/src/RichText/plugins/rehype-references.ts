// (C) 2022-2025 GoodData Corporation

import { areObjRefsEqual, IdentifierRef } from "@gooddata/sdk-model";
import { IntlShape } from "react-intl";
import { Root } from "mdast";
import { Parent } from "unist";

import { EvaluatedMetric } from "../hooks/useEvaluatedMetrics.js";
import { createReference } from "../helpers/references.js";

import { HtmlNode, REFERENCE_REGEX_MATCH, REFERENCE_REGEX_SPLIT, TextNode } from "./types.js";

export function rehypeReferences(intl: IntlShape, metrics?: EvaluatedMetric[]) {
    return function () {
        return function (tree: Root) {
            iterateTree(tree as HtmlNode, {
                onTextNodeReference: (text, ref) => {
                    const metric = metrics?.find((m) => areObjRefsEqual(m.ref, ref));
                    return [createMetricValue(intl, text, metric)];
                },
                onTextRawReference: (ref) => {
                    const metric = metrics?.find((m) => areObjRefsEqual(m.ref, ref));
                    return metric.data.formattedValue();
                },
            });
            return tree;
        };
    };
}

function iterateTree(
    node: HtmlNode,
    callbacks: {
        onTextNodeReference: (text: TextNode, ref: IdentifierRef, id: string) => Parent[];
        onTextRawReference: (ref: IdentifierRef, id: string) => string;
    },
): Parent[] {
    //Text type
    if (node.type === "text") {
        const res = iterateReferenceMatch((node as TextNode).value, (ref, id) => {
            return callbacks.onTextNodeReference(node as TextNode, ref, id);
        });
        return res.length ? res : [node];
    }
    //Image type
    if (node.type === "element" && node.tagName === "img") {
        if (node.properties.alt) {
            node.properties.alt = iterateReferenceRawTextMatch(String(node.properties.alt), (ref, id) => {
                return callbacks.onTextRawReference(ref, id);
            });
        }
        if (node.properties.title) {
            node.properties.title = iterateReferenceRawTextMatch(String(node.properties.title), (ref, id) => {
                return callbacks.onTextRawReference(ref, id);
            });
        }
        if (node.properties.src) {
            const src = decodeURI(node.properties.src);
            const update = iterateReferenceRawTextMatch(String(src), (ref, id) => {
                return callbacks.onTextRawReference(ref, id);
            });
            node.properties.src = encodeURI(update);
        }
    }
    //Anchor type
    if (node.type === "element" && node.tagName === "a") {
        if (node.properties.title) {
            node.properties.title = iterateReferenceRawTextMatch(String(node.properties.title), (ref, id) => {
                return callbacks.onTextRawReference(ref, id);
            });
        }
        if (node.properties.href) {
            const url = decodeURI(node.properties.href);
            const updated = iterateReferenceRawTextMatch(String(url), (ref, id) => {
                return callbacks.onTextRawReference(ref, id);
            });
            node.properties.href = encodeURI(updated);
        }
    }
    if (node.children) {
        // has children
        node.children = node.children.reduce((acc, child) => {
            return [...acc, ...iterateTree(child as HtmlNode, callbacks)];
        }, []);
        return [node];
    }

    // no children
    return [node];
}

function iterateReferenceRawTextMatch(
    value: string,
    onMatch: (ref: IdentifierRef, id: string) => string,
): string {
    const items = value.split(REFERENCE_REGEX_SPLIT);
    return items
        .map((item) => {
            const match = REFERENCE_REGEX_MATCH.exec(item);
            if (match) {
                const { ref } = createReference(match);
                if (ref) {
                    return onMatch(ref, match[2]);
                }
            }
            return item;
        })
        .join("");
}

function iterateReferenceMatch<T>(value: string, onMatch: (ref: IdentifierRef, id: string) => T[]): T[] {
    const items: T[] = [];
    REFERENCE_REGEX_MATCH.lastIndex = -1;
    let match = REFERENCE_REGEX_MATCH.exec(value);
    while (match) {
        const { ref } = createReference(match);
        if (ref) {
            items.push(...onMatch(ref, match[2]));
        }
        match = REFERENCE_REGEX_MATCH.exec(value);
    }
    return items;
}

function createMetricValue(intl: IntlShape, text: TextNode, metric: EvaluatedMetric) {
    if (!metric) {
        return {
            type: "element",
            tagName: "span",
            properties: {
                className: ["gd-rich-text-metric-error"],
            },
            position: text.position,
            children: [{ type: "text", value: `(${intl.formatMessage({ id: "richText.no_fetch" })})` }],
        };
    }

    const value = metric.data.rawValue;

    if (value === null || value === undefined) {
        return {
            type: "element",
            tagName: "span",
            properties: {
                className: ["gd-rich-text-metric-empty"],
            },
            position: text.position,
            children: [{ type: "text", value: `(${intl.formatMessage({ id: "richText.no_data" })})` }],
        };
    }
    return {
        type: "element",
        tagName: "span",
        properties: {
            className: ["gd-rich-text-metric-value"],
        },
        position: text.position,
        children: [{ type: "text", value: metric.data.formattedValue() }],
    };
}
