// (C) 2026 GoodData Corporation

import { produce } from "immer";
import { describe, expect, it } from "vitest";

import { type IDashboardParameter, idRef } from "@gooddata/sdk-model";

import { tabsActions } from "../../index.js";
import { type ITabsState } from "../../tabsState.js";
import { parametersReducers } from "../parametersReducers.js";
import { type IParametersState } from "../parametersState.js";

const topNRef = idRef("topN", "parameter");
const sampleRef = idRef("sampleSize", "parameter");

const topNParameter: IDashboardParameter = {
    ref: topNRef,
    parameterType: "NUMBER",
    mode: "active",
};

const topNPinned: IDashboardParameter = {
    ref: topNRef,
    parameterType: "NUMBER",
    mode: "active",
    value: 25,
};

function makeState(parameters?: IParametersState["parameters"]): ITabsState {
    return {
        tabs: [
            {
                localIdentifier: "tab-1",
                title: "Tab 1",
                parameters: parameters ? { parameters } : undefined,
            },
        ],
        activeTabLocalIdentifier: "tab-1",
    };
}

function activeParameters(state: ITabsState): IParametersState["parameters"] {
    return state.tabs?.[0]?.parameters?.parameters ?? [];
}

describe("parameters reducers (per tab)", () => {
    describe("addParameter", () => {
        it("adds entry initialized to workspace default when value not pinned", () => {
            const initial = makeState();

            const next = produce(initial, (draft) =>
                parametersReducers.addParameter(
                    draft,
                    tabsActions.addParameter({ parameter: topNParameter, workspaceDefault: 10 }),
                ),
            );

            expect(activeParameters(next as ITabsState)).toEqual([
                { parameter: topNParameter, runtimeOverride: 10 },
            ]);
        });

        it("adds entry initialized to pinned value when present", () => {
            const initial = makeState();

            const next = produce(initial, (draft) =>
                parametersReducers.addParameter(
                    draft,
                    tabsActions.addParameter({ parameter: topNPinned, workspaceDefault: 10 }),
                ),
            );

            expect(activeParameters(next as ITabsState)).toEqual([
                { parameter: topNPinned, runtimeOverride: 25 },
            ]);
        });

        it("ignores duplicate refs (picker dedup) within the active tab", () => {
            const initial = makeState();

            const once = produce(initial, (draft) =>
                parametersReducers.addParameter(
                    draft,
                    tabsActions.addParameter({ parameter: topNParameter, workspaceDefault: 10 }),
                ),
            );
            const twice = produce(once, (draft) =>
                parametersReducers.addParameter(
                    draft,
                    tabsActions.addParameter({ parameter: topNParameter, workspaceDefault: 50 }),
                ),
            );

            expect(activeParameters(twice as ITabsState)).toHaveLength(1);
            expect(activeParameters(twice as ITabsState)[0]?.runtimeOverride).toBe(10);
        });

        it("only writes to the active tab", () => {
            const initial: ITabsState = {
                tabs: [
                    { localIdentifier: "tab-1", title: "Tab 1" },
                    { localIdentifier: "tab-2", title: "Tab 2" },
                ],
                activeTabLocalIdentifier: "tab-2",
            };

            const next = produce(initial, (draft) =>
                parametersReducers.addParameter(
                    draft,
                    tabsActions.addParameter({ parameter: topNParameter, workspaceDefault: 10 }),
                ),
            );

            expect(next.tabs?.[0]?.parameters).toBeUndefined();
            expect(next.tabs?.[1]?.parameters?.parameters).toEqual([
                { parameter: topNParameter, runtimeOverride: 10 },
            ]);
        });
    });

    describe("setParameterRuntimeValue", () => {
        it("updates only runtimeOverride on the active tab, leaves persisted entry untouched", () => {
            const initial = makeState([{ parameter: topNParameter, runtimeOverride: 10 }]);

            const next = produce(initial, (draft) =>
                parametersReducers.setParameterRuntimeValue(
                    draft,
                    tabsActions.setParameterRuntimeValue({ ref: topNRef, value: 99 }),
                ),
            );

            expect(activeParameters(next as ITabsState)[0]?.parameter).toEqual(topNParameter);
            expect(activeParameters(next as ITabsState)[0]?.runtimeOverride).toBe(99);
        });

        it("is a no-op when ref is unknown on the active tab", () => {
            const initial = makeState([{ parameter: topNParameter, runtimeOverride: 10 }]);

            const next = produce(initial, (draft) =>
                parametersReducers.setParameterRuntimeValue(
                    draft,
                    tabsActions.setParameterRuntimeValue({ ref: sampleRef, value: 99 }),
                ),
            );

            expect(activeParameters(next as ITabsState)).toEqual([
                { parameter: topNParameter, runtimeOverride: 10 },
            ]);
        });

        it("setting runtime override on tab A does not change tab B's value for the same ref", () => {
            const initial: ITabsState = {
                tabs: [
                    {
                        localIdentifier: "tab-A",
                        title: "Tab A",
                        parameters: { parameters: [{ parameter: topNParameter, runtimeOverride: 10 }] },
                    },
                    {
                        localIdentifier: "tab-B",
                        title: "Tab B",
                        parameters: { parameters: [{ parameter: topNParameter, runtimeOverride: 10 }] },
                    },
                ],
                activeTabLocalIdentifier: "tab-A",
            };

            const next = produce(initial, (draft) =>
                parametersReducers.setParameterRuntimeValue(
                    draft,
                    tabsActions.setParameterRuntimeValue({ ref: topNRef, value: 99 }),
                ),
            );

            expect(next.tabs?.[0]?.parameters?.parameters[0]?.runtimeOverride).toBe(99);
            expect(next.tabs?.[1]?.parameters?.parameters[0]?.runtimeOverride).toBe(10);
        });
    });

    describe("removeParameter", () => {
        it("filters out the entry by ref from the active tab", () => {
            const initial = makeState([{ parameter: topNParameter, runtimeOverride: 10 }]);

            const next = produce(initial, (draft) =>
                parametersReducers.removeParameter(draft, tabsActions.removeParameter({ ref: topNRef })),
            );

            expect(activeParameters(next as ITabsState)).toEqual([]);
        });
    });
});
