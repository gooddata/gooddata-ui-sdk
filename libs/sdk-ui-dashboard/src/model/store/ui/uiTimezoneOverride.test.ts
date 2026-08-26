// (C) 2026 GoodData Corporation

// @vitest-environment node

import { produce } from "immer";
import { describe, expect, it } from "vitest";

import { type DashboardState } from "../types.js";

import { uiReducers } from "./uiReducers.js";
import { selectIsTimezoneDialogOpen, selectTimezoneOverride } from "./uiSelectors.js";
import { type IUiState, uiInitialState } from "./uiState.js";

// reducers are applied via immer's produce, mirroring the RTK slice runtime — each application
// yields fresh object references, which the memoized reselect selectors rely on
function setTimezoneOverride(state: IUiState, payload: string | undefined): IUiState {
    return produce(state, (draft) =>
        uiReducers.setTimezoneOverride(draft, { type: "setTimezoneOverride", payload }),
    );
}

function stateWithUi(ui: IUiState): DashboardState {
    return { ui } as DashboardState;
}

describe("ui timezoneOverride", () => {
    it("should have no override by default", () => {
        expect(selectTimezoneOverride(stateWithUi(uiInitialState))).toBeUndefined();
    });

    it("should store the concrete IANA timezone ID", () => {
        const state = setTimezoneOverride(uiInitialState, "Europe/Prague");

        expect(selectTimezoneOverride(stateWithUi(state))).toBe("Europe/Prague");
    });

    it("should replace an existing override", () => {
        const state = setTimezoneOverride(
            setTimezoneOverride(uiInitialState, "Europe/Prague"),
            "America/New_York",
        );

        expect(selectTimezoneOverride(stateWithUi(state))).toBe("America/New_York");
    });

    it("should clear the override via undefined", () => {
        const state = setTimezoneOverride(setTimezoneOverride(uiInitialState, "Europe/Prague"), undefined);

        expect(selectTimezoneOverride(stateWithUi(state))).toBeUndefined();
    });

    it("should open and close the timezone dialog", () => {
        expect(selectIsTimezoneDialogOpen(stateWithUi(uiInitialState))).toBe(false);

        const opened = produce(uiInitialState, (draft) =>
            uiReducers.openTimezoneDialog(draft, { type: "openTimezoneDialog" }),
        );
        expect(selectIsTimezoneDialogOpen(stateWithUi(opened))).toBe(true);

        const closed = produce(opened, (draft) =>
            uiReducers.closeTimezoneDialog(draft, { type: "closeTimezoneDialog" }),
        );
        expect(selectIsTimezoneDialogOpen(stateWithUi(closed))).toBe(false);
    });
});
