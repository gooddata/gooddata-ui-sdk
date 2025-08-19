// (C) 2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { remarkReferences } from "../remark-references.js";

describe("testing remark plugin to extract references", () => {
    const mdTree = {
        type: "root",
        children: [
            {
                type: "paragraph",
                children: [
                    {
                        type: "text",
                        value: "Hello, there are some {metric/metric_1} and {metric/metric_2} references.",
                        position: {
                            start: { line: 1, column: 1, offset: 0 },
                            end: { line: 1, column: 73, offset: 72 },
                        },
                    },
                ],
            },
        ],
    };

    const mdTreeWithLinks = {
        type: "root",
        children: [
            {
                type: "paragraph",
                children: [
                    {
                        type: "text",
                        value: "Hello, there are some ",
                        position: {
                            start: { line: 1, column: 1, offset: 0 },
                            end: { line: 1, column: 22, offset: 21 },
                        },
                    },
                    {
                        type: "link",
                        url: "/metric/metric_1",
                        title: null,
                        children: [
                            {
                                type: "text",
                                value: "link with {metric/metric_1} references",
                                position: {
                                    start: { line: 1, column: 22, offset: 21 },
                                    end: { line: 1, column: 60, offset: 61 },
                                },
                            },
                        ],
                    },
                    {
                        type: "text",
                        value: " and ",
                        position: {
                            start: { line: 1, column: 60, offset: 61 },
                            end: { line: 1, column: 65, offset: 66 },
                        },
                    },
                    {
                        type: "link",
                        url: "/metric/metric_2",
                        title: null,
                        children: [
                            {
                                type: "text",
                                value: "second {metric/metric_2} link",
                                position: {
                                    start: { line: 1, column: 60, offset: 61 },
                                    end: { line: 1, column: 89, offset: 90 },
                                },
                            },
                        ],
                    },
                    {
                        type: "text",
                        value: " references.",
                        position: {
                            start: { line: 1, column: 89, offset: 90 },
                            end: { line: 1, column: 101, offset: 102 },
                        },
                    },
                ],
            },
        ],
    };

    it("replace references inside text node", () => {
        const walk = remarkReferences()();
        const updated = walk(mdTree);

        expect(updated).toMatchSnapshot();
    });

    it("replace references inside link nodes", () => {
        const walk = remarkReferences()();
        const updated = walk(mdTreeWithLinks);

        expect(updated).toMatchSnapshot();
    });
});
