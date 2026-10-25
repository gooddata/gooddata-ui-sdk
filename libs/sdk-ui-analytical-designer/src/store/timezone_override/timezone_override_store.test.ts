// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { setTimezoneOverride } from "../../actions/timezone_override_actions.js";
import { rootReducer } from "../../reducers/root_reducer.js";
import { getTimezoneOverride } from "../../selectors/timezone_override_selectors.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";

/**
 * The timezoneOverride slice. Pins the value round-trip AND the null-normalization
 * boundary: the slice stores null for "no override" and the selector answers undefined, which is
 * what the readers' `!override` / default-parameter idioms expect.
 */
describe("timezoneOverride store", () => {
    it("self-initializes to null and the selector answers undefined", () => {
        const state = getInitializedState();

        expect(state.timezoneOverride).toBe(null);
        expect(getTimezoneOverride(state)).toBeUndefined();
    });

    it("stores the override timezone id", () => {
        const state = rootReducer(getInitializedState(), setTimezoneOverride("Europe/Prague"));

        expect(getTimezoneOverride(state)).toBe("Europe/Prague");
    });

    it("clears the override on an undefined payload, normalized to null", () => {
        const withOverride = rootReducer(getInitializedState(), setTimezoneOverride("Europe/Prague"));
        const cleared = rootReducer(withOverride, setTimezoneOverride(undefined));

        expect(cleared.timezoneOverride).toBe(null);
        expect(getTimezoneOverride(cleared)).toBeUndefined();
    });
});
