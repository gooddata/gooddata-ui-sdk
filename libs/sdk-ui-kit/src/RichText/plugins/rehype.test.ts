// (C) 2025-2026 GoodData Corporation

import { type Root } from "mdast";
import { describe, expect, it } from "vitest";

import { type DataPoint, createIntlMock } from "@gooddata/sdk-ui";

import { type EvaluatedMetric } from "../hooks/useEvaluatedMetricsAndAttributes.js";

import { rehypeReferences } from "./rehype-references.js";
import { type HtmlNode, RESTRICTED_MARKER_TAG } from "./types.js";

describe("testing rehype plugin to extract references", () => {
    const intl = createIntlMock();
    const metrics: EvaluatedMetric[] = [
        em("metric_1", "Metric 1", 100, true),
        em("metric_2", "Metric 2", 200, true),
    ];
    const metrics1: EvaluatedMetric[] = [
        em("metric_1", "Metric 1", 100, false),
        em("metric_2", "Metric 2", 200, false),
    ];

    const htmlTreeSimpleText = {
        type: "root",
        children: [
            {
                type: "element",
                tagName: "p",
                properties: {},
                children: [
                    {
                        type: "text",
                        value: "Hello, there are some ",
                    },
                    {
                        type: "text",
                        value: "{metric/metric_1}",
                    },
                    {
                        type: "text",
                        value: " and ",
                    },
                    {
                        type: "text",
                        value: "{metric/metric_2}",
                    },
                    {
                        type: "text",
                        value: " references.",
                    },
                ],
            },
        ],
    };
    const htmlTreeSimpleText2 = {
        type: "root",
        children: [
            {
                type: "element",
                tagName: "p",
                properties: {},
                children: [
                    {
                        type: "text",
                        value: "Hello, there are some ",
                    },
                    {
                        type: "text",
                        value: "{metric/metric_1}",
                    },
                    {
                        type: "text",
                        value: " and ",
                    },
                    {
                        type: "text",
                        value: "{metric/metric_2}",
                    },
                    {
                        type: "text",
                        value: " references.",
                    },
                ],
            },
        ],
    };

    const htmlTreeLinkText = {
        type: "root",
        children: [
            {
                type: "element",
                tagName: "p",
                properties: {},
                children: [
                    {
                        type: "text",
                        value: "Hello, there are some ",
                    },
                    {
                        type: "element",
                        tagName: "a",
                        properties: {
                            href: "https://www.{metric/metric_1}.com",
                            title: "Link to {metric/metric_1}",
                        },
                        children: [
                            {
                                type: "text",
                                value: "{metric/metric_1}",
                            },
                        ],
                    },
                    {
                        type: "text",
                        value: " references.",
                    },
                ],
            },
        ],
    };

    const htmlTreeImageText = {
        type: "root",
        children: [
            {
                type: "element",
                tagName: "p",
                properties: {},
                children: [
                    {
                        type: "text",
                        value: "Hello, there is image ",
                    },
                    {
                        type: "element",
                        tagName: "img",
                        properties: {
                            alt: "This is {metric/metric_1} alt",
                            title: "Link to {metric/metric_1}",
                            src: "https://www.{metric/metric_1}.com",
                        },
                    },
                    {
                        type: "text",
                        value: " references.",
                    },
                ],
            },
        ],
    };

    it("replace references ids for real formatted values in text", () => {
        const walk = rehypeReferences(intl, { metrics })();
        const updated = walk(htmlTreeSimpleText as Root);

        expect(updated).toMatchSnapshot();
    });

    it("replace references ids for real formatted values in links", () => {
        const walk = rehypeReferences(intl, { metrics })();
        const updated = walk(htmlTreeLinkText as Root);

        expect(updated).toMatchSnapshot();
    });

    it("replace references ids for real formatted values in image", () => {
        const walk = rehypeReferences(intl, { metrics })();
        const updated = walk(htmlTreeImageText as Root);

        expect(updated).toMatchSnapshot();
    });

    it("marks a restricted reference instead of asking for its value", () => {
        const walk = rehypeReferences(createIntlMock({ "richText.restricted": "restricted" }), {
            metrics,
            restrictedReferences: [{ type: "measure", identifier: "metric_1" }],
        })();
        // a tree of its own: the trees above are transformed in place by the tests that use them
        const tree = {
            type: "root",
            children: [
                {
                    type: "element",
                    tagName: "p",
                    properties: {},
                    children: [
                        { type: "text", value: "{metric/metric_1}" },
                        { type: "text", value: " and " },
                        { type: "text", value: "{metric/metric_2}" },
                    ],
                },
            ],
        };
        const updated = walk(tree as Root) as Root;

        const children = (updated.children[0] as unknown as HtmlNode).children as any[];
        // the marker is an element of its own, so the renderer names it rather than recognising it
        const restricted = children.find((child) => child.tagName === RESTRICTED_MARKER_TAG);
        expect(restricted.children[0].value).toEqual("restricted");
        expect(restricted.properties.className).toContain("gd-rich-text-metric-restricted");
        // the other reference in the same text keeps its value, and stays an ordinary span
        const readable = children.find((child) => child.tagName === "span");
        expect(readable.properties.className).toContain("gd-rich-text-metric-value");
    });

    it("renders every reference as unretrievable when the execution failed", () => {
        // A rejected execution surfaces as no evaluated values at all — one AFM serves every
        // reference, so none of them resolve. Each must say so rather than render a stray value.
        const walk = rehypeReferences(intl, { metrics: [] })();
        const tree = {
            type: "root",
            children: [
                {
                    type: "element",
                    tagName: "p",
                    properties: {},
                    children: [
                        { type: "text", value: "{computed_attribute/tier}" },
                        { type: "text", value: " and " },
                        { type: "text", value: "{label/city}" },
                        { type: "text", value: " and " },
                        { type: "text", value: "{metric/revenue}" },
                    ],
                },
            ],
        };
        const updated = walk(tree as Root) as Root;

        const spans = ((updated.children[0] as unknown as HtmlNode).children as any[]).filter(
            (child) => child.tagName === "span",
        );
        expect(spans).toHaveLength(3);
        spans.forEach((span) => {
            expect(span.properties.className).toContain("gd-rich-text-metric-error");
            expect(span.children[0].value).toEqual("(Data could not be retrieved)");
        });
    });

    it("resolves a computed attribute reference, matching on its own object type", () => {
        const tier = {
            ...em("tier", "Tier", 0, false),
            ref: { type: "computedAttribute", identifier: "tier" },
            data: {
                formatable: false,
                coordinates: [],
                rawValue: "Gold",
            } as unknown as DataPoint,
        } as EvaluatedMetric;
        const walk = rehypeReferences(intl, { metrics: [tier] })();
        const tree = {
            type: "root",
            children: [
                {
                    type: "element",
                    tagName: "p",
                    properties: {},
                    children: [
                        { type: "text", value: "{computed_attribute/tier}" },
                        { type: "text", value: " and " },
                        // same identifier, different object type: no value was fetched for it
                        { type: "text", value: "{label/tier}" },
                    ],
                },
            ],
        };
        const updated = walk(tree as Root) as Root;

        const spans = ((updated.children[0] as unknown as HtmlNode).children as any[]).filter(
            (child) => child.tagName === "span",
        );
        const [computedAttribute, label] = spans;
        expect(computedAttribute.properties.className).toContain("gd-rich-text-metric-value");
        expect(computedAttribute.children[0].value).toEqual("Gold");
        expect(label.properties.className).toContain("gd-rich-text-metric-error");
    });

    it("renders a parameter reference as its display value", () => {
        const walk = rehypeReferences(intl, { metrics, parameterDisplayValues: new Map([["top_n", "5"]]) })();
        const tree = {
            type: "root",
            children: [
                {
                    type: "element",
                    tagName: "p",
                    properties: {},
                    children: [{ type: "text", value: "{parameter/top_n}" }],
                },
            ],
        };
        const updated = walk(tree as Root) as Root;

        const [span] = (updated.children[0] as unknown as HtmlNode).children as any[];
        expect(span.tagName).toEqual("span");
        expect(span.properties.className).toEqual("gd-rich-text-parameter");
        expect(span.children[0].value).toEqual("5");
    });

    it("puts a parameter value into link and image attributes", () => {
        const walk = rehypeReferences(intl, {
            metrics,
            parameterDisplayValues: new Map([["region", "west"]]),
        })();
        const tree = {
            type: "root",
            children: [
                {
                    type: "element",
                    tagName: "p",
                    properties: {},
                    children: [
                        {
                            type: "element",
                            tagName: "a",
                            properties: {
                                href: "https://www.example.com/{parameter/region}",
                                title: "Link to {parameter/region}",
                            },
                            children: [],
                        },
                        {
                            type: "element",
                            tagName: "img",
                            properties: {
                                alt: "Chart for {parameter/region}",
                                src: "https://www.example.com/{parameter/region}.png",
                            },
                        },
                    ],
                },
            ],
        };
        const updated = walk(tree as Root) as Root;

        const [anchor, image] = (updated.children[0] as unknown as HtmlNode).children as any[];
        expect(anchor.properties.href).toEqual("https://www.example.com/west");
        expect(anchor.properties.title).toEqual("Link to west");
        expect(image.properties.alt).toEqual("Chart for west");
        expect(image.properties.src).toEqual("https://www.example.com/west.png");
    });

    it("marks a parameter the workspace does not define", () => {
        const walk = rehypeReferences(createIntlMock({ "richText.unknown_parameter": "unknown parameter" }), {
            metrics,
            parameterDisplayValues: new Map(),
        })();
        const tree = {
            type: "root",
            children: [
                {
                    type: "element",
                    tagName: "p",
                    properties: {},
                    children: [
                        { type: "text", value: "{parameter/gone}" },
                        {
                            type: "element",
                            tagName: "a",
                            properties: { title: "Link to {parameter/gone}" },
                            children: [],
                        },
                    ],
                },
            ],
        };
        const updated = walk(tree as Root) as Root;

        const [span, anchor] = (updated.children[0] as unknown as HtmlNode).children as any[];
        expect(span.children[0].value).toEqual("(unknown parameter)");
        expect(anchor.properties.title).toEqual("Link to (unknown parameter)");
    });

    it("marks a parameter named as a member of the object prototype", () => {
        const walk = rehypeReferences(createIntlMock({ "richText.unknown_parameter": "unknown parameter" }), {
            metrics,
            parameterDisplayValues: new Map(),
        })();
        const tree = {
            type: "root",
            children: [
                {
                    type: "element",
                    tagName: "p",
                    properties: {},
                    children: [
                        { type: "text", value: "{parameter/constructor}" },
                        {
                            type: "element",
                            tagName: "a",
                            properties: { title: "Link to {parameter/constructor}" },
                            children: [],
                        },
                    ],
                },
            ],
        };
        const updated = walk(tree as Root) as Root;

        const [span, anchor] = (updated.children[0] as unknown as HtmlNode).children as any[];
        expect(span.children[0].value).toEqual("(unknown parameter)");
        expect(anchor.properties.title).toEqual("Link to (unknown parameter)");
    });

    it("leaves a parameter reference literal where the host supplies no values", () => {
        const walk = rehypeReferences(intl, { metrics })();
        const tree = {
            type: "root",
            children: [
                {
                    type: "element",
                    tagName: "p",
                    properties: {},
                    children: [
                        { type: "text", value: "{parameter/top_n}" },
                        {
                            type: "element",
                            tagName: "a",
                            properties: { title: "Link to {parameter/top_n}" },
                            children: [],
                        },
                    ],
                },
            ],
        };
        const updated = walk(tree as Root) as Root;

        const [text, anchor] = (updated.children[0] as unknown as HtmlNode).children as any[];
        expect(text.value).toEqual("{parameter/top_n}");
        expect(anchor.properties.title).toEqual("Link to {parameter/top_n}");
    });

    it("replace references ids for not formatted values in text", () => {
        const walk = rehypeReferences(intl, { metrics: metrics1 })();
        const updated = walk(htmlTreeSimpleText2 as Root);

        expect(updated).toMatchSnapshot();
    });
});

function em(id: string, title: string, value: number, formatable: boolean): EvaluatedMetric {
    return {
        ref: {
            type: "measure",
            identifier: id,
        },
        def: {
            measure: {
                title,
                localIdentifier: id,
                definition: {
                    inlineDefinition: {
                        maql: "SELECT SUM(*)",
                    },
                },
            },
        },
        header: {
            measureHeaderItem: {
                name: title,
                order: 0,
            },
        },
        data: {
            formatable,
            coordinates: [],
            rawValue: value,
        } as unknown as DataPoint,
        count: 1,
    };
}
