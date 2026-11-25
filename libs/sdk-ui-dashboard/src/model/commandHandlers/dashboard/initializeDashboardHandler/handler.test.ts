// (C) 2021-2026 GoodData Corporation

// @vitest-environment node

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { NotSupported } from "@gooddata/sdk-backend-spi";
import { type FilterContextItem, type IDashboard, type IFilterContext, idRef } from "@gooddata/sdk-model";

import { ABSOLUTE_GRANULARITY_DATE_FILTER_NOT_SUPPORTED } from "../../../../_staging/dashboard/absoluteGranularityDateFilters.js";
import { createDefaultFilterContext } from "../../../../_staging/dashboard/defaultFilterContext.js";
import {
    absoluteForm,
    relativeForm,
} from "../../../../_staging/dateFilterConfig/dateFilterConfig.test.helpers.js";
import { defaultDateFilterConfig } from "../../../../_staging/dateFilterConfig/defaultConfig.js";
import { deriveAbsoluteFormGranularitiesFromRelativeForm } from "../../../../_staging/dateFilterConfig/merge.js";
import {
    EmptyDashboardIdentifier,
    EmptyDashboardWithReferences,
    TestCorrelation,
} from "../../../../tests/Dashboard.test.helpers.js";
import { SimpleDashboardIdentifier } from "../../../../tests/SimpleDashboard.test.helpers.js";
import { initializeDashboard } from "../../../commands/dashboard.js";
import { DashboardTester, preloadedTesterFactory } from "../../../DashboardTester.js";
import { type DashboardInitialized } from "../../../events/dashboard.js";
import { type IDashboardCommandFailed } from "../../../events/general.js";
import {
    selectCatalogDateRangeParameters,
    selectCatalogDateRangeParametersStatus,
    selectCatalogParameters,
    selectCatalogParametersStatus,
} from "../../../store/catalog/catalogSelectors.js";
import { selectConfig } from "../../../store/config/configSelectors.js";
import {
    selectEnablePersistentFiltersAcrossTabs,
    selectPersistedDashboard,
} from "../../../store/meta/metaSelectors.js";
import { selectPermissions } from "../../../store/permissions/permissionsSelectors.js";
import { selectEffectiveDateFilterConfig } from "../../../store/tabs/dateFilterConfig/dateFilterConfigSelectors.js";
import {
    selectAttributeFilterDisplayForms,
    selectFilterContextDefinition,
    selectFilterContextIdentity,
} from "../../../store/tabs/filterContext/filterContextSelectors.js";
import { selectLayout } from "../../../store/tabs/layout/layoutSelectors.js";
import { PivotTableWithDateFilter } from "../../../tests/Insights.test.helpers.js";
import { type PrivateDashboardContext } from "../../../types/commonTypes.js";
import { EmptyDashboardLayout } from "../../dashboard/common/dashboardInitialize.js";

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

    describe("absolute date filter with granularity", () => {
        const granularityDateFilter: FilterContextItem = {
            dashboardAbsoluteGranularityDateFilter: {
                granularity: "GDC.time.month",
                from: "2026-01",
                to: "2026-03",
            },
        };
        const filterContextWithGranularityDateFilter = {
            ...dashboardWithDefaults.filterContext,
            filters: [...dashboardWithDefaults.filterContext!.filters, granularityDateFilter],
        } as IFilterContext;

        it.each<[string, IDashboard]>([
            [
                "its filter context",
                { ...dashboardWithDefaults, filterContext: filterContextWithGranularityDateFilter },
            ],
            [
                "the filter context of a tab",
                {
                    ...dashboardWithDefaults,
                    tabs: [
                        {
                            localIdentifier: "tab-A",
                            title: "Tab A",
                            layout: EmptyDashboardLayout,
                            filterContext: filterContextWithGranularityDateFilter,
                        },
                    ],
                },
            ],
        ])("should fail to load a dashboard with the filter in %s", async (_desc, preloadedDashboard) => {
            const customizationFns: PrivateDashboardContext = { preloadedDashboard };
            const tester = DashboardTester.forRecording(EmptyDashboardIdentifier, { customizationFns });

            const event: IDashboardCommandFailed<any> = await tester.dispatchAndWaitFor(
                initializeDashboard(),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.error).toBeInstanceOf(NotSupported);
            expect(event.payload.error?.message).toBe(ABSOLUTE_GRANULARITY_DATE_FILTER_NOT_SUPPORTED);
        });

        it("should fail to initialize a new dashboard with the filter in the default filter overrides", async () => {
            const tester = DashboardTester.forNewDashboard(undefined, undefined, {
                overrideDefaultFilters: [granularityDateFilter],
            });

            const event: IDashboardCommandFailed<any> = await tester.dispatchAndWaitFor(
                initializeDashboard(),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.error).toBeInstanceOf(NotSupported);
            expect(event.payload.error?.message).toBe(ABSOLUTE_GRANULARITY_DATE_FILTER_NOT_SUPPORTED);
        });
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

        it("should leave AI mode disabled by default", () => {
            expect(selectConfig(Tester.state()).aiMode).toBeUndefined();
        });
    });

    describe("isWhiteLabeled config resolution", () => {
        it("should derive isWhiteLabeled=true from org WHITE_LABELING setting when not explicitly passed", async () => {
            let Tester: DashboardTester;
            await preloadedTesterFactory(
                (tester) => {
                    Tester = tester;
                },
                SimpleDashboardIdentifier,
                {
                    backendConfig: {
                        globalSettings: { whiteLabeling: { enabled: true } },
                    },
                },
            );

            const config = selectConfig(Tester!.state());
            expect(config.isWhiteLabeled).toBe(true);
        });

        it("should keep isWhiteLabeled=false when org WHITE_LABELING is disabled", async () => {
            let Tester: DashboardTester;
            await preloadedTesterFactory(
                (tester) => {
                    Tester = tester;
                },
                SimpleDashboardIdentifier,
                {
                    backendConfig: {
                        globalSettings: { whiteLabeling: { enabled: false } },
                    },
                },
            );

            const config = selectConfig(Tester!.state());
            expect(config.isWhiteLabeled).toBe(false);
        });

        it("should respect explicit config.isWhiteLabeled=false even when org WHITE_LABELING is enabled", async () => {
            let Tester: DashboardTester;
            await preloadedTesterFactory(
                (tester) => {
                    Tester = tester;
                },
                SimpleDashboardIdentifier,
                {
                    initCommand: initializeDashboard({ isWhiteLabeled: false }),
                    backendConfig: {
                        globalSettings: { whiteLabeling: { enabled: true } },
                    },
                },
            );

            const config = selectConfig(Tester!.state());
            expect(config.isWhiteLabeled).toBe(false);
        });
    });

    it.each(["active", "generating", "waiting", "building", null, undefined] as const)(
        "should preserve aiMode set to %s during initialization",
        async (aiMode) => {
            let tester: DashboardTester;
            await preloadedTesterFactory(
                (initializedTester) => {
                    tester = initializedTester;
                },
                undefined,
                { initCommand: initializeDashboard({ aiMode }) },
            );

            expect(selectConfig(tester!.state()).aiMode).toBe(aiMode);
        },
    );

    describe("persistent filters across tabs default for a new dashboard", () => {
        async function initNewDashboard(featureEnabled: boolean, withInitialContent: boolean) {
            let Tester: DashboardTester;
            await preloadedTesterFactory(
                (tester) => {
                    Tester = tester;
                },
                undefined,
                {
                    backendConfig: {
                        globalSettings: { enableDashboardPersistentFiltersAcrossTabs: featureEnabled },
                    },
                    newDashboardContextConfig: withInitialContent
                        ? { initialContent: [{ visualizationContent: PivotTableWithDateFilter }] }
                        : undefined,
                },
            );
            return Tester!;
        }

        it.each([
            ["without initial content", false],
            ["with initial content", true],
        ])(
            "should enable persistent filters across tabs %s when the feature is enabled",
            async (_, withInitialContent) => {
                const Tester = await initNewDashboard(true, withInitialContent);

                expect(selectEnablePersistentFiltersAcrossTabs(Tester.state())).toBe(true);
            },
        );

        it.each([
            ["without initial content", false],
            ["with initial content", true],
        ])(
            "should keep persistent filters across tabs off %s when the feature is disabled",
            async (_, withInitialContent) => {
                const Tester = await initNewDashboard(false, withInitialContent);

                expect(selectEnablePersistentFiltersAcrossTabs(Tester.state())).toBe(false);
            },
        );
    });

    describe("absolute date filter granularity derivation for a new dashboard", () => {
        const dateFilterConfig = {
            ref: idRef("newDashboardDateFilterConfig"),
            absoluteForm,
            relativeForm,
            selectedOption: absoluteForm.localIdentifier,
        };

        it("should derive absoluteForm.availableGranularities from relativeForm when the feature is enabled", async () => {
            let Tester: DashboardTester;
            await preloadedTesterFactory(
                (tester) => {
                    Tester = tester;
                },
                undefined,
                {
                    initCommand: initializeDashboard({ dateFilterConfig }),
                    backendConfig: {
                        globalSettings: { enableAbsoluteDateFilterGranularity: true },
                    },
                },
            );

            const effectiveDateFilterConfig = selectEffectiveDateFilterConfig(Tester!.state());

            expect(effectiveDateFilterConfig.absoluteForm).toEqual(
                deriveAbsoluteFormGranularitiesFromRelativeForm(dateFilterConfig, true).absoluteForm,
            );
        });

        it("should leave absoluteForm.availableGranularities untouched when the feature is disabled", async () => {
            let Tester: DashboardTester;
            await preloadedTesterFactory(
                (tester) => {
                    Tester = tester;
                },
                undefined,
                {
                    initCommand: initializeDashboard({ dateFilterConfig }),
                    backendConfig: {
                        globalSettings: { enableAbsoluteDateFilterGranularity: false },
                    },
                },
            );

            const effectiveDateFilterConfig = selectEffectiveDateFilterConfig(Tester!.state());

            expect(effectiveDateFilterConfig.absoluteForm).toEqual(absoluteForm);
        });
    });

    describe("catalog parameters", () => {
        // the recorded backend does not support the parameters query, so loading them fails
        it.each([
            ["an existing dashboard", false, false, "gated-off", "gated-off", SimpleDashboardIdentifier],
            ["an existing dashboard", true, false, "failed", "gated-off", SimpleDashboardIdentifier],
            ["an existing dashboard", false, true, "gated-off", "failed", SimpleDashboardIdentifier],
            ["an existing dashboard", true, true, "failed", "failed", SimpleDashboardIdentifier],
            ["a new dashboard", false, false, "gated-off", "gated-off", undefined],
            ["a new dashboard", true, false, "failed", "gated-off", undefined],
            ["a new dashboard", false, true, "gated-off", "failed", undefined],
            ["a new dashboard", true, true, "failed", "failed", undefined],
        ] as const)(
            "should store the parameters of %s with enableParameters=%s and enableDateRangeParameters=%s as %s and %s with empty lists",
            async (
                _,
                enableParameters,
                enableDateRangeParameters,
                expectedStatus,
                expectedDateRangeStatus,
                identifier,
            ) => {
                let Tester: DashboardTester;
                await preloadedTesterFactory(
                    (tester) => {
                        Tester = tester;
                    },
                    identifier,
                    { backendConfig: { globalSettings: { enableParameters, enableDateRangeParameters } } },
                );

                expect(selectCatalogParametersStatus(Tester!.state())).toBe(expectedStatus);
                expect(selectCatalogParameters(Tester!.state())).toEqual([]);
                expect(selectCatalogDateRangeParametersStatus(Tester!.state())).toBe(expectedDateRangeStatus);
                expect(selectCatalogDateRangeParameters(Tester!.state())).toEqual([]);
            },
        );
    });
});
