// (C) 2021-2025 GoodData Corporation

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { type IDashboard, idRef } from "@gooddata/sdk-model";

import { createDefaultFilterContext } from "../../../../../_staging/dashboard/defaultFilterContext.js";
import { defaultDateFilterConfig } from "../../../../../_staging/dateFilterConfig/defaultConfig.js";
import { initializeDashboard } from "../../../../commands/index.js";
import { type DashboardInitialized } from "../../../../events/index.js";
import { selectConfig } from "../../../../store/config/configSelectors.js";
import { selectPersistedDashboard } from "../../../../store/meta/metaSelectors.js";
import { selectPermissions } from "../../../../store/permissions/permissionsSelectors.js";
import {
    selectAttributeFilterDisplayForms,
    selectFilterContextDefinition,
    selectFilterContextIdentity,
} from "../../../../store/tabs/filterContext/filterContextSelectors.js";
import { selectLayout } from "../../../../store/tabs/layout/layoutSelectors.js";
import { DashboardTester, preloadedTesterFactory } from "../../../../tests/DashboardTester.js";
import {
    EmptyDashboardIdentifier,
    EmptyDashboardWithReferences,
    TestCorrelation,
} from "../../../../tests/fixtures/Dashboard.fixtures.js";
import { SimpleDashboardIdentifier } from "../../../../tests/fixtures/SimpleDashboard.fixtures.js";
import { type PrivateDashboardContext } from "../../../../types/commonTypes.js";
import { EmptyDashboardLayout } from "../../../dashboard/common/dashboardInitialize.js";

describe("initialize dashboard handler", () => {
    const dashboardWithDefaults: IDashboard = {
        ...EmptyDashboardWithReferences.dashboard,
        ref: idRef(EmptyDashboardIdentifier),
        identifier: EmptyDashboardIdentifier,
        layout: EmptyDashboardLayout,
        filterContext: createDefaultFilterContext(
            defaultDateFilterConfig,
            true,
        ) as IDashboard["filterContext"],
    };

    const customizationFnsWithPreload: PrivateDashboardContext = {
        preloadedDashboard: dashboardWithDefaults,
    };

    it("should emit event when dashboard successfully loaded", async () => {
        const tester = DashboardTester.forRecording(EmptyDashboardIdentifier, {
            customizationFns: customizationFnsWithPreload,
        });

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
            customizationFns: customizationFnsWithPreload,
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

            expect(config).toMatchSnapshot();
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
        let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

        beforeAll(async () => {
            // we expect the errors here as the tests are in fact checking that
            // the missing layout or filtercontext are added
            consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, EmptyDashboardIdentifier);
        });

        afterAll(() => {
            consoleErrorSpy.mockRestore();
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
