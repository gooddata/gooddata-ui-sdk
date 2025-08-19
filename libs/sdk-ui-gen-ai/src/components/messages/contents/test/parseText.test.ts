// (C) 2024-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { ISemanticSearchResultItem } from "@gooddata/sdk-model";

import { replaceLinks } from "../replaceLinks.js";

describe("parseText", () => {
    const foundObjects = [
        { type: "visualization", id: "foo", workspaceId: "baz", title: "Foo" } as ISemanticSearchResultItem,
        { type: "dashboard", id: "bar", workspaceId: "qux", title: "Bar" } as ISemanticSearchResultItem,
    ];

    it.each([
        [
            "Hello, {visualization.foo} and {dashboard.bar}!",
            "Hello, [Foo](gooddata://visualization?ws=wsid&id=foo) and [Bar](gooddata://dashboard?ws=wsid&id=bar)!",
        ],
        ["{visualization.foo}", "[Foo](gooddata://visualization?ws=wsid&id=foo)"],
        ["{dashboard.bar} test", "[Bar](gooddata://dashboard?ws=wsid&id=bar) test"],
        ["test {dashboard.bar}", "test [Bar](gooddata://dashboard?ws=wsid&id=bar)"],
        ["Test test", "Test test"],
        ["{foo.bar}", "{foo.bar}"],
    ] as [string, string][])("should parse %s", (text: string, expected: string) => {
        expect(replaceLinks(text, foundObjects, "wsid")).toEqual(expected);
    });
});
