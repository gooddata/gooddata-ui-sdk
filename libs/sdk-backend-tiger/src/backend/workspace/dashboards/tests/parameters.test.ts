// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IDashboard,
    type IDashboardParameter,
    type IDashboardTab,
    type ParameterType,
    type ParameterValue,
    idRef,
} from "@gooddata/sdk-model";

import { patchDashboardParametersFromExport } from "../parameters.js";

function makeParameter(
    id: string,
    value?: ParameterValue,
    parameterType: ParameterType = "NUMBER",
): IDashboardParameter {
    return {
        ref: idRef(id, "parameter"),
        parameterType,
        mode: "active",
        ...(value === undefined ? {} : { value }),
    };
}

function makeDashboardWith(opts: {
    tabs?: Array<{ localIdentifier: string; parameters?: IDashboardParameter[] }>;
    parameters?: IDashboardParameter[];
}): IDashboard {
    return {
        ...(opts.tabs
            ? {
                  tabs: opts.tabs.map(
                      (tab) =>
                          ({
                              localIdentifier: tab.localIdentifier,
                              title: "",
                              parameters: tab.parameters,
                          }) as IDashboardTab,
                  ),
              }
            : {}),
        ...(opts.parameters ? { parameters: opts.parameters } : {}),
    } as IDashboard;
}

describe("patchDashboardParametersFromExport", () => {
    it("patches a tab's parameter value by tab key, coercing the wire string to a number", () => {
        const dashboard = makeDashboardWith({
            tabs: [
                { localIdentifier: "tab-A", parameters: [makeParameter("topN", 10)] },
                { localIdentifier: "tab-B", parameters: [makeParameter("topN", 10)] },
            ],
        });

        const result = patchDashboardParametersFromExport(dashboard, {
            parametersByTab: { "tab-A": [{ id: "topN", value: "25", title: "Top N" }] },
        });

        expect(result.tabs?.[0].parameters?.[0].value).toBe(25);
        // no cross-tab clobber: tab-B keeps its hydrated value
        expect(result.tabs?.[1].parameters?.[0].value).toBe(10);
    });

    it("patches multiple tabs independently by tab key", () => {
        const dashboard = makeDashboardWith({
            tabs: [
                { localIdentifier: "tab-A", parameters: [makeParameter("topN", 10)] },
                { localIdentifier: "tab-B", parameters: [makeParameter("topN", 10)] },
            ],
        });

        const result = patchDashboardParametersFromExport(dashboard, {
            parametersByTab: {
                "tab-A": [{ id: "topN", value: "7", title: "Top N" }],
                "tab-B": [{ id: "topN", value: "9", title: "Top N" }],
            },
        });

        expect(result.tabs?.[0].parameters?.[0].value).toBe(7);
        expect(result.tabs?.[1].parameters?.[0].value).toBe(9);
    });

    it("keeps a STRING parameter's override as a string", () => {
        const dashboard = makeDashboardWith({
            tabs: [{ localIdentifier: "tab-A", parameters: [makeParameter("region", "west", "STRING")] }],
        });

        const result = patchDashboardParametersFromExport(dashboard, {
            parametersByTab: { "tab-A": [{ id: "region", value: "east", title: "Region" }] },
        });

        expect(result.tabs?.[0].parameters?.[0].value).toBe("east");
    });

    it("keeps a numeric-looking STRING override as a string", () => {
        const dashboard = makeDashboardWith({
            tabs: [{ localIdentifier: "tab-A", parameters: [makeParameter("region", "west", "STRING")] }],
        });

        const result = patchDashboardParametersFromExport(dashboard, {
            parametersByTab: { "tab-A": [{ id: "region", value: "42", title: "Region" }] },
        });

        expect(result.tabs?.[0].parameters?.[0].value).toBe("42");
    });

    it("patches NUMBER and STRING parameters in the same tab by their respective types", () => {
        const dashboard = makeDashboardWith({
            tabs: [
                {
                    localIdentifier: "tab-A",
                    parameters: [makeParameter("topN", 10), makeParameter("region", "west", "STRING")],
                },
            ],
        });

        const result = patchDashboardParametersFromExport(dashboard, {
            parametersByTab: {
                "tab-A": [
                    { id: "topN", value: "25", title: "Top N" },
                    { id: "region", value: "east", title: "Region" },
                ],
            },
        });

        expect(result.tabs?.[0].parameters?.[0].value).toBe(25);
        expect(result.tabs?.[0].parameters?.[1].value).toBe("east");
    });

    it("patches legacy V1 root-level parameters as a fallback (tab-less dashboard)", () => {
        const dashboard = makeDashboardWith({ parameters: [makeParameter("topN", 10)] });

        const result = patchDashboardParametersFromExport(dashboard, {
            parametersByTab: { "tab-A": [{ id: "topN", value: "42", title: "Top N" }] },
        });

        expect(result.parameters?.[0].value).toBe(42);
    });

    it("materializes per-tab parameters for a migrated dashboard whose tabs all omit their own", () => {
        // tabs[] present but every tab omits `parameters`, so the loader sources the shared root via
        // pickTabParametersSource. The override must land on the matched tab; tabs without an override
        // keep the root baseline (so they don't lose their default once params are materialized).
        const dashboard = makeDashboardWith({
            tabs: [{ localIdentifier: "tab-A" }, { localIdentifier: "tab-B" }],
            parameters: [makeParameter("topN", 10)],
        });

        const result = patchDashboardParametersFromExport(dashboard, {
            parametersByTab: { "tab-A": [{ id: "topN", value: "25", title: "Top N" }] },
        });

        expect(result.tabs?.[0].parameters?.[0].value).toBe(25);
        expect(result.tabs?.[1].parameters?.[0].value).toBe(10);
    });

    it("preserves divergent per-tab overrides for a migrated dashboard instead of collapsing to root", () => {
        // Whole-dashboard export of a root-sourced dashboard with different values per tab: flattening
        // onto the single root array would let the last value win and hydrate into every tab.
        const dashboard = makeDashboardWith({
            tabs: [{ localIdentifier: "tab-A" }, { localIdentifier: "tab-B" }],
            parameters: [makeParameter("topN", 10)],
        });

        const result = patchDashboardParametersFromExport(dashboard, {
            parametersByTab: {
                "tab-A": [{ id: "topN", value: "25", title: "Top N" }],
                "tab-B": [{ id: "topN", value: "9", title: "Top N" }],
            },
        });

        expect(result.tabs?.[0].parameters?.[0].value).toBe(25);
        expect(result.tabs?.[1].parameters?.[0].value).toBe(9);
    });

    it("ignores overrides whose ref does not match any parameter", () => {
        const dashboard = makeDashboardWith({
            tabs: [{ localIdentifier: "tab-A", parameters: [makeParameter("topN", 10)] }],
        });

        const result = patchDashboardParametersFromExport(dashboard, {
            parametersByTab: { "tab-A": [{ id: "doesNotExist", value: "99", title: "x" }] },
        });

        expect(result.tabs?.[0].parameters?.[0].value).toBe(10);
    });

    it("returns the dashboard unchanged when there are no parameter overrides", () => {
        const dashboard = makeDashboardWith({
            tabs: [{ localIdentifier: "tab-A", parameters: [makeParameter("topN", 10)] }],
        });

        expect(patchDashboardParametersFromExport(dashboard, {})).toBe(dashboard);
    });
});
