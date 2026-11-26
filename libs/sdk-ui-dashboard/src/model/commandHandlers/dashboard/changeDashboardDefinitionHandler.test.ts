// (C) 2026 GoodData Corporation

// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { type IDashboardReferences } from "@gooddata/sdk-backend-spi";
import {
    type IDashboard,
    type IDashboardAbsoluteGranularityDateFilter,
    idRef,
    newDashboardParameterizedDateFilter,
} from "@gooddata/sdk-model";

import { ABSOLUTE_GRANULARITY_DATE_FILTER_WITH_DATA_SET_NOT_SUPPORTED } from "../../../_staging/dashboard/absoluteGranularityDateFilters.js";
import { TestCorrelation } from "../../../tests/Dashboard.test.helpers.js";
import {
    SimpleDashboardFilterContext,
    SimpleDashboardIdentifier,
    SimpleDashboardLayout,
} from "../../../tests/SimpleDashboard.test.helpers.js";
import { changeDashboardDefinition, initializeDashboard } from "../../commands/dashboard.js";
import { type DashboardTester, preloadedTesterFactory } from "../../DashboardTester.js";
import { type IDashboardDefinitionChanged } from "../../events/dashboard.js";
import { type IDashboardCommandFailed, isDashboardCommandFailed } from "../../events/general.js";
import {
    selectDashboardDescription,
    selectDashboardDescriptor,
    selectDashboardTitle,
    selectEnablePersistentFiltersAcrossTabs,
    selectPersistedDashboard,
} from "../../store/meta/metaSelectors.js";
import { selectEffectiveDateFilterConfig } from "../../store/tabs/dateFilterConfig/dateFilterConfigSelectors.js";
import {
    selectFilterContextAttributeFilters,
    selectFilterContextDateFilterOfAnyType,
} from "../../store/tabs/filterContext/filterContextSelectors.js";
import { selectLayout } from "../../store/tabs/layout/layoutSelectors.js";
import { selectUnavailableObjects } from "../../store/unavailableObjects/unavailableObjectsSelectors.js";

const NewDashboardTitle = "AI Generated Dashboard";

const UpdatedDashboardDefinition: IDashboard = {
    type: "IDashboard",
    ref: { identifier: "ai-dash-1" },
    identifier: "ai-dash-1",
    uri: "/gdc/md/workspace/obj/ai-dash-1",
    title: NewDashboardTitle,
    description: "New AI Dashboard Description",
    created: "2026-01-01",
    updated: "2026-01-01",
    shareStatus: "private",
    layout: SimpleDashboardLayout,
    filterContext: SimpleDashboardFilterContext,
    plugins: [],
    disableCrossFiltering: true,
};

