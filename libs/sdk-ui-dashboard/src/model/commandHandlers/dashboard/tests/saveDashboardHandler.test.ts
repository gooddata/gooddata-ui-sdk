// (C) 2021-2022 GoodData Corporation
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester";
import { addLayoutSection, saveDashboard } from "../../../commands";
import { TestInsightItem } from "../../../tests/fixtures/Layout.fixtures";
import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures";
import { DashboardSaved } from "../../../events";
import { selectBasicLayout } from "../../../store/layout/layoutSelectors";
import { isTemporaryIdentity } from "../../../utils/dashboardItemUtils";
import { selectFilterContextIdentity } from "../../../store/filterContext/filterContextSelectors";
import { selectPersistedDashboard } from "../../../store/meta/metaSelectors";
import { getDashboardWithSharing } from "../saveDashboardHandler";
import {
    SimpleDashboardFilterContext,
    SimpleDashboardWithReferences,
} from "../../../tests/fixtures/SimpleDashboard.fixtures";
import { IDashboardDefinition } from "@gooddata/sdk-model";

describe("save dashboard handler", () => {
    describe("for a new dashboard", () => {
        let Tester: DashboardTester;
        // each test starts with a new dashboard
        beforeEach(
            preloadedTesterFactory(
                (tester) => {
                    Tester = tester;
                },
                undefined,
                {
                    backendConfig: {
                        useRefType: "id",
                    },
                },
            ),
        );

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
        [true, { shareStatus: "private", isLocked: false, isUnderStrictControl: true }],
        [false, { shareStatus: "public", isLocked: false, isUnderStrictControl: undefined }],
    ])(
        "should set proper sharing on dashboard for new dashboard when supportsAccessControl %s",
        (sharingSupported, expectedResult) => {
            const { shareStatus, isLocked, isUnderStrictControl } = getDashboardWithSharing(
                dashboard,
                sharingSupported,
                true,
            );
            expect(shareStatus).toBe(expectedResult.shareStatus);
            expect(isLocked).toBe(expectedResult.isLocked);
            expect(isUnderStrictControl).toBe(expectedResult.isUnderStrictControl);
        },
    );

    it.each([
        [true, { shareStatus: "public", isLocked: false, isUnderStrictControl: undefined }],
        [false, { shareStatus: "public", isLocked: false, isUnderStrictControl: undefined }],
    ])(
        "should set proper sharing on dashboard for existing public dashboard when supportsAccessControl %s",
        (sharingSupported, expectedResult) => {
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
                sharingSupported,
                false,
            );
            expect(shareStatus).toBe(expectedResult.shareStatus);
            expect(isLocked).toBe(expectedResult.isLocked);
            expect(isUnderStrictControl).toBe(expectedResult.isUnderStrictControl);
        },
    );
});
