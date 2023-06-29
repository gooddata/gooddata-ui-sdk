// (C) 2021-2022 GoodData Corporation
import { beforeEach, describe, it, expect } from "vitest";
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import { addLayoutSection, saveDashboard } from "../../../commands/index.js";
import { TestInsightItem } from "../../../tests/fixtures/Layout.fixtures.js";
import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures.js";
import { DashboardSaved } from "../../../events/index.js";
import { selectBasicLayout } from "../../../store/layout/layoutSelectors.js";
import { isTemporaryIdentity } from "../../../utils/dashboardItemUtils.js";
import { selectFilterContextIdentity } from "../../../store/filterContext/filterContextSelectors.js";
import { selectPersistedDashboard } from "../../../store/meta/metaSelectors.js";
import { getDashboardWithSharing } from "../saveDashboardHandler.js";
import {
    SimpleDashboardFilterContext,
    SimpleDashboardWithReferences,
} from "../../../tests/fixtures/SimpleDashboard.fixtures.js";
import { IDashboardDefinition } from "@gooddata/sdk-model";

describe("save dashboard handler", () => {
    describe("for a new dashboard", () => {
        let Tester: DashboardTester;

        beforeEach(async () => {
            await preloadedTesterFactory(
                (tester) => {
                    Tester = tester;
                },
                undefined,
                {
                    backendConfig: {
                        useRefType: "id",
                    },
                },
            );
        });

        it("should save a new dashboard", async () => {
            // add something onto the layout
            await Tester.dispatchAndWaitFor(
                addLayoutSection(0, {}, [TestInsightItem], false, TestCorrelation),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
            );
            // .. and perform save
            const event: DashboardSaved = await Tester.dispatchAndWaitFor(
                saveDashboard(),
                "GDC.DASH/EVT.SAVED",
            );

            expect(event.payload.dashboard.ref).toBeDefined();
            expect(event.payload.newDashboard).toEqual(true);

            const state = Tester.state();

            // verify that assigned identities of the entities that make up the dashboard are stored in the state
            expect(selectPersistedDashboard(state)?.ref).toEqual(event.payload.dashboard.ref);
            const filterContextIdentity = selectFilterContextIdentity(state);
            expect(filterContextIdentity).toBeDefined();
            expect(isTemporaryIdentity(filterContextIdentity!)).toBe(false);

            const layout = selectBasicLayout(state);
            expect(isTemporaryIdentity(layout.sections[0].items[0].widget!)).toEqual(false);
        });

        it("should save an existing dashboard", async () => {
            await Tester.dispatchAndWaitFor(
                addLayoutSection(0, {}, [TestInsightItem], false, TestCorrelation),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
            );

            const initialSaveEvent: DashboardSaved = await Tester.dispatchAndWaitFor(
                saveDashboard(),
                "GDC.DASH/EVT.SAVED",
            );

            expect(initialSaveEvent.payload.newDashboard).toEqual(true);
            const originalState = Tester.state();

            await Tester.dispatchAndWaitFor(
                addLayoutSection(-1, {}, [TestInsightItem], false, TestCorrelation),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
            );
            const event: DashboardSaved = await Tester.dispatchAndWaitFor(
                saveDashboard(),
                "GDC.DASH/EVT.SAVED",
            );

            expect(event.payload.newDashboard).toEqual(false);
            const newState = Tester.state();

            const originalLayout = selectBasicLayout(originalState);
            const newLayout = selectBasicLayout(newState);

            expect(newLayout.sections[0].items[0].widget).toEqual(originalLayout.sections[0].items[0].widget);
            expect(isTemporaryIdentity(newLayout.sections[1].items[0].widget!)).toEqual(false);

            expect(selectFilterContextIdentity(newState)).toEqual(selectFilterContextIdentity(originalState));
            expect(selectPersistedDashboard(newState)?.ref).toEqual(
                selectPersistedDashboard(originalState)?.ref,
            );
        });

        it("should emit correct events", async () => {
            await Tester.dispatchAndWaitFor(saveDashboard(undefined, TestCorrelation), "GDC.DASH/EVT.SAVED");

            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });
    });
});

describe("getDashboardWithSharing", () => {
    const filterContextDefinition = SimpleDashboardFilterContext;
    const dashboard: IDashboardDefinition = {
        ...SimpleDashboardWithReferences.dashboard,
        type: "IDashboard",
        filterContext: {
            ...filterContextDefinition,
        },
    };
    it.each([
        [true, true, { shareStatus: "private", isLocked: false, isUnderStrictControl: true }],
        [false, false, { shareStatus: "public", isLocked: false, isUnderStrictControl: undefined }],
        [false, true, { shareStatus: "public", isLocked: false, isUnderStrictControl: undefined }],
        [true, false, { shareStatus: "public", isLocked: false, isUnderStrictControl: undefined }],
    ])(
        "should set proper sharing on dashboard for new dashboard when enableAnalyticalDashboardPermissions %s, supportsAccessControl %s",
        (sharingEnabled, sharingSupported, expectedResult) => {
            const { shareStatus, isLocked, isUnderStrictControl } = getDashboardWithSharing(
                dashboard,
                sharingEnabled,
                sharingSupported,
                true,
            );
            expect(shareStatus).toBe(expectedResult.shareStatus);
            expect(isLocked).toBe(expectedResult.isLocked);
            expect(isUnderStrictControl).toBe(expectedResult.isUnderStrictControl);
        },
    );

    it.each([
        [true, true, { shareStatus: "public", isLocked: false, isUnderStrictControl: undefined }],
        [false, false, { shareStatus: "public", isLocked: false, isUnderStrictControl: undefined }],
        [false, true, { shareStatus: "public", isLocked: false, isUnderStrictControl: undefined }],
        [true, false, { shareStatus: "public", isLocked: false, isUnderStrictControl: undefined }],
    ])(
        "should set proper sharing on dashboard for existing public dashboard when enableAnalyticalDashboardPermissions %s, supportsAccessControl %s",
        (sharingEnabled, sharingSupported, expectedResult) => {
            const publicDashboard: IDashboardDefinition = {
                ...SimpleDashboardWithReferences.dashboard,
                type: "IDashboard",
                filterContext: {
                    ...filterContextDefinition,
                },
                shareStatus: "public",
            };
            const { shareStatus, isLocked, isUnderStrictControl } = getDashboardWithSharing(
                publicDashboard,
                sharingEnabled,
                sharingSupported,
                false,
            );
            expect(shareStatus).toBe(expectedResult.shareStatus);
            expect(isLocked).toBe(expectedResult.isLocked);
            expect(isUnderStrictControl).toBe(expectedResult.isUnderStrictControl);
        },
    );
});
