// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IDashboardTab } from "@gooddata/sdk-model";

import { getDeletedDashboardTabs } from "../index.js";

function makeDashboardTab(overrides: Partial<IDashboardTab>): IDashboardTab {
    return {
        localIdentifier: "some-id",
        title: "Example tab",
        ...overrides,
    };
}

describe("getDeletedDashboardTabs", () => {
    it("correctly identifies deleted dashboard tabs", () => {
        const originalTabs = [
            makeDashboardTab({ localIdentifier: "kept" }),
            makeDashboardTab({ localIdentifier: "removed-1" }),
            makeDashboardTab({ localIdentifier: "removed-2" }),
        ];
        const updatedTabs = [
            makeDashboardTab({ localIdentifier: "added-1" }),
            makeDashboardTab({ localIdentifier: "added-2" }),
            makeDashboardTab({ localIdentifier: "kept" }),
        ];
        const expected = [
            makeDashboardTab({ localIdentifier: "removed-1" }),
            makeDashboardTab({ localIdentifier: "removed-2" }),
        ];

        const actual = getDeletedDashboardTabs(originalTabs, updatedTabs);

        expect(actual).toEqual(expected);
    });
});
