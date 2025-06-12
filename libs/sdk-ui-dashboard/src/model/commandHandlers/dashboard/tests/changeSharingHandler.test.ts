// (C) 2021-2023 GoodData Corporation
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import { changeSharing, ChangeSharing } from "../../../commands/index.js";
import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures.js";
import { SimpleDashboardIdentifier } from "../../../tests/fixtures/SimpleDashboard.fixtures.js";
import { DashboardCommandFailed, DashboardSharingChanged } from "../../../events/index.js";
import { selectDashboardPermissions, selectDashboardShareStatus } from "../../../store/index.js";
import { dashboardPermissionsActions } from "../../../store/dashboardPermissions/index.js";
import { beforeEach, describe, it, expect } from "vitest";

describe("change dashboard sharing handler", () => {
    describe("for a existing dashboard", () => {
        let Tester: DashboardTester;
        beforeEach(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, SimpleDashboardIdentifier);
        });

        it("should save new dashboard share status and updated permission", async () => {
            Tester.dispatch(
                dashboardPermissionsActions.setDashboardPermissions({
                    canEditDashboard: false,
                    canEditLockedDashboard: false,
                    canShareDashboard: false,
                    canShareLockedDashboard: false,
                    canViewDashboard: false,
                }),
            );
            const event: DashboardSharingChanged = await Tester.dispatchAndWaitFor(
                changeSharing(
                    {
                        shareStatus: "public",
                        isUnderStrictControl: false,
                        isLocked: true,
                        granteesToAdd: [],
                        granteesToDelete: [],
                    },
                    TestCorrelation,
                ),
                "GDC.DASH/EVT.SHARING.CHANGED",
            );

            expect(event.payload).toEqual({
                newSharingProperties: {
                    shareStatus: "public",
                    isUnderStrictControl: false,
                    isLocked: true,
                    granteesToAdd: [],
                    granteesToDelete: [],
                },
            });
            const newState = Tester.state();
            expect(selectDashboardShareStatus(newState)).toEqual("public");
            expect(selectDashboardPermissions(newState)).toEqual({
                canEditDashboard: true,
                canEditLockedDashboard: true,
                canShareDashboard: true,
                canShareLockedDashboard: true,
                canViewDashboard: true,
            });
        });

        it("should emit correct events", async () => {
            await Tester.dispatchAndWaitFor(
                changeSharing(
                    {
                        shareStatus: "public",
                        isUnderStrictControl: false,
                        isLocked: true,
                        granteesToAdd: [],
                        granteesToDelete: [],
                    },
                    TestCorrelation,
                ),
                "GDC.DASH/EVT.SHARING.CHANGED",
            );
            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });
    });

    describe("for a new dashboard", () => {
        let Tester: DashboardTester;
        beforeEach(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, undefined);
        });

        it("should fail", async () => {
            const event: DashboardCommandFailed<ChangeSharing> = await Tester.dispatchAndWaitFor(
                changeSharing(
                    {
                        shareStatus: "public",
                        isUnderStrictControl: false,
                        isLocked: true,
                        granteesToAdd: [],
                        granteesToDelete: [],
                    },
                    TestCorrelation,
                ),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );
            expect(event.payload.reason).toBe("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
            const newState = Tester.state();
            expect(selectDashboardShareStatus(newState)).toEqual("private");
        });
    });
});
