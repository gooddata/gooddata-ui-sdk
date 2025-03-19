// (C) 2025 GoodData Corporation

import { describe, expect, it } from "vitest";
import { createIntlMock, DataPoint } from "@gooddata/sdk-ui";
import { rehypeReferences } from "../rehype-references";
import { EvaluatedMetric } from "../../hooks/useEvaluatedMetrics";
import { Root } from "mdast";

describe("testing rehype plugin to extract references", () => {
    const intl = createIntlMock();
    const metrics: EvaluatedMetric[] = [em("metric_1", "Metric 1", 100), em("metric_2", "Metric 2", 200)];

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
        const walk = rehypeReferences(intl, metrics)();
        const updated = walk(htmlTreeSimpleText as Root);

        expect(updated).toMatchSnapshot();
    });

    it("replace references ids for real formatted values in links", () => {
        const walk = rehypeReferences(intl, metrics)();
        const updated = walk(htmlTreeLinkText as Root);

        expect(updated).toMatchSnapshot();
    });

    it("replace references ids for real formatted values in image", () => {
        const walk = rehypeReferences(intl, metrics)();
        const updated = walk(htmlTreeImageText as Root);

        expect(updated).toMatchSnapshot();
    });
});

function em(id: string, title: string, value: number): EvaluatedMetric {
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
            formattedValue(): string | null {
                return "$" + value.toString();
            },
            coordinates: [],
            rawValue: value,
        } as DataPoint,
    };
}
