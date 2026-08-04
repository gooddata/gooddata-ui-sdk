// (C) 2026 GoodData Corporation

import { produce } from "immer";
import { describe, expect, it } from "vitest";

import { BROWSER_DETECTED, type IDashboard, type IDashboardTimezoneConfig } from "@gooddata/sdk-model";

import { type DashboardState } from "../../types.js";
import { metaReducers } from "../metaReducers.js";
import { selectEffectiveDashboardTimezone } from "../metaSelectors.js";
import { type IDashboardMetaState } from "../metaState.js";

const dashboardWith = (timezoneConfig: IDashboardTimezoneConfig | undefined): IDashboard =>
    ({
        type: "IDashboard",
        title: "Dashboard",
        description: "",
        shareStatus: "private",
        ...(timezoneConfig ? { timezoneConfig } : {}),
    }) as IDashboard;

// reducers are applied via immer's produce, mirroring the RTK slice runtime — each application
// yields fresh object references, which the memoized reselect selectors rely on
function loadedState(dashboard: IDashboard): IDashboardMetaState {
    return produce({} as IDashboardMetaState, (draft) =>
        metaReducers.setMeta(draft, { type: "setMeta", payload: { dashboard } }),
    );
}

function stateWith(
    timezoneConfig: IDashboardTimezoneConfig | undefined,
    enableDashboardTimezone: boolean,
): DashboardState {
    return {
        meta: loadedState(dashboardWith(timezoneConfig)),
        config: { config: { settings: { enableDashboardTimezone } } },
    } as unknown as DashboardState;
}

describe("selectEffectiveDashboardTimezone", () => {
    it("should return undefined when the feature flag is off", () => {
        const state = stateWith({ timezoneId: "Europe/Prague" }, false);

        expect(selectEffectiveDashboardTimezone(state)).toBeUndefined();
    });

    it("should return the configured IANA timezone as-is", () => {
        const state = stateWith({ timezoneId: "Europe/Prague" }, true);

        expect(selectEffectiveDashboardTimezone(state)).toBe("Europe/Prague");
    });

    it("should resolve the browser-detected sentinel to the browser timezone", () => {
        const state = stateWith({ timezoneId: BROWSER_DETECTED }, true);

        expect(selectEffectiveDashboardTimezone(state)).toBe(
            Intl.DateTimeFormat().resolvedOptions().timeZone,
        );
    });

    it("should return undefined when the dashboard has no timezone configured", () => {
        const state = stateWith(undefined, true);

        expect(selectEffectiveDashboardTimezone(state)).toBeUndefined();
    });

    it("should return undefined when the configuration has no timezoneId", () => {
        const state = stateWith({ showTimezoneInfo: true }, true);

        expect(selectEffectiveDashboardTimezone(state)).toBeUndefined();
    });
});
