// (C) 2021-2026 GoodData Corporation

// @vitest-environment node

import { beforeEach, describe, expect, it } from "vitest";

import {
    type DateFilterGranularity,
    type IDashboardAbsoluteGranularityDateFilter,
    idRef,
    newDashboardParameterizedDateFilter,
    newRelativeDashboardDateFilter,
} from "@gooddata/sdk-model";

import { PARAMETERIZED_DATE_FILTER_NOT_SUPPORTED } from "../../../../_staging/dashboard/parameterizedDateFilters.js";
import { TestCorrelation } from "../../../../tests/Dashboard.test.helpers.js";
import { SimpleDashboardIdentifier } from "../../../../tests/SimpleDashboard.test.helpers.js";
import { initializeDashboard } from "../../../commands/dashboard.js";
import {
    changeDateFilterSelection,
    changeDateFilterSelectionOfAnyType,
    clearDateFilterSelection,
} from "../../../commands/filters.js";
import { type DashboardTester, preloadedTesterFactory } from "../../../DashboardTester.js";
import { type DashboardDateFilterOfAnyTypeSelectionChanged } from "../../../events/filters.js";
import { type IDashboardCommandFailed } from "../../../events/general.js";
import { selectConfig } from "../../../store/config/configSelectors.js";
import { configActions } from "../../../store/config/index.js";
import { metaActions } from "../../../store/meta/index.js";
import {
    selectDateFilterConfigOverrides,
    selectEffectiveDateFilterConfig,
} from "../../../store/tabs/dateFilterConfig/dateFilterConfigSelectors.js";
import {
    selectFilterContextDateFilter,
    selectFilterContextDateFilterOfAnyType,
    selectFilterContextDateFilterOfAnyTypeByDataSet,
} from "../../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../../store/tabs/index.js";

