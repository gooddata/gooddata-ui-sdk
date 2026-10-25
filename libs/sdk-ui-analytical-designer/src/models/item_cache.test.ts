// (C) 2007-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { initialState } from "../reducers/initial_state.js";

import { load, loadWithDefault, save } from "./item_cache.js";

describe("Item cache", () => {
    it("should allow to store items to cache", () => {
        const state = save(initialState, {
            key1: { identifier: "cached item 1" },
            key2: { identifier: "cached item 2" },
        });

        expect(load(state, "key1")).toEqual({ identifier: "cached item 1" });
        expect(load(state, "key2")).toEqual({ identifier: "cached item 2" });
    });

    it("should throw for non existent items", () => {
        expect(() => load(initialState, "non existent key")).toThrow();
    });

    it("should return default value if `item not found`", () => {
        expect(loadWithDefault(initialState, "non existent key", false)).toEqual(false);
    });
});
