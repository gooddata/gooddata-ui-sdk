// (C) 2026 GoodData Corporation

import { produce } from "immer";
import { describe, expect, it } from "vitest";

import { BROWSER_DETECTED, type IDashboard, type IDashboardTimezoneConfig } from "@gooddata/sdk-model";

import { type DashboardState } from "../../types.js";
import { metaReducers } from "../metaReducers.js";
import {
    selectDashboardTimezoneConfig,
    selectIsTimezoneConfigChanged,
    selectPersistedDashboardTimezoneConfig,
} from "../metaSelectors.js";
import { type IDashboardMetaState } from "../metaState.js";

const timezoneConfig: IDashboardTimezoneConfig = {
    timezoneId: "Europe/Prague",
    showTimezoneInfo: true,
    allowUserOverrideInViewMode: true,
};

const dashboard = {
    type: "IDashboard",
    title: "Dashboard with timezone",
    description: "",
    shareStatus: "private",
    timezoneConfig,
} as IDashboard;

// reducers are applied via immer's produce, mirroring the RTK slice runtime — each application
// yields fresh object references, which the memoized reselect selectors rely on
function loadedState(loadedDashboard: IDashboard = dashboard): IDashboardMetaState {
    return produce({} as IDashboardMetaState, (draft) =>
        metaReducers.setMeta(draft, { type: "setMeta", payload: { dashboard: loadedDashboard } }),
    );
}

function setTimezoneConfig(
    state: IDashboardMetaState,
    payload: IDashboardTimezoneConfig | undefined,
): IDashboardMetaState {
    return produce(state, (draft) =>
        metaReducers.setDashboardTimezoneConfig(draft, { type: "setDashboardTimezoneConfig", payload }),
    );
}

function stateWithMeta(meta: IDashboardMetaState): DashboardState {
    return { meta } as DashboardState;
}

describe("meta timezoneConfig", () => {
    it("should seed descriptor and persisted dashboard from the loaded dashboard", () => {
        const state = loadedState();

        expect(selectDashboardTimezoneConfig(stateWithMeta(state))).toEqual(timezoneConfig);
        expect(selectPersistedDashboardTimezoneConfig(stateWithMeta(state))).toEqual(timezoneConfig);
    });

    it("should update descriptor without touching the persisted dashboard", () => {
        const newConfig: IDashboardTimezoneConfig = { timezoneId: BROWSER_DETECTED };
        const state = setTimezoneConfig(loadedState(), newConfig);

        expect(selectDashboardTimezoneConfig(stateWithMeta(state))).toEqual(newConfig);
        expect(selectPersistedDashboardTimezoneConfig(stateWithMeta(state))).toEqual(timezoneConfig);
    });

    it("should support clearing the configuration", () => {
        const state = setTimezoneConfig(loadedState(), undefined);

        expect(selectDashboardTimezoneConfig(stateWithMeta(state))).toBeUndefined();
        expect(selectPersistedDashboardTimezoneConfig(stateWithMeta(state))).toEqual(timezoneConfig);
    });

    it("should normalize the configuration on write", () => {
        const state = setTimezoneConfig(loadedState(), {
            timezoneId: "Europe/Prague",
            showTimezoneInfo: false,
        });

        expect(selectDashboardTimezoneConfig(stateWithMeta(state))).toEqual({
            timezoneId: "Europe/Prague",
        });
    });

    it("should persist an explicit allowUserOverrideInViewMode false so dashboards can override a true org default", () => {
        const state = setTimezoneConfig(loadedState(), {
            showTimezoneInfo: false,
            allowUserOverrideInViewMode: false,
        });

        expect(selectDashboardTimezoneConfig(stateWithMeta(state))).toEqual({
            allowUserOverrideInViewMode: false,
        });
    });

    it("should report the timezone configuration as changed after resetting it to the workspace default", () => {
        const loaded = loadedState();
        expect(selectIsTimezoneConfigChanged(stateWithMeta(loaded))).toBe(false);

        const reset = setTimezoneConfig(loaded, undefined);
        expect(selectIsTimezoneConfigChanged(stateWithMeta(reset))).toBe(true);
    });

    it("should not report a change when the persisted config differs only in explicit default values", () => {
        const persisted = {
            ...dashboard,
            timezoneConfig: { timezoneId: "Europe/Prague", showTimezoneInfo: false },
        } as IDashboard;
        const state = setTimezoneConfig(loadedState(persisted), { timezoneId: "Europe/Prague" });

        expect(selectIsTimezoneConfigChanged(stateWithMeta(state))).toBe(false);
    });

    it("should leave descriptor timezoneConfig undefined for a dashboard without it", () => {
        const { timezoneConfig: _ignored, ...dashboardWithoutTimezone } = dashboard;
        const state = loadedState(dashboardWithoutTimezone as IDashboard);

        expect(selectDashboardTimezoneConfig(stateWithMeta(state))).toBeUndefined();
        expect(selectPersistedDashboardTimezoneConfig(stateWithMeta(state))).toBeUndefined();
    });
});
