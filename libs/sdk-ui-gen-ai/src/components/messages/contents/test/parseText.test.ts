// (C) 2024 GoodData Corporation

import { describe, it, expect } from "vitest";
import { parseText, Node } from "../parseText";
import { ISemanticSearchResultItem } from "@gooddata/sdk-model";

describe("parseText", () => {
    const foundObjects = [
        { type: "visualization", id: "foo", workspaceId: "baz", title: "Foo" } as ISemanticSearchResultItem,
        { type: "dashboard", id: "bar", workspaceId: "qux", title: "Bar" } as ISemanticSearchResultItem,
    ];

    it.each([
        [
            "Hello, {visualization.foo} and {dashboard.bar}!",
            [
                { type: "text", value: "Hello, " },
                { type: "link", value: "Foo", href: "/analyze/#/baz/foo/edit" },
                { type: "text", value: " and " },
                { type: "link", value: "Bar", href: "/dashboards/#/workspace/qux/dashboard/bar" },
                { type: "text", value: "!" },
            ],
        ],
        ["{visualization.foo}", [{ type: "link", value: "Foo", href: "/analyze/#/baz/foo/edit" }]],
        [
            "{dashboard.bar} test",
            [
                { type: "link", value: "Bar", href: "/dashboards/#/workspace/qux/dashboard/bar" },
                { type: "text", value: " test" },
            ],
        ],
        [
            "test {dashboard.bar}",
            [
                { type: "text", value: "test " },
                { type: "link", value: "Bar", href: "/dashboards/#/workspace/qux/dashboard/bar" },
            ],
        ],
        ["Test test", [{ type: "text", value: "Test test" }]],
    ] as [string, Node[]][])("should parse %s", (text: string, expected: Node[]) => {
        expect(parseText(text, foundObjects)).toEqual(expected);
    });
});
