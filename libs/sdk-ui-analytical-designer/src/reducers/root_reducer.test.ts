// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { ActionTypeKeys } from "../constants/actions.js";
import { getInitializedState } from "../tests/state.test.helpers.js";
import { withData } from "../tests/state_builder.test.helpers.js";

import { initialState } from "./initial_state.js";
import { rootReducer } from "./root_reducer.js";

describe("rootReducer wiring", () => {
    // the root is the combined core plus the two sanctioned infrastructure wrappers; redux's
    // strict combineReducers enforces one-owner-per-key by construction (see
    // strict_root_composition.test.ts for the full contract)

    it("should return the pristine initial state on RESET_FOR_PLUGGABLE_MOUNT", () => {
        const state = withData(getInitializedState(), { title: "dirty title" });

        const result = rootReducer(state, { type: ActionTypeKeys.RESET_FOR_PLUGGABLE_MOUNT });

        expect(result).toStrictEqual(initialState);
    });

    it("should build a FRESH pristine state per reset (7.1) — the plain root is mutable, so a shared singleton would leak one mount's mutation into the next", () => {
        const state = withData(getInitializedState(), { title: "dirty title" });

        const first = rootReducer(state, { type: ActionTypeKeys.RESET_FOR_PLUGGABLE_MOUNT });
        const second = rootReducer(state, { type: ActionTypeKeys.RESET_FOR_PLUGGABLE_MOUNT });

        expect(first).not.toBe(initialState);
        expect(first).not.toBe(second);
    });
});
