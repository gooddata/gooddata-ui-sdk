// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
    type IDashboardParameter,
    type IDashboardTab,
    type IParameterMetadataObject,
    type ParameterValue,
    idRef,
} from "@gooddata/sdk-model";

import { type IDashboardParameterEntry } from "../../../store/tabs/parameters/parametersState.js";
import { DEFAULT_TAB_ID } from "../../../store/tabs/tabsState.js";

import {
    distributeParametersToTabs,
    hydrateParameterEntries,
    resolveParameterValuesForFilterView,
} from "./parameterHydration.js";

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

const scenarioRef = idRef("scenario", "parameter");

const scenarioParameter: IDashboardParameter = {
    ref: scenarioRef,
    parameterType: "STRING",
    mode: "active",
};

const sampleWorkspace: IParameterMetadataObject = {
    ...topNWorkspace,
    id: "sampleSize",
    uri: "/sampleSize",
    ref: sampleRef,
    title: "Sample size",
    definition: { type: "NUMBER", defaultValue: 6 },
};

const scenarioWorkspace: IParameterMetadataObject = {
    ...topNWorkspace,
    id: "scenario",
    uri: "/scenario",
    ref: scenarioRef,
    title: "Scenario",
    definition: { type: "STRING", defaultValue: "Actual" },
};

function entry(parameter: IDashboardParameter, runtimeOverride: ParameterValue | undefined = undefined) {
    return { parameter, runtimeOverride } satisfies IDashboardParameterEntry;
}

describe("resolveParameterValuesForFilterView", () => {
    it("takes an explicit value from the filter view", () => {
        expect(
            resolveParameterValuesForFilterView(
                [entry(topNParameter)],
                [{ ...topNParameter, value: 42 }],
                [topNWorkspace],
            ),
        ).toEqual([{ ref: topNRef, value: 42 }]);
    });

    it("fills a view parameter carrying no value from the workspace default", () => {
        expect(
            resolveParameterValuesForFilterView([entry(topNParameter)], [topNParameter], [topNWorkspace]),
        ).toEqual([{ ref: topNRef, value: 10 }]);
    });

    it("fills a missing string value from the workspace string default", () => {
        expect(
            resolveParameterValuesForFilterView(
                [entry(scenarioParameter)],
                [scenarioParameter],
                [scenarioWorkspace],
            ),
        ).toEqual([{ ref: scenarioRef, value: "Actual" }]);
    });

    it("leaves a view parameter unresolved when the workspace parameter is missing", () => {
        expect(resolveParameterValuesForFilterView([entry(topNParameter)], [topNParameter], [])).toEqual([
            { ref: topNRef, value: undefined },
        ]);
    });

    it("leaves a view parameter unresolved when the workspace parameter type does not match", () => {
        expect(
            resolveParameterValuesForFilterView(
                [entry(scenarioParameter)],
                [scenarioParameter],
                [{ ...scenarioWorkspace, definition: { type: "NUMBER", defaultValue: 10 } }],
            ),
        ).toEqual([{ ref: scenarioRef, value: undefined }]);
    });

    it("resets a parameter the view predates instead of keeping the previously applied value", () => {
        // View saved with topN only; sampleSize was added later and still holds 4 from another view.
        const values = resolveParameterValuesForFilterView(
            [entry(topNParameter, 1), entry(sampleParameter, 4)],
            [{ ...topNParameter, value: 1 }],
            [topNWorkspace, sampleWorkspace],
        );

        expect(values).toEqual([
            { ref: topNRef, value: 1 },
            { ref: sampleRef, value: 6 },
        ]);
    });

    it("resets a parameter the view predates to the dashboard value when one is persisted", () => {
        const pinned: IDashboardParameter = { ...sampleParameter, value: 3 };

        expect(
            resolveParameterValuesForFilterView(
                [entry(pinned, 4)],
                [{ ...topNParameter, value: 1 }],
                [topNWorkspace, sampleWorkspace],
            ),
        ).toEqual([{ ref: sampleRef, value: 3 }]);
    });

    it("resets every parameter for a legacy view that captured none", () => {
        expect(
            resolveParameterValuesForFilterView(
                [entry(topNParameter, 1), entry(sampleParameter, 4)],
                [],
                [topNWorkspace, sampleWorkspace],
            ),
        ).toEqual([
            { ref: topNRef, value: 10 },
            { ref: sampleRef, value: 6 },
        ]);
    });

    it("keeps the persisted value of a parameter the workspace no longer resolves", () => {
        // Unlike a filter-bar reset, an unresolvable parameter is not cleared - the value stays
        // whatever hydration produced at load, so the widget surfaces the standard error.
        const removed: IDashboardParameter = { ...sampleParameter, value: 3 };

        expect(resolveParameterValuesForFilterView([entry(removed, 4)], [], [])).toEqual([
            { ref: sampleRef, value: 3 },
        ]);
    });

    it("resolves a parameter the view omits exactly as load-time hydration would", () => {
        const parameters = [topNParameter, { ...sampleParameter, value: 3 }, scenarioParameter];
        const workspaceParameters = [topNWorkspace, sampleWorkspace, scenarioWorkspace];

        const resolved = resolveParameterValuesForFilterView(
            hydrateParameterEntries(parameters, workspaceParameters),
            [],
            workspaceParameters,
        );

        expect(resolved).toEqual(
            hydrateParameterEntries(parameters, workspaceParameters).map(
                ({ parameter, runtimeOverride }) => ({ ref: parameter.ref, value: runtimeOverride }),
            ),
        );
    });

    it("resolves entries the view omits regardless of their mode", () => {
        const readonly: IDashboardParameter = { ...sampleParameter, mode: "readonly" };

        expect(
            resolveParameterValuesForFilterView([entry(readonly, 4)], [], [topNWorkspace, sampleWorkspace]),
        ).toEqual([{ ref: sampleRef, value: 6 }]);
    });

    it("ignores view parameters that no longer exist on the tab", () => {
        expect(
            resolveParameterValuesForFilterView(
                [entry(topNParameter, 1)],
                [{ ...sampleParameter, value: 42 }],
                [topNWorkspace, sampleWorkspace],
            ),
        ).toEqual([{ ref: topNRef, value: 10 }]);
    });
});
