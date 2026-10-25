// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { initialState } from "../../reducers/initial_state.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { withRoot } from "../../tests/state_builder.test.helpers.js";

import { getColorPalette, isColorPaletteDefined } from "./app_context_selectors.js";

// moved from services/test/color_palette_service.test.ts — the readers are domain
// selectors
describe("colorPalette selectors", () => {
    const colorPalette = [
        {
            guid: "01",
            fill: {
                r: 255,
                g: 0,
                b: 0,
            },
        },
    ];
    describe("getColorPalette", () => {
        it("should return array of color items", () => {
            const state = withRoot(initialState, { colorPalette: colorPalette });

            expect(getColorPalette(state)).toEqual(colorPalette);
        });

        it("should return null when color palette is not set", () => {
            expect(getColorPalette(initialState)).toEqual(null);
            expect(getColorPalette(getInitializedState())).toEqual(null);
        });
    });

    describe("isColorPaletteDefined", () => {
        it("should be falsy, when color palette is not set", () => {
            expect(isColorPaletteDefined(initialState)).toEqual(false);
            expect(isColorPaletteDefined(getInitializedState())).toEqual(false);
        });

        it("should be true, when color palette is set", () => {
            const state = withRoot(initialState, { colorPalette: colorPalette });

            expect(isColorPaletteDefined(state)).toEqual(true);
        });
    });
});
