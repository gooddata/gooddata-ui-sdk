// (C) 2021 GoodData Corporation
import { initializeDashboard } from "../../../../commands";
import { DashboardTester, preloadedTesterFactory } from "../../../../tests/DashboardTester";
import { DashboardInitialized } from "../../../../events";
import { selectConfig } from "../../../../state/config/configSelectors";
import { selectPermissions } from "../../../../state/permissions/permissionsSelectors";
import { EmptyDashboardIdentifier, TestCorrelation } from "../../../../tests/fixtures/Dashboard.fixtures";
import { selectLayout } from "../../../../state/layout/layoutSelectors";
import {
    selectFilterContextDefinition,
    selectFilterContextIdentity,
} from "../../../../state/filterContext/filterContextSelectors";
import { SimpleDashboardIdentifier } from "../../../../tests/fixtures/SimpleDashboard.fixtures";
import { selectPersistedDashboard } from "../../../../state/meta/metaSelectors";

describe("initialize dashboard handler", () => {
    it("should emit event when dashboard successfully loaded", async () => {
        const tester = DashboardTester.forRecording(EmptyDashboardIdentifier);

        tester.dispatch(initializeDashboard());
        const event: DashboardInitialized = await tester.waitFor("GDC.DASH/EVT.INITIALIZED");

        expect(event.type).toEqual("GDC.DASH/EVT.INITIALIZED");
        expect(event.payload.dashboard).toBeDefined();
        expect(event.payload.dashboard!.identifier).toEqual(EmptyDashboardIdentifier);
    });

    it("should emit event when a new dashboard successfully initialized", async () => {
        const tester = DashboardTester.forNewDashboard();

        tester.dispatch(initializeDashboard());
        const event: DashboardInitialized = await tester.waitFor("GDC.DASH/EVT.INITIALIZED");

        expect(event.type).toEqual("GDC.DASH/EVT.INITIALIZED");
        expect(event.payload.dashboard).toBeUndefined();
    });

    it("should emit events in correct order and carry-over correlationId", async () => {
        const tester = DashboardTester.forRecording(EmptyDashboardIdentifier, {
            renderingWorkerConfig: {
                asyncRenderRequestedTimeout: 2000,
                asyncRenderResolvedTimeout: 2000,
                maxTimeout: 60000,
                correlationIdGenerator: () => "renderCorrelation",
            },
        });

        tester.dispatch(initializeDashboard());
        await tester.waitFor("GDC.DASH/EVT.INITIALIZED");

        expect(tester.emittedEventsDigest()).toMatchSnapshot();
    });

    describe("for any dashboard", () => {
        let Tester: DashboardTester;
        beforeAll(
            preloadedTesterFactory(
                (tester) => {
                    Tester = tester;
                },
                SimpleDashboardIdentifier,
                {
                    initCommand: initializeDashboard(undefined, undefined, TestCorrelation),
                },
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

        it("should store filter context identity", () => {
            const filterContextIdentity = selectFilterContextIdentity(Tester.state());

            expect(filterContextIdentity).toBeDefined();
        });

        it("should store the original persisted dashboard", () => {
            const persistedDashboard = selectPersistedDashboard(Tester.state());

            expect(persistedDashboard).toBeDefined();
        });
    });

    describe("for an empty dashboard", () => {
        let Tester: DashboardTester;
        beforeAll(
            preloadedTesterFactory((tester) => {
                Tester = tester;
            }, EmptyDashboardIdentifier),
        );

        it("should add default layout for an empty dashboard", () => {
            const layout = selectLayout(Tester.state());

            expect(layout).toMatchSnapshot();
        });

        it("should add default filter context for an empty dashboard", () => {
            const filterContext = selectFilterContextDefinition(Tester.state());

            expect(filterContext).toMatchSnapshot();
        });
    });

    describe("for a new dashboard", () => {
        let Tester: DashboardTester;
        beforeAll(
            preloadedTesterFactory((tester) => {
                Tester = tester;
            }),
        );

        it("should initialize new dashboard with default layout", () => {
            const layout = selectLayout(Tester.state());

            expect(layout).toMatchSnapshot();
        });

        it("should initialize new dashboard with default filter context", () => {
            const filterContext = selectFilterContextDefinition(Tester.state());

            expect(filterContext).toMatchSnapshot();
        });

        it("should have no filter context identity", () => {
            const filterContextIdentity = selectFilterContextIdentity(Tester.state());

            expect(filterContextIdentity).toBeUndefined();
        });

        it("should have no persisted dashboard", () => {
            const persistedDashboard = selectPersistedDashboard(Tester.state());

            expect(persistedDashboard).toBeUndefined();
        });
    });
});