describe("changeDateFilterSelectionHandler", () => {
    let Tester: DashboardTester;

    const weekFilter: IDashboardAbsoluteGranularityDateFilter = {
        dashboardAbsoluteGranularityDateFilter: {
            granularity: "GDC.time.week",
            from: "2026-05",
            to: "2026-08",
        },
    };

    const setAbsoluteFormGranularities = (availableGranularities: DateFilterGranularity[]) => {
        const effectiveDateFilterConfig = selectEffectiveDateFilterConfig(Tester.state());
        Tester.dispatch(
            tabsActions.setDateFilterConfig({
                dateFilterConfig: selectDateFilterConfigOverrides(Tester.state()),
                effectiveDateFilterConfig: {
                    ...effectiveDateFilterConfig,
                    absoluteForm: { ...effectiveDateFilterConfig.absoluteForm!, availableGranularities },
                },
                isUsingDashboardOverrides: false,
            }),
        );
    };

    const expectRejected = async (filter: IDashboardAbsoluteGranularityDateFilter) => {
        const before = selectFilterContextDateFilterOfAnyType(Tester.state());

        const event: IDashboardCommandFailed<any> = await Tester.dispatchAndWaitFor(
            changeDateFilterSelectionOfAnyType(filter),
            "GDC.DASH/EVT.COMMAND.FAILED",
        );

        expect(event.payload.reason).toBe("USER_ERROR");
        expect(selectFilterContextDateFilterOfAnyType(Tester.state())).toEqual(before);
    };

    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier);
    });

    it("should emit the appropriate events for changed date filter", async () => {
        Tester.dispatch(
            changeDateFilterSelection("relative", "GDC.time.month", -3, 0, "someLocalId", TestCorrelation),
        );
        await Tester.waitFor("GDC.DASH/EVT.FILTER_CONTEXT.CHANGED");

        expect(Tester.emittedEventsDigest()).toMatchSnapshot();
    });

    it("should set the date filter in the state when a date filter is changed", async () => {
        Tester.dispatch(
            changeDateFilterSelection(
                "relative",
                "GDC.time.month",
                -3,
                0,
                "dateFilterOptionLocalIdentifier",
                TestCorrelation,
                undefined,
                undefined,
                "dateFilterLocalIdentifier",
            ),
        );

        await Tester.waitFor("GDC.DASH/EVT.FILTER_CONTEXT.CHANGED");

        expect(selectFilterContextDateFilter(Tester.state())).toMatchSnapshot();
    });

    it("should set the date filter in the state when a date filter is added", async () => {
        Tester.dispatch(clearDateFilterSelection());
        await Tester.waitFor("GDC.DASH/EVT.FILTER_CONTEXT.CHANGED");

        Tester.dispatch(
            changeDateFilterSelection(
                "relative",
                "GDC.time.month",
                -3,
                0,
                "dateFilterOptionLocalIdentifier",
                TestCorrelation,
                undefined,
                undefined,
                "dateFilterLocalIdentifier",
            ),
        );
        await Tester.waitFor("GDC.DASH/EVT.FILTER_CONTEXT.CHANGED");

        expect(selectFilterContextDateFilter(Tester.state())).toMatchSnapshot();
    });

    it("should clear date filter in the state", async () => {
        Tester.dispatch(clearDateFilterSelection());

        await Tester.waitFor("GDC.DASH/EVT.FILTER_CONTEXT.CHANGED");

        expect(selectFilterContextDateFilter(Tester.state())).toMatchSnapshot();
    });

    it("should clear the date filter in the state when a date filter is cleared", async () => {
        Tester.dispatch(changeDateFilterSelection("relative", "GDC.time.month", -3, 0));
        await Tester.waitFor("GDC.DASH/EVT.FILTER_CONTEXT.CHANGED");

        Tester.dispatch(clearDateFilterSelection());
        await Tester.waitFor("GDC.DASH/EVT.FILTER_CONTEXT.CHANGED");

        expect(selectFilterContextDateFilter(Tester.state())).toBeUndefined();
    });

    describe("when filters persist across tabs", () => {
        const filterContextChangedCount = () =>
            Tester.emittedEventsDigest().filter(
                (event) => event.type === "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
            ).length;

        beforeEach(() => {
            const config = selectConfig(Tester.state());
            Tester.dispatch(
                configActions.setConfig({
                    ...config,
                    settings: { ...config.settings, enableDashboardPersistentFiltersAcrossTabs: true },
                }),
            );
            Tester.dispatch(metaActions.setEnablePersistentFiltersAcrossTabs(true));
        });

        it("emits one filter context changed event for the changed source tab", async () => {
            await Tester.dispatchAndWaitFor(
                changeDateFilterSelection("relative", "GDC.time.month", -3, 0),
                "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
            );

            expect(filterContextChangedCount()).toBe(1);
        });

        it("emits a filter context changed event for a command that changes nothing", async () => {
            await Tester.dispatchAndWaitFor(
                changeDateFilterSelection("relative", "GDC.time.month", -3, 0),
                "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
            );
            Tester.resetMonitors();

            await Tester.dispatchAndWaitFor(
                changeDateFilterSelection("relative", "GDC.time.month", -3, 0),
                "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
            );

            expect(filterContextChangedCount()).toBe(1);
        });
    });

    describe("with the absolute date filter granularity off", () => {
        it("rejects the new type", async () => {
            await expectRejected(weekFilter);
        });

        it("rejects the new type when the date filter config lists its granularity", async () => {
            setAbsoluteFormGranularities(["GDC.time.week_us", "GDC.time.month"]);

            await expectRejected(weekFilter);
        });
    });

    describe("for a date filter of any type", () => {
        const eventTypes = () => Tester.emittedEventsDigest().map((event) => event.type);

        beforeEach(async () => {
            await preloadedTesterFactory(
                (tester) => {
                    Tester = tester;
                },
                SimpleDashboardIdentifier,
                {
                    initCommand: initializeDashboard({
                        settings: { enableAbsoluteDateFilterGranularity: true },
                    }),
                },
            );
        });

        const setOldTypeWithLocalIdentifier = async () => {
            await Tester.dispatchAndWaitFor(
                changeDateFilterSelection(
                    "relative",
                    "GDC.time.month",
                    -3,
                    0,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    "dateLocalId",
                ),
                "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
            );
            Tester.resetMonitors();
        };

        it("sets the common date filter of the new type", async () => {
            await Tester.dispatchAndWaitFor(
                changeDateFilterSelectionOfAnyType(weekFilter, {
                    dateFilterOptionLocalId: "ABSOLUTE_FORM",
                    correlationId: TestCorrelation,
                }),
                "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
            );

            expect(selectFilterContextDateFilterOfAnyType(Tester.state())).toEqual(weekFilter);
            expect(selectFilterContextDateFilter(Tester.state())).toBeUndefined();
        });

        it("emits only the event of any type for the new type", async () => {
            await Tester.dispatchAndWaitFor(
                changeDateFilterSelectionOfAnyType(weekFilter, {
                    dateFilterOptionLocalId: "ABSOLUTE_FORM",
                    correlationId: TestCorrelation,
                }),
                "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
            );

            const event = Tester.emittedEvents().find(
                (e) => e.type === "GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER_OF_ANY_TYPE.SELECTION_CHANGED",
            ) as DashboardDateFilterOfAnyTypeSelectionChanged;
            expect(event.payload).toEqual({ filter: weekFilter, dateFilterOptionLocalId: "ABSOLUTE_FORM" });
            expect(event.correlationId).toBe(TestCorrelation);
            expect(eventTypes()).not.toContain("GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.SELECTION_CHANGED");
        });

        it("emits both events for the old type", async () => {
            await Tester.dispatchAndWaitFor(
                changeDateFilterSelectionOfAnyType(newRelativeDashboardDateFilter("GDC.time.year", -1, -1)),
                "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
            );

            expect(eventTypes()).toEqual(
                expect.arrayContaining([
                    "GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.SELECTION_CHANGED",
                    "GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER_OF_ANY_TYPE.SELECTION_CHANGED",
                ]),
            );
            expect(selectFilterContextDateFilter(Tester.state())?.dateFilter).toMatchObject({
                type: "relative",
                granularity: "GDC.time.year",
                from: -1,
                to: -1,
            });
        });

        describe("for a date dataset", () => {
            const dataSet = idRef("closed", "dataSet");
            const weekFilterWithDataSet: IDashboardAbsoluteGranularityDateFilter = {
                dashboardAbsoluteGranularityDateFilter: {
                    ...weekFilter.dashboardAbsoluteGranularityDateFilter,
                    dataSet,
                },
            };

            beforeEach(async () => {
                Tester.dispatch(tabsActions.addDateFilter({ index: -1, dateDataset: dataSet }));
                Tester.resetMonitors();
            });

            it("sets the date filter for the date dataset to the new type and keeps the common one", async () => {
                const commonBefore = selectFilterContextDateFilterOfAnyType(Tester.state());

                await Tester.dispatchAndWaitFor(
                    changeDateFilterSelectionOfAnyType(weekFilterWithDataSet, {
                        dateFilterOptionLocalId: "ABSOLUTE_FORM",
                    }),
                    "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
                );

                expect(selectFilterContextDateFilterOfAnyTypeByDataSet(dataSet)(Tester.state())).toEqual(
                    weekFilterWithDataSet,
                );
                expect(selectFilterContextDateFilterOfAnyType(Tester.state())).toEqual(commonBefore);
            });

            it("emits only the event of any type with the filter", async () => {
                await Tester.dispatchAndWaitFor(
                    changeDateFilterSelectionOfAnyType(weekFilterWithDataSet, {
                        dateFilterOptionLocalId: "ABSOLUTE_FORM",
                    }),
                    "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
                );

                const event = Tester.emittedEvents().find(
                    (e) => e.type === "GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER_OF_ANY_TYPE.SELECTION_CHANGED",
                ) as DashboardDateFilterOfAnyTypeSelectionChanged;
                expect(event.payload.filter).toEqual(weekFilterWithDataSet);
                expect(eventTypes()).not.toContain(
                    "GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.SELECTION_CHANGED",
                );
            });

            it("changes the new type back to the old type keeping the date dataset", async () => {
                await Tester.dispatchAndWaitFor(
                    changeDateFilterSelectionOfAnyType(weekFilterWithDataSet),
                    "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
                );
                await Tester.dispatchAndWaitFor(
                    changeDateFilterSelectionOfAnyType(
                        newRelativeDashboardDateFilter("GDC.time.year", -1, -1, dataSet),
                    ),
                    "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
                );

                expect(
                    selectFilterContextDateFilterOfAnyTypeByDataSet(dataSet)(Tester.state()),
                ).toMatchObject({
                    dateFilter: { type: "relative", granularity: "GDC.time.year", from: -1, to: -1, dataSet },
                });
            });
        });

        it("rejects the new type with a granularity the date filter config does not offer", async () => {
            setAbsoluteFormGranularities(["GDC.time.month"]);

            await expectRejected(weekFilter);
        });

        it("rejects a period", async () => {
            const before = selectFilterContextDateFilterOfAnyType(Tester.state());

            const event: IDashboardCommandFailed = await Tester.dispatchAndWaitFor(
                changeDateFilterSelectionOfAnyType(
                    newDashboardParameterizedDateFilter(idRef("fiscal_year", "parameter")),
                ),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.reason).toBe("USER_ERROR");
            expect(event.payload.message).toBe(PARAMETERIZED_DATE_FILTER_NOT_SUPPORTED);
            expect(selectFilterContextDateFilterOfAnyType(Tester.state())).toEqual(before);
        });

        it("keeps the local identifier and sets the empty value handling when the old type changes to the new type", async () => {
            await setOldTypeWithLocalIdentifier();

            await Tester.dispatchAndWaitFor(
                changeDateFilterSelectionOfAnyType({
                    dashboardAbsoluteGranularityDateFilter: {
                        ...weekFilter.dashboardAbsoluteGranularityDateFilter,
                        emptyValueHandling: "include",
                    },
                }),
                "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
            );

            expect(selectFilterContextDateFilterOfAnyType(Tester.state())).toEqual({
                dashboardAbsoluteGranularityDateFilter: {
                    ...weekFilter.dashboardAbsoluteGranularityDateFilter,
                    localIdentifier: "dateLocalId",
                    emptyValueHandling: "include",
                },
            });
        });

        it("keeps the local identifier and sets the empty value handling when the new type changes to the old type", async () => {
            await setOldTypeWithLocalIdentifier();
            await Tester.dispatchAndWaitFor(
                changeDateFilterSelectionOfAnyType(weekFilter),
                "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
            );

            await Tester.dispatchAndWaitFor(
                changeDateFilterSelection(
                    "relative",
                    "GDC.time.year",
                    -1,
                    -1,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    "exclude",
                ),
                "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
            );

            expect(selectFilterContextDateFilterOfAnyType(Tester.state())).toEqual({
                dateFilter: {
                    type: "relative",
                    granularity: "GDC.time.year",
                    from: -1,
                    to: -1,
                    localIdentifier: "dateLocalId",
                    emptyValueHandling: "exclude",
                },
            });
        });

        it("clears the new type to All time", async () => {
            await Tester.dispatchAndWaitFor(
                changeDateFilterSelectionOfAnyType(weekFilter),
                "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
            );

            await Tester.dispatchAndWaitFor(
                changeDateFilterSelectionOfAnyType(undefined),
                "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
            );

            expect(selectFilterContextDateFilterOfAnyType(Tester.state())).toBeUndefined();
        });
    });
});
