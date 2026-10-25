// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { setFeatureFlagsItems } from "../../actions/featureFlags_actions.js";
import { combinedRootReducer } from "../../reducers/combined_root_reducer.js";
import { initialState } from "../../reducers/initial_state.js";
import { userSettings } from "../../tests/feature_flags.test.helpers.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";

import { getFeatureFlagsState } from "./feature_flags_selectors.js";
import { featureFlagsInitialState } from "./feature_flags_state.js";

describe("featureFlags store", () => {
    it("self-initializes to an empty snapshot on the first action", () => {
        const state = combinedRootReducer(initialState, { type: "@@INIT" });

        expect(getFeatureFlagsState(state)).toEqual({});
    });

    it("returns the initial state through the selector before the slice ever reduced", () => {
        expect(getFeatureFlagsState(initialState)).toBe(featureFlagsInitialState);
    });

    it("stores a shallow copy of the settings", () => {
        const configs = userSettings({ enableSomething: true, someLimit: 42 });

        const state = combinedRootReducer(getInitializedState(), setFeatureFlagsItems(configs));

        expect(getFeatureFlagsState(state)).toEqual(configs);
        expect(getFeatureFlagsState(state)).not.toBe(configs);
    });

    it("replaces the whole snapshot on every store (no merge across workspace switches)", () => {
        const first = combinedRootReducer(
            getInitializedState(),
            setFeatureFlagsItems(userSettings({ enableA: true })),
        );
        const second = combinedRootReducer(first, setFeatureFlagsItems(userSettings({ enableB: false })));

        expect(getFeatureFlagsState(second)).toEqual(userSettings({ enableB: false }));
    });

    it("keeps the root reference on unrelated actions (identity short-circuit)", () => {
        const state = getInitializedState();

        expect(combinedRootReducer(state, { type: "SOMETHING_ELSE" })).toBe(state);
    });
});
