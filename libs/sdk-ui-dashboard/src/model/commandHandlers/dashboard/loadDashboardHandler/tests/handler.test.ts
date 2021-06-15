// (C) 2021 GoodData Corporation
import { loadDashboard } from "../../../../commands";
import { DashboardTester, preloadedTesterFactory } from "../../../../tests/DashboardTester";
import { DashboardLoaded } from "../../../../events";
import { selectConfig } from "../../../../state/config/configSelectors";
import { selectPermissions } from "../../../../state/permissions/permissionsSelectors";
import { EmptyDashboardIdentifier, SimpleDashboardIdentifier } from "../../../../tests/Dashboard.fixtures";
import { selectLayout } from "../../../../state/layout/layoutSelectors";
import { selectFilterContext } from "../../../../state/filterContext/filterContextSelectors";

describe("load dashboard handler", () => {
    it("should emit event when dashboard successfully loaded", async () => {
        const tester = DashboardTester.forRecording(EmptyDashboardIdentifier);

        tester.dispatch(loadDashboard());
        const event: DashboardLoaded = await tester.waitFor("GDC.DASH/EVT.LOADED");

        expect(event.type).toEqual("GDC.DASH/EVT.LOADED");
        expect(event.payload.dashboard.identifier).toEqual(EmptyDashboardIdentifier);
    });

    it("should emit events in correct order and carry-over correlationId", async () => {
        const tester = DashboardTester.forRecording(EmptyDashboardIdentifier);

        tester.dispatch(loadDashboard());
        await tester.waitFor("GDC.DASH/EVT.LOADED");

        expect(tester.emittedEventsDigest()).toMatchSnapshot();
    });

    describe("for any dashboard", () => {
        let Tester: DashboardTester;
        beforeAll(
            preloadedTesterFactory(
                (tester) => (Tester = tester),
                SimpleDashboardIdentifier,
                loadDashboard(undefined, undefined, "testCorrelation"),
            ),
        );

        it("should resolve config props that can be obtained from backend", () => {
            const config = selectConfig(Tester.state());

            expect(config).toMatchSnapshot({
                dateFilterConfig: {
                    absoluteForm: {
                        from: expect.any(String),
                        to: expect.any(String),
                    },
                },
            });
        });

        it("should resolve permissions if none provided", () => {
            const permissions = selectPermissions(Tester.state());

            expect(permissions).toMatchSnapshot();
        });
    });

    describe("for an empty dashboard", () => {
        let Tester: DashboardTester;
        beforeAll(preloadedTesterFactory((tester) => (Tester = tester), EmptyDashboardIdentifier));

        it("should add default layout for an empty dashboard", () => {
            const layout = selectLayout(Tester.state());

            expect(layout).toMatchSnapshot();
        });

        it("should add default filter context for an empty dashboard", () => {
            const filterContext = selectFilterContext(Tester.state());

            expect(filterContext).toMatchSnapshot();
        });
    });
});
