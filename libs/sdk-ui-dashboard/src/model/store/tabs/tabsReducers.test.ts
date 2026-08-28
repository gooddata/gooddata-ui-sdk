// (C) 2026 GoodData Corporation

// @vitest-environment node

import { produce } from "immer";
import { describe, expect, it } from "vitest";

import { type IDashboardAttributeFilter, type IDashboardParameter, idRef } from "@gooddata/sdk-model";

import { filterContextReducers } from "./filterContext/filterContextReducers.js";
import { type FilterContextState } from "./filterContext/filterContextState.js";
import { tabsActions } from "./index.js";
import { type IParametersState } from "./parameters/parametersState.js";
import { tabsReducers } from "./tabsReducers.js";
import { type ITabState, type ITabsState } from "./tabsState.js";

const topNRef = idRef("topN", "parameter");

const topNParameter: IDashboardParameter = {
    ref: topNRef,
    parameterType: "NUMBER",
    mode: "active",
};

const stagedTopN: IParametersState["parameters"] = [
    { parameter: topNParameter, runtimeOverride: 10, workingOverride: 99 },
];

const appliedFilter: IDashboardAttributeFilter = {
    attributeFilter: {
        displayForm: idRef("df-1"),
        negativeSelection: true,
        attributeElements: { uris: [] },
        localIdentifier: "filter-1",
    },
};

const stagedFilterContext: FilterContextState = {
    filtersWithInvalidSelection: [],
    filterContextDefinition: { title: "", description: "", filters: [appliedFilter] },
    workingFilterContextDefinition: {
        filters: [
            {
                attributeFilter: {
                    localIdentifier: "filter-1",
                    attributeElements: { uris: ["staged/uri"] },
                    negativeSelection: false,
                },
            },
        ],
    },
};

function makeState(tab: Pick<ITabState, "parameters" | "filterContext">): ITabsState {
    return {
        tabs: [{ localIdentifier: "tab-1", title: "Tab 1", ...tab }],
        activeTabLocalIdentifier: "tab-1",
    };
}

function activeTabOf(state: ITabsState) {
    return state.tabs![0]!;
}

describe("apply/reset working selection seam", () => {
    it("applyWorkingSelection folds both the staged filters and the staged parameters", () => {
        const initial = makeState({
            parameters: { parameters: stagedTopN },
            filterContext: stagedFilterContext,
        });

        const next = produce(initial, (draft) =>
            tabsReducers.applyWorkingSelection(draft, tabsActions.applyWorkingSelection({})),
        );

        const tab = activeTabOf(next as ITabsState);
        expect(tab.filterContext!.filterContextDefinition!.filters).toEqual([
            {
                attributeFilter: {
                    displayForm: idRef("df-1"),
                    negativeSelection: false,
                    attributeElements: { uris: ["staged/uri"] },
                    localIdentifier: "filter-1",
                },
            },
        ]);
        expect(tab.filterContext!.workingFilterContextDefinition).toEqual({ filters: [] });
        expect(tab.parameters!.parameters[0]?.runtimeOverride).toBe(99);
        expect(tab.parameters!.parameters[0]).not.toHaveProperty("workingOverride");
    });

    it("resetWorkingSelection drops both without committing either", () => {
        const initial = makeState({
            parameters: { parameters: stagedTopN },
            filterContext: stagedFilterContext,
        });

        const next = produce(initial, (draft) =>
            tabsReducers.resetWorkingSelection(draft, tabsActions.resetWorkingSelection()),
        );

        const tab = activeTabOf(next as ITabsState);
        expect(tab.filterContext!.filterContextDefinition!.filters).toEqual([appliedFilter]);
        expect(tab.filterContext!.workingFilterContextDefinition).toEqual({ filters: [] });
        expect(tab.parameters!.parameters[0]?.runtimeOverride).toBe(10);
        expect(tab.parameters!.parameters[0]).not.toHaveProperty("workingOverride");
    });

    it("resetWorkingFilterSelection drops the staged filters and keeps the staged parameters", () => {
        const initial = makeState({
            parameters: { parameters: stagedTopN },
            filterContext: stagedFilterContext,
        });

        const next = produce(initial, (draft) =>
            filterContextReducers.resetWorkingFilterSelection(
                draft,
                tabsActions.resetWorkingFilterSelection(),
            ),
        );

        const tab = activeTabOf(next as ITabsState);
        expect(tab.filterContext!.filterContextDefinition!.filters).toEqual([appliedFilter]);
        expect(tab.filterContext!.workingFilterContextDefinition).toEqual({ filters: [] });
        expect(tab.parameters!.parameters[0]?.runtimeOverride).toBe(10);
        expect(tab.parameters!.parameters[0]?.workingOverride).toBe(99);
    });

    it("applyWorkingSelection commits the staged parameters on a tab without a filter context", () => {
        const initial = makeState({ parameters: { parameters: stagedTopN } });

        const next = produce(initial, (draft) =>
            tabsReducers.applyWorkingSelection(draft, tabsActions.applyWorkingSelection({})),
        );

        const tab = activeTabOf(next as ITabsState);
        expect(tab.filterContext).toBeUndefined();
        expect(tab.parameters!.parameters[0]?.runtimeOverride).toBe(99);
        expect(tab.parameters!.parameters[0]).not.toHaveProperty("workingOverride");
    });

    it("resetWorkingSelection drops the staged parameters on a tab without a filter context", () => {
        const initial = makeState({ parameters: { parameters: stagedTopN } });

        const next = produce(initial, (draft) =>
            tabsReducers.resetWorkingSelection(draft, tabsActions.resetWorkingSelection()),
        );

        const tab = activeTabOf(next as ITabsState);
        expect(tab.filterContext).toBeUndefined();
        expect(tab.parameters!.parameters[0]?.runtimeOverride).toBe(10);
        expect(tab.parameters!.parameters[0]).not.toHaveProperty("workingOverride");
    });
});
