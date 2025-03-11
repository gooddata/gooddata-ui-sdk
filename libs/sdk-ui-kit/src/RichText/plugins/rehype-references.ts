// (C) 2022-2025 GoodData Corporation

import { areObjRefsEqual, IdentifierRef } from "@gooddata/sdk-model";
import { IntlShape } from "react-intl";
import { Root } from "mdast";
import { Parent } from "unist";

import { EvaluatedMetric } from "../hooks/useEvaluatedMetrics.js";
import { createReference } from "../helpers/references.js";

import { REFERENCE_REGEX_MATCH, TextNode } from "./types.js";

export function rehypeReferences(intl: IntlShape, metrics?: EvaluatedMetric[]) {
    return function () {
        return function (tree: Root) {
            iterateTree(tree, {
                onReference: (text, ref) => {
                    const metric = metrics?.find((m) => areObjRefsEqual(m.ref, ref));
                    return [createMetricValue(intl, text, metric, metric?.value)];
                },
            });
            return tree;
        };
    };
}

function iterateTree(
    node: Parent | TextNode,
    callbacks: { onReference: (text: TextNode, ref: IdentifierRef, id: string) => Parent[] },
): Parent[] {
    //Text type
    if (node.type === "text") {
        REFERENCE_REGEX_MATCH.lastIndex = -1;
        const match = REFERENCE_REGEX_MATCH.exec((node as TextNode).value);
        if (match) {
            const { ref } = createReference(match);
            if (ref) {
                return callbacks.onReference(node as TextNode, ref, match[2]);
            }
        }
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

function createMetricValue(
    intl: IntlShape,
    text: TextNode,
    metric: EvaluatedMetric,
    value: number | string | null | undefined,
) {
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
        children: [{ type: "text", value: value.toString() }],
    };
}
