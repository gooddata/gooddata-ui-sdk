// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IDashboardParameter, idRef } from "@gooddata/sdk-model";

import { parametersActions, parametersSliceReducer } from "../index.js";
import { type IParametersState, parametersInitialState } from "../parametersState.js";

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

function reduce(
    state: IParametersState,
    action: ReturnType<(typeof parametersActions)[keyof typeof parametersActions]>,
) {
    return parametersSliceReducer(state, action);
}

describe("parameters slice", () => {
    describe("addParameter", () => {
        it("adds entry initialized to workspace default when value not pinned", () => {
            const next = reduce(
                parametersInitialState,
                parametersActions.addParameter({ parameter: topNParameter, workspaceDefault: 10 }),
            );

            expect(next.parameters).toEqual([{ parameter: topNParameter, runtimeOverride: 10 }]);
        });

        it("adds entry initialized to pinned value when present", () => {
            const next = reduce(
                parametersInitialState,
                parametersActions.addParameter({ parameter: topNPinned, workspaceDefault: 10 }),
            );

            expect(next.parameters).toEqual([{ parameter: topNPinned, runtimeOverride: 25 }]);
        });

        it("ignores duplicate refs (picker dedup)", () => {
            const once = reduce(
                parametersInitialState,
                parametersActions.addParameter({ parameter: topNParameter, workspaceDefault: 10 }),
            );
            const twice = reduce(
                once,
                parametersActions.addParameter({ parameter: topNParameter, workspaceDefault: 50 }),
            );

            expect(twice.parameters).toHaveLength(1);
            expect(twice.parameters[0]?.runtimeOverride).toBe(10);
        });
    });

    describe("setParameterRuntimeValue", () => {
        it("updates only runtimeOverride, leaves persisted entry untouched", () => {
            const initial = reduce(
                parametersInitialState,
                parametersActions.addParameter({ parameter: topNParameter, workspaceDefault: 10 }),
            );

            const next = reduce(
                initial,
                parametersActions.setParameterRuntimeValue({ ref: topNRef, value: 99 }),
            );

            expect(next.parameters[0]?.parameter).toEqual(topNParameter);
            expect(next.parameters[0]?.runtimeOverride).toBe(99);
        });

        it("is a no-op when ref is unknown", () => {
            const initial = reduce(
                parametersInitialState,
                parametersActions.addParameter({ parameter: topNParameter, workspaceDefault: 10 }),
            );

            const next = reduce(
                initial,
                parametersActions.setParameterRuntimeValue({ ref: sampleRef, value: 99 }),
            );

            expect(next.parameters).toEqual(initial.parameters);
        });
    });

    describe("removeParameter", () => {
        it("filters out the entry by ref", () => {
            const seeded = reduce(
                parametersInitialState,
                parametersActions.addParameter({ parameter: topNParameter, workspaceDefault: 10 }),
            );

            const next = reduce(seeded, parametersActions.removeParameter({ ref: topNRef }));

            expect(next.parameters).toEqual([]);
        });
    });

    describe("setParameterEntries", () => {
        it("replaces entries (used on dashboard load)", () => {
            const replacement = [{ parameter: topNPinned, runtimeOverride: 25 }];

            const next = reduce(parametersInitialState, parametersActions.setParameterEntries(replacement));

            expect(next.parameters).toEqual(replacement);
        });
    });
});
