// (C) 2022-2025 GoodData Corporation

import cx from "classnames";
import { Root } from "mdast";
import { IntlShape } from "react-intl";
import { Parent } from "unist";

import { ClientFormatterFacade } from "@gooddata/number-formatter";
import { ISeparators, IdentifierRef, areObjRefsEqual } from "@gooddata/sdk-model";

import { HtmlNode, REFERENCE_REGEX_MATCH, REFERENCE_REGEX_SPLIT, TextNode } from "./types.js";
import { createReference } from "../helpers/references.js";
import { EvaluatedMetric } from "../hooks/useEvaluatedMetricsAndAttributes.js";

export function rehypeReferences(intl: IntlShape, metrics?: EvaluatedMetric[], separators?: ISeparators) {
    return function () {
        return function (tree: Root) {
            iterateTree(tree as HtmlNode, {
                onTextNodeReference: (text, ref) => {
                    const metric = metrics?.find((m) => areObjRefsEqual(m.ref, ref));
                    const { metricDef } = createMetricValue(intl, text, metric, separators);
                    return [metricDef];
                },
                onTextRawReference: (ref) => {
                    const metric = metrics?.find((m) => areObjRefsEqual(m.ref, ref));
                    const { value, formattedValue } = createMetricValue(intl, null, metric);
                    return value === null ? "" : formattedValue;
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
        if (node.properties["alt"]) {
            node.properties["alt"] = iterateReferenceRawTextMatch(
                String(node.properties["alt"]),
                (ref, id) => {
                    return callbacks.onTextRawReference(ref, id);
                },
            );
        }
        if (node.properties["title"]) {
            node.properties["title"] = iterateReferenceRawTextMatch(
                String(node.properties["title"]),
                (ref, id) => {
                    return callbacks.onTextRawReference(ref, id);
                },
            );
        }
        if (node.properties["src"]) {
            const src = decodeURI(node.properties["src"]);
            const update = iterateReferenceRawTextMatch(String(src), (ref, id) => {
                return callbacks.onTextRawReference(ref, id);
            });
            node.properties["src"] = encodeURI(update);
        }
    }
    //Anchor type
    if (node.type === "element" && node.tagName === "a") {
        if (node.properties["title"]) {
            node.properties["title"] = iterateReferenceRawTextMatch(
                String(node.properties["title"]),
                (ref, id) => {
                    return callbacks.onTextRawReference(ref, id);
                },
            );
        }
        if (node.properties["href"]) {
            const url = decodeURI(node.properties["href"]);
            const updated = iterateReferenceRawTextMatch(String(url), (ref, id) => {
                return callbacks.onTextRawReference(ref, id);
            });
            node.properties["href"] = encodeURI(updated);
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
            const regex = new RegExp(REFERENCE_REGEX_MATCH.source, REFERENCE_REGEX_MATCH.flags);
            const match = regex.exec(item);
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
    const regex = new RegExp(REFERENCE_REGEX_MATCH.source, REFERENCE_REGEX_MATCH.flags);
    let match = regex.exec(value);
    while (match) {
        const { ref } = createReference(match);
        if (ref) {
            items.push(...onMatch(ref, match[2]));
        }
        match = regex.exec(value);
    }
    return items;
}

function createMetricValue(
    intl: IntlShape,
    text: TextNode | null,
    metric: EvaluatedMetric,
    separators?: ISeparators,
) {
    const { formattedValue, value, isEmpty, isMultiple, styles } = getValue(metric, intl, separators);

    const metricDef = {
        type: "element",
        tagName: "span",
        properties: {
            className: cx({
                "gd-rich-text-metric-error": !metric,
                "gd-rich-text-metric-empty": metric && isEmpty,
                "gd-rich-text-metric-multiple": metric && isMultiple,
                "gd-rich-text-metric-value": metric && !isEmpty && !isMultiple,
            }),
            style: styles,
        },
        position: text?.position ?? undefined,
        children: [{ type: "text", value: formattedValue }],
    };

    return {
        metricDef,
        formattedValue,
        value: isEmpty || isMultiple ? null : value,
    };
}

function getValue(metric: EvaluatedMetric, intl: IntlShape, separators?: ISeparators) {
    const value = metric ? metric.data.rawValue : null;
    const isMultiple = metric?.count && metric.count > 1;
    const isEmpty = value === null || value === undefined || metric?.count === 0;

    let styles: Partial<CSSStyleDeclaration> = {};

    if (!metric) {
        return {
            formattedValue: `(${intl.formatMessage({ id: "richText.no_fetch" })})`,
            value,
            styles,
            isMultiple,
            isEmpty,
        };
    }
    if (isEmpty) {
        return {
            formattedValue: `(${intl.formatMessage({ id: "richText.no_data" })})`,
            value,
            styles,
            isMultiple,
            isEmpty,
        };
    }
    if (isMultiple) {
        return {
            formattedValue: `(${intl.formatMessage({ id: "richText.multiple_data" })})`,
            value,
            styles,
            isMultiple,
            isEmpty,
        };
    }

    const { formattedValue, colors } = createNumberJsFormatter(metric, separators);
    styles = {
        ...(colors?.color ? { color: colors.color } : {}),
        ...(colors?.backgroundColor ? { backgroundColor: colors.backgroundColor } : {}),
    };

    // NOTE: If the results value is empty, we should display the empty value message
    if (formattedValue == "") {
        return {
            formattedValue: `(${intl.formatMessage({ id: "empty_value" })})`,
            isEmpty: true,
            isMultiple,
            styles,
            value,
        };
    }

    // Default case
    return {
        formattedValue,
        isEmpty,
        isMultiple,
        styles,
        value,
    };
}

function createNumberJsFormatter(metric: EvaluatedMetric, separators?: ISeparators) {
    const value = metric ? metric.data.rawValue : null;

    if (!metric?.data.formatable) {
        return {
            formattedValue: value as string,
            colors: {
                color: undefined,
                backgroundColor: undefined,
            },
        };
    }

    const valueToFormat = ClientFormatterFacade.convertValue(value);
    const { formattedValue, colors } = ClientFormatterFacade.formatValue(
        valueToFormat,
        metric.format,
        separators,
    );

    return {
        formattedValue,
        colors,
    };
}
