// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IDashboardTab, type IFilterContext, idRef } from "@gooddata/sdk-model";

import { getOrphanedTabFilterContexts } from "../index.js";

function makeFilterContext(id: string): IFilterContext {
    return {
        ref: idRef(id, "filterContext"),
        identifier: id,
        uri: `/gdc/md/filterContexts/${id}`,
        title: "",
        description: "",
        filters: [],
    };
}

function makeTab(overrides: Partial<IDashboardTab> & { filterContextId?: string }): IDashboardTab {
    const { filterContextId, ...rest } = overrides;
    return {
        localIdentifier: "some-id",
        title: "Tab",
        ...rest,
        ...(filterContextId ? { filterContext: makeFilterContext(filterContextId) } : {}),
    };
}

describe("getOrphanedTabFilterContexts", () => {
    it("returns filter contexts from original tabs no longer referenced in current tabs", () => {
        const originalTabs = [
            makeTab({ localIdentifier: "a", filterContextId: "fc-a" }),
            makeTab({ localIdentifier: "b", filterContextId: "fc-b" }),
            makeTab({ localIdentifier: "c", filterContextId: "fc-c" }),
        ];
        const currentTabs = [
            makeTab({ localIdentifier: "a", filterContextId: "fc-a" }),
            makeTab({ localIdentifier: "d", filterContextId: "fc-d" }),
        ];

        const result = getOrphanedTabFilterContexts(originalTabs, currentTabs);

        expect(result.map(({ identifier }) => identifier)).toEqual(["fc-b", "fc-c"]);
    });

    it("returns empty array when all original filter contexts are still referenced", () => {
        const originalTabs = [makeTab({ filterContextId: "fc-1" }), makeTab({ filterContextId: "fc-2" })];
        const currentTabs = [makeTab({ filterContextId: "fc-1" }), makeTab({ filterContextId: "fc-2" })];

        expect(getOrphanedTabFilterContexts(originalTabs, currentTabs)).toEqual([]);
    });

    it("keeps a filter context when the tab localIdentifier changed but the ref is the same", () => {
        const originalTabs = [makeTab({ localIdentifier: "default-tab-id", filterContextId: "fc-1" })];
        const currentTabs = [makeTab({ localIdentifier: "new-uuid", filterContextId: "fc-1" })];

        expect(getOrphanedTabFilterContexts(originalTabs, currentTabs)).toEqual([]);
    });

    it("ignores tabs without a filter context", () => {
        const originalTabs = [
            makeTab({ localIdentifier: "a" }),
            makeTab({ localIdentifier: "b", filterContextId: "fc-b" }),
        ];
        const currentTabs = [makeTab({ localIdentifier: "a" })];

        const result = getOrphanedTabFilterContexts(originalTabs, currentTabs);

        expect(result.map(({ identifier }) => identifier)).toEqual(["fc-b"]);
    });

    it("returns empty array when both tab lists are empty", () => {
        expect(getOrphanedTabFilterContexts([], [])).toEqual([]);
    });
});
