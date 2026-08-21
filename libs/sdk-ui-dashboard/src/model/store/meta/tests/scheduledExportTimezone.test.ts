// (C) 2026 GoodData Corporation

import { produce } from "immer";
import { describe, expect, it } from "vitest";

import { BROWSER_DETECTED, type IDashboard, type IDashboardTimezoneConfig } from "@gooddata/sdk-model";

import { type DashboardState } from "../../types.js";
import { uiInitialState } from "../../ui/uiState.js";
import { metaReducers } from "../metaReducers.js";
import { selectScheduledExportTimezone } from "../metaSelectors.js";
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
    enableTimezoneChange: boolean,
    timezoneOverride?: string,
): DashboardState {
    return {
        meta: loadedState(dashboardWith(timezoneConfig)),
        config: { config: { settings: { enableTimezoneChange } } },
        ui: { ...uiInitialState, timezoneOverride },
    } as unknown as DashboardState;
}

describe("selectScheduledExportTimezone", () => {
    it("should return undefined when the feature flag is off", () => {
        const state = stateWith({ timezoneId: "Europe/Prague" }, false, "America/New_York");

        expect(selectScheduledExportTimezone(state)).toBeUndefined();
    });

    it("should return the session override so the backend receives a value it cannot derive", () => {
        const state = stateWith({ timezoneId: "Europe/Prague" }, true, "America/New_York");

        expect(selectScheduledExportTimezone(state)).toBe("America/New_York");
    });

    it("should return the session override even when the dashboard has no timezone configured", () => {
        const state = stateWith(undefined, true, "America/New_York");

        expect(selectScheduledExportTimezone(state)).toBe("America/New_York");
    });

    it("should resolve the browser-detected sentinel because the backend has no browser to detect from", () => {
        const state = stateWith({ timezoneId: BROWSER_DETECTED }, true);

        expect(selectScheduledExportTimezone(state)).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone);
    });

    it("should give the session override precedence over the browser-detected sentinel", () => {
        const state = stateWith({ timezoneId: BROWSER_DETECTED }, true, "America/New_York");

        expect(selectScheduledExportTimezone(state)).toBe("America/New_York");
    });

    it("should return undefined for an explicitly configured timezone the backend reads itself", () => {
        const state = stateWith({ timezoneId: "Europe/Prague" }, true);

        expect(selectScheduledExportTimezone(state)).toBeUndefined();
    });

    it("should return undefined when the dashboard has no timezone configured", () => {
        const state = stateWith(undefined, true);

        expect(selectScheduledExportTimezone(state)).toBeUndefined();
    });

    it("should return undefined when the configuration has no timezoneId", () => {
        const state = stateWith({ showTimezoneInfo: true }, true);

        expect(selectScheduledExportTimezone(state)).toBeUndefined();
    });
});
