// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IDashboardParameter,
    type IDashboardTab,
    type IParameterMetadataObject,
    idRef,
} from "@gooddata/sdk-model";

import { DEFAULT_TAB_ID } from "../../../../store/tabs/tabsState.js";
import { distributeParametersToTabs } from "../parameterHydration.js";

const topNRef = idRef("topN", "parameter");
const sampleRef = idRef("sampleSize", "parameter");

const topNParameter: IDashboardParameter = {
    ref: topNRef,
    parameterType: "NUMBER",
    mode: "active",
};

const sampleParameter: IDashboardParameter = {
    ref: sampleRef,
    parameterType: "NUMBER",
    mode: "active",
};

const topNWorkspace: IParameterMetadataObject = {
    type: "parameter",
    id: "topN",
    uri: "/topN",
    ref: topNRef,
    title: "Top N",
    description: "",
    production: true,
    deprecated: false,
    unlisted: false,
    definition: { type: "NUMBER", defaultValue: 10 },
};

function tab(localIdentifier: string, parameters?: IDashboardParameter[]): IDashboardTab {
    return {
        localIdentifier,
        title: "",
        ...(parameters === undefined ? {} : { parameters }),
    } as IDashboardTab;
}

describe("distributeParametersToTabs (V1 → per-tab migration)", () => {
    it("V1 root parameters, no tabs[] in source — synthesizes DEFAULT_TAB_ID and gets the root array", () => {
        const distributed = distributeParametersToTabs(undefined, [topNParameter], [topNWorkspace]);

        expect(Object.keys(distributed)).toEqual([DEFAULT_TAB_ID]);
        expect(distributed[DEFAULT_TAB_ID]).toEqual([{ parameter: topNParameter, runtimeOverride: 10 }]);
    });

    it("V1 root parameters + multi-tab tabs[] without per-tab parameters — root copies to every tab", () => {
        // V1 → per-tab migration on load: when no tab has parameters set, root array seeds every tab.
        const tabs: IDashboardTab[] = [tab("tab-A"), tab("tab-B"), tab("tab-C")];

        const distributed = distributeParametersToTabs(tabs, [topNParameter], [topNWorkspace]);

        expect(distributed["tab-A"]).toEqual([{ parameter: topNParameter, runtimeOverride: 10 }]);
        expect(distributed["tab-B"]).toEqual([{ parameter: topNParameter, runtimeOverride: 10 }]);
        expect(distributed["tab-C"]).toEqual([{ parameter: topNParameter, runtimeOverride: 10 }]);
    });

    it("V2 dashboards with explicit per-tab parameters — root fallback ignored", () => {
        const tabs: IDashboardTab[] = [tab("tab-A", [topNParameter]), tab("tab-B", [sampleParameter])];

        const distributed = distributeParametersToTabs(tabs, [topNParameter], [topNWorkspace]);

        expect(distributed["tab-A"]).toEqual([{ parameter: topNParameter, runtimeOverride: 10 }]);
        expect(distributed["tab-B"]).toEqual([{ parameter: sampleParameter, runtimeOverride: undefined }]);
    });

    it("explicit empty array on a tab honored — not overwritten by root fallback", () => {
        const tabs: IDashboardTab[] = [tab("tab-A", []), tab("tab-B", [topNParameter])];

        const distributed = distributeParametersToTabs(tabs, [sampleParameter], [topNWorkspace]);

        expect(distributed["tab-A"]).toEqual([]);
        expect(distributed["tab-B"]).toEqual([{ parameter: topNParameter, runtimeOverride: 10 }]);
    });

    it("no root parameters AND no tab parameters — every tab gets empty entries", () => {
        const tabs: IDashboardTab[] = [tab("tab-A"), tab("tab-B")];

        const distributed = distributeParametersToTabs(tabs, undefined, [topNWorkspace]);

        expect(distributed["tab-A"]).toEqual([]);
        expect(distributed["tab-B"]).toEqual([]);
    });
});

describe("distributeParametersToTabs — activeTabOverride", () => {
    const override: IDashboardParameter = { ...topNParameter, value: 7 };

    it("applies the override's value as runtimeOverride on the matching active tab", () => {
        const tabs: IDashboardTab[] = [tab("tab-A", [topNParameter]), tab("tab-B", [topNParameter])];

        const distributed = distributeParametersToTabs(tabs, undefined, [topNWorkspace], {
            tabId: "tab-A",
            overrides: [override],
        });

        expect(distributed["tab-A"]).toEqual([{ parameter: topNParameter, runtimeOverride: 7 }]);
        expect(distributed["tab-B"]).toEqual([{ parameter: topNParameter, runtimeOverride: 10 }]);
    });

    it("override wins over the persisted parameter.value", () => {
        const persisted: IDashboardParameter = { ...topNParameter, value: 3 };
        const tabs: IDashboardTab[] = [tab("tab-A", [persisted])];

        const distributed = distributeParametersToTabs(tabs, undefined, [topNWorkspace], {
            tabId: "tab-A",
            overrides: [override],
        });

        expect(distributed["tab-A"]).toEqual([{ parameter: persisted, runtimeOverride: 7 }]);
    });

    it("silently skips overrides for refs not present on the active tab", () => {
        const stale: IDashboardParameter = { ...sampleParameter, value: 42 };
        const tabs: IDashboardTab[] = [tab("tab-A", [topNParameter])];

        const distributed = distributeParametersToTabs(tabs, undefined, [topNWorkspace], {
            tabId: "tab-A",
            overrides: [stale],
        });

        expect(distributed["tab-A"]).toEqual([{ parameter: topNParameter, runtimeOverride: 10 }]);
    });
});