describe("change dashboard definition handler", () => {
    describe("for an existing dashboard", () => {
        let Tester: DashboardTester;

        beforeEach(async () => {
            await preloadedTesterFactory(
                (tester) => {
                    Tester = tester;
                    return Promise.resolve();
                },
                SimpleDashboardIdentifier,
                {
                    initCommand: initializeDashboard({
                        settings: {
                            enableImmediateAttributeFilterDisplayAsLabelMigration: true,
                            enableDashboardPartialRendering: true,
                        },
                    }),
                    backendConfig: {
                        useRefType: "id",
                    },
                },
            );
        });

        it("should update dashboard definition in place", async () => {
            const event: IDashboardDefinitionChanged = await Tester.dispatchAndWaitFor(
                changeDashboardDefinition(UpdatedDashboardDefinition),
                "GDC.DASH/EVT.DEFINITION_CHANGED",
            );
            expect(event.payload.dashboard).toBeDefined();
            expect(event.payload.dashboard.title).toEqual(NewDashboardTitle);

            const newState = Tester.state();
            expect(selectDashboardTitle(newState)).toEqual(NewDashboardTitle);
            expect(selectLayout(newState).sections).toEqual(SimpleDashboardLayout.sections);
        });

        it("should reject a definition with an absolute date filter with granularity for a date dataset", async () => {
            const titleBefore = selectDashboardTitle(Tester.state());

            const event: IDashboardCommandFailed<any> = await Tester.dispatchAndWaitFor(
                changeDashboardDefinition({
                    ...UpdatedDashboardDefinition,
                    filterContext: {
                        ...SimpleDashboardFilterContext,
                        filters: [
                            ...SimpleDashboardFilterContext.filters,
                            {
                                dashboardAbsoluteGranularityDateFilter: {
                                    granularity: "GDC.time.month",
                                    from: "2026-01",
                                    to: "2026-03",
                                    dataSet: ReferenceMd.DateDatasets.Closed.ref,
                                },
                            },
                        ],
                    },
                }),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.payload.message).toEqual(
                ABSOLUTE_GRANULARITY_DATE_FILTER_WITH_DATA_SET_NOT_SUPPORTED,
            );
            expect(selectDashboardTitle(Tester.state())).toEqual(titleBefore);
        });

        it("should accept a definition with a common absolute date filter with granularity", async () => {
            const commonFilter: IDashboardAbsoluteGranularityDateFilter = {
                dashboardAbsoluteGranularityDateFilter: {
                    granularity: "GDC.time.month",
                    from: "2026-01",
                    to: "2026-03",
                    localIdentifier: "common_date",
                },
            };

            await Tester.dispatchAndWaitFor(
                changeDashboardDefinition({
                    ...UpdatedDashboardDefinition,
                    filterContext: {
                        ...SimpleDashboardFilterContext,
                        filters: [commonFilter, ...SimpleDashboardFilterContext.filters],
                    },
                }),
                "GDC.DASH/EVT.DEFINITION_CHANGED",
            );

            expect(selectFilterContextDateFilterOfAnyType(Tester.state())).toEqual(commonFilter);
        });

        it("should reject a definition with a parameterized date filter", async () => {
            const titleBefore = selectDashboardTitle(Tester.state());

            const event: unknown = await Tester.dispatchAndWaitFor(
                changeDashboardDefinition({
                    ...UpdatedDashboardDefinition,
                    filterContext: {
                        ...SimpleDashboardFilterContext,
                        filters: [
                            ...SimpleDashboardFilterContext.filters,
                            newDashboardParameterizedDateFilter(idRef("period", "parameter")),
                        ],
                    },
                }),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(isDashboardCommandFailed(event) && event.payload.reason).toEqual("USER_ERROR");
            expect(selectDashboardTitle(Tester.state())).toEqual(titleBefore);
        });

        it("should apply incoming metadata to the working descriptor while preserving persisted dashboard baseline", async () => {
            await Tester.dispatchAndWaitFor(
                changeDashboardDefinition(UpdatedDashboardDefinition),
                "GDC.DASH/EVT.DEFINITION_CHANGED",
            );

            const newState = Tester.state();
            expect(selectDashboardDescription(newState)).toEqual("New AI Dashboard Description");
            expect(selectDashboardDescriptor(newState).disableCrossFiltering).toBe(true);
            expect(selectPersistedDashboard(newState)?.identifier).toEqual(SimpleDashboardIdentifier);
        });

        it("should recompute the effective date-filter configuration from incoming definition overrides", async () => {
            const definitionWithDateOverrides: IDashboard = {
                ...UpdatedDashboardDefinition,
                dateFilterConfig: {
                    filterName: "date",
                    mode: "active",
                    hideOptions: ["ALL_TIME"],
                },
            };

            await Tester.dispatchAndWaitFor(
                changeDashboardDefinition(definitionWithDateOverrides),
                "GDC.DASH/EVT.DEFINITION_CHANGED",
            );

            const newState = Tester.state();
            const effectiveDateFilterConfig = selectEffectiveDateFilterConfig(newState);
            expect(effectiveDateFilterConfig.allTime?.visible).toBe(false);
        });

        it("should preserve incoming attribute-filter replacements", async () => {
            const existingFilters = selectFilterContextAttributeFilters(Tester.state());
            const firstFilter = existingFilters[0];
            expect(firstFilter).toBeDefined();

            const replacementDisplayForm = ReferenceMd.Product.Name.attribute.displayForm;
            const updatedFilters = [
                {
                    attributeFilter: {
                        ...firstFilter.attributeFilter,
                        displayForm: replacementDisplayForm,
                    },
                },
            ];

            const definitionWithReplacedFilter: IDashboard = {
                ...UpdatedDashboardDefinition,
                filterContext: {
                    ...SimpleDashboardFilterContext,
                    filters: updatedFilters,
                },
            };

            await Tester.dispatchAndWaitFor(
                changeDashboardDefinition(definitionWithReplacedFilter),
                "GDC.DASH/EVT.DEFINITION_CHANGED",
            );

            const newState = Tester.state();
            const newFilters = selectFilterContextAttributeFilters(newState);
            expect(newFilters[0].attributeFilter.displayForm).toEqual(replacementDisplayForm);
        });

        it("should support repeated filter definition updates without reverting to previous attribute filter", async () => {
            const initialFilters = selectFilterContextAttributeFilters(Tester.state());
            const departmentDisplayForm = initialFilters[0].attributeFilter.displayForm;
            const productDisplayForm = ReferenceMd.Product.Name.attribute.displayForm;
            const regionDisplayForm = ReferenceMd.Region.Default.attribute.displayForm;

            // 1st update: Department -> Product
            const updateToProduct: IDashboard = {
                ...UpdatedDashboardDefinition,
                filterContext: {
                    ...SimpleDashboardFilterContext,
                    filters: [
                        {
                            attributeFilter: {
                                ...initialFilters[0].attributeFilter,
                                displayForm: productDisplayForm,
                            },
                        },
                    ],
                },
            };
            await Tester.dispatchAndWaitFor(
                changeDashboardDefinition(updateToProduct),
                "GDC.DASH/EVT.DEFINITION_CHANGED",
            );
            expect(
                selectFilterContextAttributeFilters(Tester.state())[0].attributeFilter.displayForm,
            ).toEqual(productDisplayForm);

            // 2nd update: Product -> Department (repeated update should NOT revert to Product)
            const updateToDepartment: IDashboard = {
                ...UpdatedDashboardDefinition,
                filterContext: {
                    ...SimpleDashboardFilterContext,
                    filters: [
                        {
                            attributeFilter: {
                                ...initialFilters[0].attributeFilter,
                                displayForm: departmentDisplayForm,
                            },
                        },
                    ],
                },
            };
            await Tester.dispatchAndWaitFor(
                changeDashboardDefinition(updateToDepartment),
                "GDC.DASH/EVT.DEFINITION_CHANGED",
            );
            expect(
                selectFilterContextAttributeFilters(Tester.state())[0].attributeFilter.displayForm,
            ).toEqual(departmentDisplayForm);

            // 3rd update: Department -> Region
            const updateToRegion: IDashboard = {
                ...UpdatedDashboardDefinition,
                filterContext: {
                    ...SimpleDashboardFilterContext,
                    filters: [
                        {
                            attributeFilter: {
                                ...initialFilters[0].attributeFilter,
                                displayForm: regionDisplayForm,
                            },
                        },
                    ],
                },
            };
            await Tester.dispatchAndWaitFor(
                changeDashboardDefinition(updateToRegion),
                "GDC.DASH/EVT.DEFINITION_CHANGED",
            );
            expect(
                selectFilterContextAttributeFilters(Tester.state())[0].attributeFilter.displayForm,
            ).toEqual(regionDisplayForm);
        });

        it("should handle unavailable filters correctly during definition changes", async () => {
            const unavailableDisplayFormRef = { identifier: "forbidden_df_id" };
            const definitionWithForbiddenFilter: IDashboard = {
                ...UpdatedDashboardDefinition,
                filterContext: {
                    ...SimpleDashboardFilterContext,
                    filters: [
                        {
                            attributeFilter: {
                                localIdentifier: "f_forbidden",
                                displayForm: unavailableDisplayFormRef,
                                negativeSelection: true,
                                attributeElements: { values: [] },
                            },
                        },
                    ],
                },
            };

            const referencesWithUnavailable: Partial<IDashboardReferences> = {
                insights: [],
                unavailable: [
                    {
                        ref: unavailableDisplayFormRef,
                        type: "displayForm",
                        reason: "forbidden",
                    },
                ],
            };

            // Should succeed without "Unable to resolve display forms" error
            await Tester.dispatchAndWaitFor(
                changeDashboardDefinition(definitionWithForbiddenFilter, referencesWithUnavailable),
                "GDC.DASH/EVT.DEFINITION_CHANGED",
            );

            const stateWithUnavailable = Tester.state();
            expect(selectUnavailableObjects(stateWithUnavailable)).toEqual(
                referencesWithUnavailable.unavailable,
            );

            // Subsequent update where filter is replaced and unavailable objects are cleared
            await Tester.dispatchAndWaitFor(
                changeDashboardDefinition(UpdatedDashboardDefinition, { insights: [], unavailable: [] }),
                "GDC.DASH/EVT.DEFINITION_CHANGED",
            );

            const stateCleared = Tester.state();
            expect(selectUnavailableObjects(stateCleared)).toEqual([]);
        });

        it("should preserve newly forbidden filters when backend allows inconsistent relations", async () => {
            const originalCapabilities = Tester.ctx.backend.capabilities;
            Object.defineProperty(Tester.ctx.backend, "capabilities", {
                value: {
                    ...originalCapabilities,
                    allowsInconsistentRelations: true,
                },
                configurable: true,
            });

            try {
                const unavailableDisplayFormRef = { identifier: "forbidden_df_id" };
                const definitionWithForbiddenFilter: IDashboard = {
                    ...UpdatedDashboardDefinition,
                    dataSets: [
                        {
                            id: "date",
                            title: "Date",
                            type: "dataSet",
                            uri: "/date",
                            ref: { identifier: "date" },
                            description: "",
                            production: true,
                            unlisted: false,
                            deprecated: false,
                        },
                    ],
                    filterContext: {
                        ...SimpleDashboardFilterContext,
                        filters: [
                            {
                                attributeFilter: {
                                    localIdentifier: "f_forbidden",
                                    displayForm: unavailableDisplayFormRef,
                                    negativeSelection: true,
                                    attributeElements: { values: [] },
                                },
                            },
                        ],
                    },
                };

                const referencesWithUnavailable: Partial<IDashboardReferences> = {
                    insights: [],
                    unavailable: [
                        {
                            ref: unavailableDisplayFormRef,
                            type: "displayForm",
                            reason: "forbidden",
                        },
                    ],
                };

                await Tester.dispatchAndWaitFor(
                    changeDashboardDefinition(definitionWithForbiddenFilter, referencesWithUnavailable),
                    "GDC.DASH/EVT.DEFINITION_CHANGED",
                );

                const state = Tester.state();
                expect(selectUnavailableObjects(state)).toEqual(referencesWithUnavailable.unavailable);
                const filters = selectFilterContextAttributeFilters(state);
                expect(filters).toHaveLength(1);
                expect(filters[0].attributeFilter.localIdentifier).toEqual("f_forbidden");
            } finally {
                Object.defineProperty(Tester.ctx.backend, "capabilities", {
                    value: originalCapabilities,
                    configurable: true,
                });
            }
        });

        it("should retain existing unavailable objects and filters if definition update fails", async () => {
            const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

            try {
                const unavailableDisplayFormRef = { identifier: "forbidden_df_id" };
                const definitionWithForbiddenFilter: IDashboard = {
                    ...UpdatedDashboardDefinition,
                    filterContext: {
                        ...SimpleDashboardFilterContext,
                        filters: [
                            {
                                attributeFilter: {
                                    localIdentifier: "f_forbidden",
                                    displayForm: unavailableDisplayFormRef,
                                    negativeSelection: true,
                                    attributeElements: { values: [] },
                                },
                            },
                        ],
                    },
                };

                const referencesWithUnavailable: Partial<IDashboardReferences> = {
                    insights: [],
                    unavailable: [
                        {
                            ref: unavailableDisplayFormRef,
                            type: "displayForm",
                            reason: "forbidden",
                        },
                    ],
                };

                // Start with a forbidden filter
                await Tester.dispatchAndWaitFor(
                    changeDashboardDefinition(definitionWithForbiddenFilter, referencesWithUnavailable),
                    "GDC.DASH/EVT.DEFINITION_CHANGED",
                );

                expect(selectUnavailableObjects(Tester.state())).toEqual(
                    referencesWithUnavailable.unavailable,
                );

                // Submit a definition containing an unresolvable label (not marked unavailable)
                const unresolvableDisplayFormRef = { identifier: "non_existent_unresolvable_df" };
                const failingDefinition: IDashboard = {
                    ...UpdatedDashboardDefinition,
                    filterContext: {
                        ...SimpleDashboardFilterContext,
                        filters: [
                            {
                                attributeFilter: {
                                    localIdentifier: "f_unresolvable",
                                    displayForm: unresolvableDisplayFormRef,
                                    negativeSelection: true,
                                    attributeElements: { values: [] },
                                },
                            },
                        ],
                    },
                };

                // Command should fail because display form cannot be resolved
                await expect(
                    Tester.dispatchAndWaitFor(
                        changeDashboardDefinition(failingDefinition),
                        "GDC.DASH/EVT.DEFINITION_CHANGED",
                    ),
                ).rejects.toThrow();

                // Original unavailable objects and forbidden filter must remain intact
                expect(selectUnavailableObjects(Tester.state())).toEqual(
                    referencesWithUnavailable.unavailable,
                );
                expect(
                    selectFilterContextAttributeFilters(Tester.state())[0].attributeFilter.localIdentifier,
                ).toEqual("f_forbidden");
            } finally {
                consoleErrorSpy.mockRestore();
            }
        });

        it("should emit correct events", async () => {
            const event: IDashboardDefinitionChanged = await Tester.dispatchAndWaitFor(
                changeDashboardDefinition(UpdatedDashboardDefinition, [], TestCorrelation),
                "GDC.DASH/EVT.DEFINITION_CHANGED",
            );

            expect(event.correlationId).toEqual(TestCorrelation);
            expect(event.payload.dashboard.identifier).toEqual("ai-dash-1");
            expect(event.payload.references).toBeDefined();
            expect(event.payload.insights.length).toBeGreaterThan(0);
        });

        it("should accept partial references and apply them to store", async () => {
            const references: Partial<IDashboardReferences> = {
                insights: [],
                unavailable: [
                    {
                        ref: { identifier: "unavail-1" },
                        type: "insight",
                        reason: "notFound",
                    },
                ],
            };

            const event: IDashboardDefinitionChanged = await Tester.dispatchAndWaitFor(
                changeDashboardDefinition(UpdatedDashboardDefinition, references, TestCorrelation),
                "GDC.DASH/EVT.DEFINITION_CHANGED",
            );

            expect(event.payload.references?.unavailable).toEqual(references.unavailable);

            const newState = Tester.state();
            expect(selectUnavailableObjects(newState)).toEqual(references.unavailable);
        });
    });

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
                        globalSettings: { enableDashboardPersistentFiltersAcrossTabs: true },
                    },
                },
            );
        });

        it("should keep persistent filters across tabs enabled when the definition does not set it", async () => {
            await Tester.dispatchAndWaitFor(
                changeDashboardDefinition(UpdatedDashboardDefinition),
                "GDC.DASH/EVT.DEFINITION_CHANGED",
            );

            expect(selectEnablePersistentFiltersAcrossTabs(Tester.state())).toBe(true);
        });

        it("should keep persistent filters across tabs enabled across repeated definition changes before saving", async () => {
            await Tester.dispatchAndWaitFor(
                changeDashboardDefinition(UpdatedDashboardDefinition),
                "GDC.DASH/EVT.DEFINITION_CHANGED",
            );
            await Tester.dispatchAndWaitFor(
                changeDashboardDefinition({ ...UpdatedDashboardDefinition, title: "Refined" }),
                "GDC.DASH/EVT.DEFINITION_CHANGED",
            );

            expect(selectEnablePersistentFiltersAcrossTabs(Tester.state())).toBe(true);
        });

        it("should apply persistent filters across tabs from the definition when it is set", async () => {
            await Tester.dispatchAndWaitFor(
                changeDashboardDefinition({
                    ...UpdatedDashboardDefinition,
                    enablePersistentFiltersAcrossTabs: false,
                }),
                "GDC.DASH/EVT.DEFINITION_CHANGED",
            );

            expect(selectEnablePersistentFiltersAcrossTabs(Tester.state())).toBe(false);
        });
    });
});
