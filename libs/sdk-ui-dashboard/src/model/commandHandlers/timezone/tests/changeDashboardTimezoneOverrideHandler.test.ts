// (C) 2026 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import { BROWSER_DETECTED } from "@gooddata/sdk-model";

import { initializeDashboard } from "../../../commands/dashboard.js";
import { changeDashboardTimezoneOverride } from "../../../commands/timezone.js";
import { type IDashboardTimezoneOverrideChanged } from "../../../events/timezone.js";
import { metaActions } from "../../../store/meta/index.js";
import { selectEffectiveDashboardTimezone } from "../../../store/meta/metaSelectors.js";
import { selectTimezoneOverride } from "../../../store/ui/uiSelectors.js";
import { type DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures.js";
import { SimpleDashboardNoDrillsIdentifier } from "../../../tests/fixtures/SimpleDashboardNoDrills.fixtures.js";

async function createTester(
    enableDashboardTimezone: boolean,
    enableTimezoneChange = false,
): Promise<DashboardTester> {
    let Tester: DashboardTester;
    await preloadedTesterFactory(
        (tester) => {
            Tester = tester;
        },
        SimpleDashboardNoDrillsIdentifier,
        {
            initCommand: initializeDashboard({
                settings: { enableDashboardTimezone, enableTimezoneChange },
            }),
        },
    );
    return Tester!;
}

describe("changeDashboardTimezoneOverrideHandler", () => {
    describe("when the override is allowed", () => {
        let Tester: DashboardTester;

        beforeEach(async () => {
            Tester = await createTester(true);
            Tester.dispatch(
                metaActions.setDashboardTimezoneConfig({
                    timezoneId: "Europe/Prague",
                    allowUserOverrideInViewMode: true,
                }),
            );
        });

        it("should set the override and emit the changed event with the effective timezone", async () => {
            const event: IDashboardTimezoneOverrideChanged = await Tester.dispatchAndWaitFor(
                changeDashboardTimezoneOverride("America/New_York", TestCorrelation),
                "GDC.DASH/EVT.TIMEZONE_OVERRIDE.CHANGED",
            );

            expect(event.payload.timezoneOverride).toBe("America/New_York");
            expect(event.payload.effectiveTimezone).toBe("America/New_York");
            expect(event.correlationId).toBe(TestCorrelation);
            expect(Tester.select(selectTimezoneOverride)).toBe("America/New_York");
            expect(Tester.select(selectEffectiveDashboardTimezone)).toBe("America/New_York");
        });

        it("should resolve the browser-detected sentinel to the browser timezone", async () => {
            const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

            const event: IDashboardTimezoneOverrideChanged = await Tester.dispatchAndWaitFor(
                changeDashboardTimezoneOverride(BROWSER_DETECTED, TestCorrelation),
                "GDC.DASH/EVT.TIMEZONE_OVERRIDE.CHANGED",
            );

            expect(event.payload.timezoneOverride).toBe(browserTimezone);
            expect(event.payload.effectiveTimezone).toBe(browserTimezone);
            expect(Tester.select(selectTimezoneOverride)).toBe(browserTimezone);
        });

        it("should clear the override when undefined is dispatched and fall back to the configured timezone", async () => {
            await Tester.dispatchAndWaitFor(
                changeDashboardTimezoneOverride("America/New_York"),
                "GDC.DASH/EVT.TIMEZONE_OVERRIDE.CHANGED",
            );

            const event: IDashboardTimezoneOverrideChanged = await Tester.dispatchAndWaitFor(
                changeDashboardTimezoneOverride(undefined, TestCorrelation),
                "GDC.DASH/EVT.TIMEZONE_OVERRIDE.CHANGED",
            );

            expect(event.payload.timezoneOverride).toBeUndefined();
            expect(event.payload.effectiveTimezone).toBe("Europe/Prague");
            expect(Tester.select(selectTimezoneOverride)).toBeUndefined();
        });

        it("should fail the command when an invalid IANA timezone ID is dispatched", async () => {
            await Tester.dispatchAndWaitFor(
                changeDashboardTimezoneOverride("Not/A_Timezone", TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(Tester.select(selectTimezoneOverride)).toBeUndefined();
        });
    });

    describe("gating", () => {
        it("should fail the command when the feature flag is off", async () => {
            const Tester = await createTester(false);
            Tester.dispatch(
                metaActions.setDashboardTimezoneConfig({
                    allowUserOverrideInViewMode: true,
                }),
            );

            await Tester.dispatchAndWaitFor(
                changeDashboardTimezoneOverride("Europe/Prague", TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(Tester.select(selectTimezoneOverride)).toBeUndefined();
        });

        it("should fail the command when the configuration does not allow user overrides", async () => {
            const Tester = await createTester(true);
            Tester.dispatch(
                metaActions.setDashboardTimezoneConfig({
                    timezoneId: "Europe/Prague",
                }),
            );

            await Tester.dispatchAndWaitFor(
                changeDashboardTimezoneOverride("Europe/Prague", TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(Tester.select(selectTimezoneOverride)).toBeUndefined();
        });

        it("should allow the command when the dashboard does not set an override and the organization setting is on", async () => {
            const Tester = await createTester(true, true);
            Tester.dispatch(
                metaActions.setDashboardTimezoneConfig({
                    timezoneId: "Europe/Prague",
                }),
            );

            await Tester.dispatchAndWaitFor(
                changeDashboardTimezoneOverride("America/New_York", TestCorrelation),
                "GDC.DASH/EVT.TIMEZONE_OVERRIDE.CHANGED",
            );

            expect(Tester.select(selectTimezoneOverride)).toBe("America/New_York");
        });

        it("should fail the command when the dashboard explicitly disallows overrides even if the organization setting is on", async () => {
            const Tester = await createTester(true, true);
            Tester.dispatch(
                metaActions.setDashboardTimezoneConfig({
                    timezoneId: "Europe/Prague",
                    allowUserOverrideInViewMode: false,
                }),
            );

            await Tester.dispatchAndWaitFor(
                changeDashboardTimezoneOverride("America/New_York", TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(Tester.select(selectTimezoneOverride)).toBeUndefined();
        });
    });
});
