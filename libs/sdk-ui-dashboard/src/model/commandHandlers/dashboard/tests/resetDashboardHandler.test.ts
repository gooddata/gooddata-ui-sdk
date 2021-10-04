// (C) 2021 GoodData Corporation
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester";
import {
    SimpleDashboardFilterContext,
    SimpleDashboardIdentifier,
    SimpleDashboardLayout,
} from "../../../tests/fixtures/SimpleDashboard.fixtures";
import { DashboardWasReset } from "../../../events";
import { addAttributeFilter, addLayoutSection, renameDashboard, resetDashboard } from "../../../commands";
import { selectLayout } from "../../../store/layout/layoutSelectors";
import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures";
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { attributeDisplayFormRef } from "@gooddata/sdk-model";
import { selectDashboardTitle } from "../../../store/meta/metaSelectors";
import {
    selectFilterContextAttributeFilters,
    selectFilterContextDefinition,
} from "../../../store/filterContext/filterContextSelectors";

const TestTitle = "Renamed Dashboard";

/**
 * This function does several dashboard modifications so that tests can verify they go away during reset.
 */
async function testDashboardModifications(tester: DashboardTester): Promise<any> {
    await tester.dispatchAndWaitFor(addLayoutSection(0), "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED");

    await tester.dispatchAndWaitFor(renameDashboard(TestTitle), "GDC.DASH/EVT.RENAMED");

    return await tester.dispatchAndWaitFor(
        addAttributeFilter(attributeDisplayFormRef(ReferenceLdm.Region), 0),
        "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.ADDED",
    );
}

describe("reset dashboard handler", () => {
    describe("for a new dashboard", () => {
        let Tester: DashboardTester;
        // each test starts with a new dashboard & does a couple of things
        beforeEach(
            preloadedTesterFactory(
                (tester) => {
                    Tester = tester;

                    return testDashboardModifications(tester);
                },
                undefined,
                {
                    backendConfig: {
                        useRefType: "id",
                    },
                },
            ),
        );

        it("should reset back to empty state", async () => {
            const event: DashboardWasReset = await Tester.dispatchAndWaitFor(
                resetDashboard(),
                "GDC.DASH/EVT.RESET",
            );
            expect(event.payload.dashboard).toBeUndefined();

            const newState = Tester.state();
            expect(selectLayout(newState).sections).toEqual([]);
            expect(selectDashboardTitle(newState)).not.toEqual(TestTitle);
            expect(selectFilterContextAttributeFilters(newState)).toEqual([]);
        });

        it("should emit correct events", async () => {
            await Tester.dispatchAndWaitFor(resetDashboard(TestCorrelation), "GDC.DASH/EVT.RESET");

            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });
    });

    describe("for an existing dashboard", () => {
        let Tester: DashboardTester;
        // each test starts with a new dashboard
        beforeEach(
            preloadedTesterFactory(
                (tester) => {
                    Tester = tester;

                    return testDashboardModifications(tester);
                },
                SimpleDashboardIdentifier,
                {
                    backendConfig: {
                        useRefType: "id",
                    },
                },
            ),
        );

        it("should reset to last persisted state", async () => {
            const event: DashboardWasReset = await Tester.dispatchAndWaitFor(
                resetDashboard(),
                "GDC.DASH/EVT.RESET",
            );
            expect(event.payload.dashboard).toBeDefined();

            const newState = Tester.state();
            expect(selectLayout(newState).sections).toEqual(SimpleDashboardLayout.sections);
            expect(selectDashboardTitle(newState)).not.toEqual(TestTitle);
            expect(selectFilterContextDefinition(newState).filters).toEqual(
                SimpleDashboardFilterContext.filters,
            );
        });

        it("should emit correct events", async () => {
            await Tester.dispatchAndWaitFor(resetDashboard(TestCorrelation), "GDC.DASH/EVT.RESET");

            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });
    });
});
