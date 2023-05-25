// (C) 2021-2022 GoodData Corporation
import { initializeDashboard } from "../../../../commands/index.js";
import { DashboardTester, preloadedTesterFactory } from "../../../../tests/DashboardTester.js";
import { DashboardInitialized } from "../../../../events/index.js";
import { selectConfig } from "../../../../store/config/configSelectors.js";
import { selectPermissions } from "../../../../store/permissions/permissionsSelectors.js";
import { EmptyDashboardIdentifier, TestCorrelation } from "../../../../tests/fixtures/Dashboard.fixtures.js";
import { selectLayout } from "../../../../store/layout/layoutSelectors.js";
import {
    selectAttributeFilterDisplayForms,
    selectFilterContextDefinition,
    selectFilterContextIdentity,
} from "../../../../store/filterContext/filterContextSelectors.js";
import { SimpleDashboardIdentifier } from "../../../../tests/fixtures/SimpleDashboard.fixtures.js";
import { selectPersistedDashboard } from "../../../../store/meta/metaSelectors.js";
import { describe, it, expect, beforeAll } from "vitest";

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

        beforeAll(async () => {
            await preloadedTesterFactory(
                (tester) => {
                    Tester = tester;
                },
                SimpleDashboardIdentifier,
                {
                    initCommand: initializeDashboard(undefined, undefined, TestCorrelation),
                },
            );
        });

        it("should resolve config props that can be obtained from backend", () => {
            const config = selectConfig(Tester.state());

            expect(config).toMatchSnapshot({
                dateFilterConfig: {
                    absoluteForm: {
                        from: expect.any(String),
                        to: expect.any(String),
                    },
                },
                settings: {},
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

        it("should resolve attribute filter display forms", () => {
            const displayForms = selectAttributeFilterDisplayForms(Tester.state());

            // no need for in-depth checking; just verify that the display forms are there
            // and there is expected number of them (equal to number of attr filters)
            expect(displayForms).not.toEqual([]);
            expect(displayForms.length).toBe(2);
        });

        it("should store the original persisted dashboard", () => {
            const persistedDashboard = selectPersistedDashboard(Tester.state());

            expect(persistedDashboard).toBeDefined();
        });
    });

    describe("for an empty dashboard", () => {
        let Tester: DashboardTester;

        beforeAll(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, EmptyDashboardIdentifier);
        });

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

        beforeAll(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            });
        });

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
