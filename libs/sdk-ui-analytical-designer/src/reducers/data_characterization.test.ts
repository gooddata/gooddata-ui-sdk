// (C) 2026 GoodData Corporation

import { type UnknownAction } from "redux";
import { describe, expect, it } from "vitest";

import { type IVisualizationClass, uriRef } from "@gooddata/sdk-model";

import {
    storeConfigurationPanelCollapsed,
    storeConfigurationPanelCollapsedByDragging,
} from "../actions/buckets_actions.js";
import {
    dateDatasetsUpdated,
    resetInsightUsageOnDashboards,
    setDateDatasetsDropdownLoaded,
    setDateDatasetsLoaded,
    setDateDatasetsMeta,
    setDateDatasetsUpdating,
    updateInsightUsageOnDashboards,
    updateItemCache,
} from "../actions/data_actions.js";
import { setVisualizationClasses } from "../actions/visualization_class_actions.js";
import { ActionTypeKeys } from "../constants/actions.js";
import { type IDateDatasetsMeta } from "../models/date_datasets_meta.js";
import { getItemCache } from "../selectors/item_cache_selector.js";
import { isDefaultVisualizationClass } from "../selectors/reset_button_selector.js";
import { DateDatasetsMetaService } from "../services/date_datasets_meta_service.js";
import { DateDatasetsService } from "../services/date_datasets_service.js";
import { getVisualizationClass, getVisualizationClasses } from "../services/visualization_class_service.js";
import {
    applicationCleared,
    buildApplicationResetCarrier,
    buildInsightContentResetCarrier,
    insightContentCleared,
    wholeApplicationReset,
} from "../store/app_context/application_reset_events.js";
import {
    isConfigurationPanelCollapsed,
    isConfigurationPanelCollapsedByDragging,
} from "../store/configuration_panel/configuration_panel_selectors.js";
import { getInsightUsageOnDashboardsSelector } from "../store/insight_usage/insight_usage_selectors.js";
import { routeChanged } from "../store/router/router_actions.js";
import { buildNextRoute, shouldResetOnNavigation } from "../store/router/router_helpers.js";
import { getRouteState } from "../store/router/router_selectors.js";
import { type IAppState } from "../store/types.js";
import { getVisualizationClassesState } from "../store/visualization_classes/visualization_classes_selectors.js";
import { createAnalyticalDashboard } from "../tests/constants.test.helpers.js";
import { privateDashboards, publicDashboards } from "../tests/dashboard.test.helpers.js";
import { getInitializedState } from "../tests/state.test.helpers.js";
import { type IDateDatasetAttribute } from "../typings/dataset_attribute.js";
import { type IDateDatasets } from "../typings/datasets.js";
import { type ICacheItem } from "../typings/state_objects.js";

import { rootReducer } from "./root_reducer.js";

/**
 * Characterization suite for the data domain: itemCache, dateDatasets(+Meta),
 * visualizationClass(es), insightUsageOnDashboards and the configuration panel.
 *
 * Every test drives the FULL root chain (rootReducer), so if one of these assertions has to move,
 * that is a deliberate, reviewed behavior change.
 */

type RootAction = UnknownAction;

const dispatch = (state: IAppState, action: RootAction): IAppState => rootReducer(state, action);

const dispatchAll = (state: IAppState, actions: RootAction[]): IAppState => actions.reduce(dispatch, state);

// the reset scopes are semantic EVENTS (store/app_context/application_reset_events.ts);
// these dispatch them the way production does — reset_sagas translates the triggers, the
// router saga computes the route pair and decides the whole-application reset
const applyApplicationCleared = (state: IAppState): IAppState =>
    dispatch(
        state,
        applicationCleared({
            reset: buildApplicationResetCarrier(getVisualizationClassesState(state)),
        }),
    );

const applyInsightContentCleared = (state: IAppState): IAppState =>
    dispatch(state, insightContentCleared({ reset: buildInsightContentResetCarrier() }));

const navigate = (state: IAppState, hash: string): IAppState => {
    const previousRoute = getRouteState(state);
    const route = buildNextRoute(hash, previousRoute);
    const next = dispatch(state, routeChanged(route, previousRoute));
    if (!shouldResetOnNavigation(route, previousRoute)) {
        return next;
    }
    return dispatch(
        next,
        wholeApplicationReset({
            reset: buildApplicationResetCarrier(getVisualizationClassesState(next)),
        }),
    );
};

const cacheItem = (id: string, extra: Record<string, unknown> = {}): ICacheItem =>
    ({
        ref: { identifier: id },
        identifier: id,
        type: "metric",
        title: `Item ${id}`,
        uri: `/gdc/project/obj/${id}`,
        ...extra,
    }) as ICacheItem;

const visualizationClass = (url: string, identifier: string): IVisualizationClass => ({
    visualizationClass: {
        checksum: "local",
        icon: url,
        iconSelected: `${url}.selected`,
        orderIndex: 0,
        url,
        identifier,
        uri: `/gdc/md/mockproject/obj/${identifier}`,
        title: identifier,
    },
});

const TABLE_CLASS = visualizationClass("local:table", "id_table");
const COLUMN_CLASS = visualizationClass("local:column", "id_column");
const BAR_CLASS = visualizationClass("local:bar", "id_bar");

const dateDatasetsMeta = (granularity = "activity.year"): IDateDatasetsMeta => ({
    items: [
        {
            identifier: "activity.dataset.dt",
            uri: "/gdc/md/project/obj/727",
            ref: uriRef("/gdc/md/project/obj/727"),
            type: "dateDataset",
            title: "Date (Activity)",
            summary: "DataSet Date",
            attributes: [
                {
                    granularity,
                    dateType: "GDC.time.year",
                    title: "Year (Activity)",
                    displayForms: [
                        {
                            id: "activity.year.df",
                            uri: "/gdc/md/project/obj/728",
                            ref: uriRef("/gdc/md/project/obj/728"),
                            title: "Year (Activity)",
                        },
                    ],
                } as IDateDatasetAttribute,
            ],
        },
    ],
});

describe("data domain characterization", () => {
    describe("DATE_DATASETS_DATA", () => {
        // partial datasets — the slice stores them verbatim
        const dateDatasets = {
            available: [
                { id: "ds-1", identifier: "ds-1", title: "Date (Activity)", relevance: 0 },
                { id: "ds-2", identifier: "ds-2", title: "Date (Created)", relevance: 0 },
            ],
            unavailable: 2,
        };

        it("stores available/unavailable and flips the loading flags", () => {
            const next = dispatch(
                dispatch(getInitializedState(), setDateDatasetsUpdating(true)),
                dateDatasetsUpdated(dateDatasets as IDateDatasets),
            );

            expect(next.data.dateDatasets.available).toEqual(dateDatasets.available);
            expect(next.data.dateDatasets.unavailable).toBe(2);
            expect(next.data.dateDatasets.loaded).toBe(true);
            expect(next.data.dateDatasets.updating).toBe(false);
        });

        it("merges shallowly: keys absent from the payload survive, `available` is replaced", () => {
            const seeded = dispatchAll(getInitializedState(), [
                setDateDatasetsDropdownLoaded(true),
                dateDatasetsUpdated(dateDatasets as IDateDatasets),
            ]);

            const next = dispatch(
                seeded,
                dateDatasetsUpdated({ available: [dateDatasets.available[0]] } as IDateDatasets),
            );

            // the payload list REPLACES the stored one (no concatenation, no dedupe/sort here)
            expect(next.data.dateDatasets.available).toEqual([dateDatasets.available[0]]);
            // `unavailable` / `dropdownLoaded` were not part of the payload and stay put
            expect(next.data.dateDatasets.unavailable).toBe(2);
            expect(next.data.dateDatasets.dropdownLoaded).toBe(true);
        });

        it("stores the available date datasets so the buckets cluster reads them by property", () => {
            const next = dispatch(getInitializedState(), dateDatasetsUpdated(dateDatasets as IDateDatasets));

            expect(Array.isArray(next.data.dateDatasets.available)).toBe(true);
            expect(DateDatasetsService.getAvailableDateDatasets(next).length).toBe(2);

            const found = DateDatasetsService.getDateDatasetByIdentifier(next, "ds-2");
            expect(found.title).toBe("Date (Created)");
        });
    });

    describe("date dataset loading flags", () => {
        it("SET_DATE_DATASETS_LOADED stores the flag", () => {
            const next = dispatch(getInitializedState(), setDateDatasetsLoaded(true));

            expect(DateDatasetsService.isDateDatasetsLoaded(next)).toBe(true);
            expect(next.data.dateDatasets.loaded).toBe(true);
        });

        it("SET_DATE_DATASETS_UPDATING stores the flag", () => {
            const next = dispatch(getInitializedState(), setDateDatasetsUpdating(true));

            expect(DateDatasetsService.isDateDatasetsUpdating(next)).toBe(true);
            expect(next.data.dateDatasets.updating).toBe(true);
        });

        it("SET_DATE_DATASETS_DROPDOWN_LOADED stores the flag", () => {
            const next = dispatch(getInitializedState(), setDateDatasetsDropdownLoaded(true));

            expect(DateDatasetsService.isDateDatasetsDropdownLoaded(next)).toBe(true);
            expect(next.data.dateDatasets.dropdownLoaded).toBe(true);
        });

        it("starts from the seeded defaults", () => {
            const initialized = getInitializedState();

            expect(DateDatasetsService.isDateDatasetsLoaded(initialized)).toBe(false);
            expect(DateDatasetsService.isDateDatasetsDropdownLoaded(initialized)).toBe(false);
            expect(initialized.data.dateDatasets.unavailable).toBe(0);
        });
    });

    describe("SET_DATE_DATASETS_META", () => {
        it("stores the meta object as a plain leaf", () => {
            const meta = dateDatasetsMeta();

            const next = dispatch(getInitializedState(), setDateDatasetsMeta(meta));

            expect(DateDatasetsMetaService.getDateDatasetsMeta(next)).toEqual(meta);
        });

        it("derives itemCache entries for the granularity attributes of every meta item", () => {
            const next = dispatch(getInitializedState(), setDateDatasetsMeta(dateDatasetsMeta()));

            const derived = getItemCache(next)["activity.year"];
            expect(derived).toEqual({
                identifier: "activity.year",
                granularity: "activity.year",
                dateType: "GDC.time.year",
                title: "Year (Activity)",
                displayForms: dateDatasetsMeta().items[0].attributes[0].displayForms,
            });
        });

        // No `[]` default: incoming arrays REPLACE the cached ones, so defaulting here would WIPE
        // the display forms of a granularity an earlier payload populated — and the date bucket
        // item's "Display as" dropdown reads exactly this entry. Omitting the key makes the merge a
        // no-op; `displayForms` is optional on the entry type and every reader defaults it to [].
        it("omits displayForms entirely when the payload carries none", () => {
            const meta: IDateDatasetsMeta = {
                items: [
                    {
                        ...dateDatasetsMeta().items[0],
                        attributes: [
                            {
                                granularity: "activity.month",
                                dateType: "GDC.time.month",
                            } as IDateDatasetAttribute,
                        ],
                    },
                ],
            };

            const next = dispatch(getInitializedState(), setDateDatasetsMeta(meta));

            expect(getItemCache(next)["activity.month"]).not.toHaveProperty("displayForms");
        });

        it("keeps unrelated itemCache entries", () => {
            const next = dispatchAll(getInitializedState(), [
                updateItemCache({ "metric.m1": cacheItem("m1") }),
                setDateDatasetsMeta(dateDatasetsMeta()),
            ]);

            const cache = getItemCache(next);
            expect(cache["metric.m1"]).toEqual(cacheItem("m1"));
            expect(cache["activity.year"]).toBeDefined();
        });
    });

    describe("STORE_UPDATE_ITEM_CACHE", () => {
        it("keeps the itemCache a plain object of plain entries", () => {
            const next = dispatch(getInitializedState(), updateItemCache({ "metric.m1": cacheItem("m1") }));

            const cache = getItemCache(next);
            expect(cache).toEqual({ "metric.m1": cacheItem("m1") });
        });

        it("merges entry fields deeply instead of replacing the entry", () => {
            const next = dispatchAll(getInitializedState(), [
                updateItemCache({ "metric.m1": cacheItem("m1", { summary: "kept" }) }),
                updateItemCache({
                    "metric.m1": { title: "renamed", format: "##.#" } as unknown as ICacheItem,
                }),
            ]);

            expect(getItemCache(next)["metric.m1"]).toEqual({
                ...cacheItem("m1", { summary: "kept" }),
                title: "renamed",
                format: "##.#",
            });
        });

        it("merges nested objects of an entry", () => {
            const next = dispatchAll(getInitializedState(), [
                updateItemCache({ "metric.m1": cacheItem("m1") }),
                updateItemCache({
                    "metric.m1": { ref: { uri: "/gdc/obj/1" } } as unknown as ICacheItem,
                }),
            ]);

            expect(getItemCache(next)["metric.m1"].ref).toEqual({
                identifier: "m1",
                uri: "/gdc/obj/1",
            });
        });

        // List-valued entry fields REPLACE rather than concatenate. Concatenating them grows an
        // entry's displayForms on every re-send, and the bucket item's "Display as" dropdown then
        // lists every display form once per catalog load.
        it("REPLACES list-valued entry fields, so a re-sent entry is idempotent", () => {
            const withDisplayForms = { "attribute.a1": cacheItem("a1", { displayForms: [{ id: "df1" }] }) };

            const next = dispatchAll(getInitializedState(), [
                updateItemCache(withDisplayForms),
                updateItemCache(withDisplayForms),
                updateItemCache(withDisplayForms),
            ]);

            expect(getItemCache(next)["attribute.a1"].displayForms).toEqual([{ id: "df1" }]);
        });

        it("adds new entries next to the existing ones", () => {
            const next = dispatchAll(getInitializedState(), [
                updateItemCache({ "metric.m1": cacheItem("m1") }),
                updateItemCache({ "metric.m2": cacheItem("m2") }),
            ]);

            expect(Object.keys(getItemCache(next))).toEqual(["metric.m1", "metric.m2"]);
        });
    });

    describe("STORE_SET_VISUALIZATION_CLASSES", () => {
        it("stores the classes as the payload array, verbatim", () => {
            const next = dispatch(
                getInitializedState(),
                setVisualizationClasses([COLUMN_CLASS, TABLE_CLASS]),
            );

            const classes = getVisualizationClasses(next);
            expect(Array.isArray(classes)).toBe(true);
            expect(classes).toEqual([COLUMN_CLASS, TABLE_CLASS]);
        });

        it("selects the table class as the default when present", () => {
            const next = dispatch(
                getInitializedState(),
                setVisualizationClasses([COLUMN_CLASS, TABLE_CLASS]),
            );

            expect(getVisualizationClass(next)).toEqual(TABLE_CLASS);
            expect(isDefaultVisualizationClass(next)).toBe(true);
        });

        it("falls back to the column class when there is no table class", () => {
            const next = dispatch(getInitializedState(), setVisualizationClasses([BAR_CLASS, COLUMN_CLASS]));

            expect(getVisualizationClass(next)).toEqual(COLUMN_CLASS);
        });

        it("falls back to the first class when neither table nor column is present", () => {
            const next = dispatch(getInitializedState(), setVisualizationClasses([BAR_CLASS]));

            expect(getVisualizationClass(next)).toEqual(BAR_CLASS);
        });

        // the first class of an empty list is `undefined`, and the slice normalizes that to null:
        // RTK forbids a case reducer on non-draftable state from returning undefined. Every reader
        // treats the selected class as optional (`visualizationClass ? … : false`).
        it("leaves the selected class empty for an empty class list", () => {
            const next = dispatch(getInitializedState(), setVisualizationClasses([]));

            expect(getVisualizationClasses(next).length).toBe(0);
            expect(getVisualizationClass(next)).toBeNull();
        });

        it("replaces both the class list and the selected class on every dispatch", () => {
            const next = dispatchAll(getInitializedState(), [
                setVisualizationClasses([COLUMN_CLASS, TABLE_CLASS]),
                setVisualizationClasses([BAR_CLASS]),
            ]);

            expect(getVisualizationClasses(next).length).toBe(1);
            expect(getVisualizationClass(next)).toEqual(BAR_CLASS);
        });
    });

    describe("insight usage on dashboards", () => {
        const usages = [
            createAnalyticalDashboard("Sale", "Bee", 123),
            createAnalyticalDashboard("Revenue", "id3", 124),
        ];
        const dashboards = [...publicDashboards, ...privateDashboards];

        const EMPTY_USAGE: ReturnType<typeof getInsightUsageOnDashboardsSelector> = {
            accessibleDashboards: [],
            allDashboards: [],
            allDashboardsCount: 0,
            inaccessibleDashboardsCount: 0,
        };

        it("stores the raw referenced/user dashboards for the selector to combine", () => {
            const next = dispatch(getInitializedState(), updateInsightUsageOnDashboards(usages, dashboards));

            expect(getInsightUsageOnDashboardsSelector(next)).toEqual({
                allDashboards: [
                    { title: "Sale", id: "Bee" },
                    { title: "Revenue", id: "id3" },
                ],
                accessibleDashboards: [{ title: "Revenue", id: "id3" }],
                allDashboardsCount: 2,
                inaccessibleDashboardsCount: 1,
            });
        });

        it("serves the empty usage before anything was stored", () => {
            expect(getInsightUsageOnDashboardsSelector(getInitializedState())).toEqual(EMPTY_USAGE);
        });

        it("RESET_INSIGHT_USAGE_ON_DASHBOARDS makes the selector serve the empty usage again", () => {
            const next = dispatchAll(getInitializedState(), [
                updateInsightUsageOnDashboards(usages, dashboards),
                resetInsightUsageOnDashboards(),
            ]);

            expect(getInsightUsageOnDashboardsSelector(next)).toEqual(EMPTY_USAGE);
            expect(next.data.insightUsagesOnDashboards == null).toBe(true);
        });
    });

    describe("configuration panel", () => {
        it("STORE_CONFIGURATION_PANEL_COLLAPSED stores the flag", () => {
            const collapsed = dispatch(getInitializedState(), storeConfigurationPanelCollapsed(true));
            expect(isConfigurationPanelCollapsed(collapsed)).toBe(true);

            const expanded = dispatch(collapsed, storeConfigurationPanelCollapsed(false));
            expect(isConfigurationPanelCollapsed(expanded)).toBe(false);
        });

        it("STORE_CONFIGURATION_PANEL_COLLAPSED_BY_DRAGGING stores the flag", () => {
            const next = dispatch(getInitializedState(), storeConfigurationPanelCollapsedByDragging(true));

            expect(isConfigurationPanelCollapsedByDragging(next)).toBe(true);
            expect(next.data.configurationPanel.collapsedByDragging).toBe(true);
        });

        it("starts collapsed, with the dragging flag unset", () => {
            const initialized = getInitializedState();

            expect(isConfigurationPanelCollapsed(initialized)).toBe(true);
            expect(isConfigurationPanelCollapsedByDragging(initialized)).toBe(false);
        });

        it("CLEAR_INSIGHT_CONTENT re-collapses the panel", () => {
            const next = applyInsightContentCleared(
                dispatch(getInitializedState(), storeConfigurationPanelCollapsed(false)),
            );

            expect(next.data.configurationPanel.collapsed).toBe(true);
        });
    });

    describe("insight-level reset (RESET_APPLICATION)", () => {
        const loaded = () =>
            dispatchAll(getInitializedState(), [
                setVisualizationClasses([COLUMN_CLASS, TABLE_CLASS]),
                updateItemCache({ "metric.m1": cacheItem("m1") }),
                dateDatasetsUpdated({ available: [{ id: "ds-1" }], unavailable: 1 } as IDateDatasets),
                setDateDatasetsMeta(dateDatasetsMeta()),
                updateInsightUsageOnDashboards([createAnalyticalDashboard("Sale", "Bee", 123)], []),
            ]);

        it("clears the stored insight usage", () => {
            const next = applyApplicationCleared(loaded());

            expect(next.data.insightUsagesOnDashboards == null).toBe(true);
        });

        it("re-selects the default visualization class", () => {
            const before = dispatch(loaded(), setVisualizationClasses([COLUMN_CLASS, TABLE_CLASS]));

            const next = applyApplicationCleared(before);

            expect(getVisualizationClass(next)).toEqual(TABLE_CLASS);
            expect(isDefaultVisualizationClass(next)).toBe(true);
        });

        it("keeps the loaded catalog data (itemCache, classes, date datasets)", () => {
            const before = loaded();

            const next = applyApplicationCleared(before);

            expect(next.data.itemCache).toBe(before.data.itemCache);
            expect(next.data.visualizationClasses).toBe(before.data.visualizationClasses);
            expect(next.data.dateDatasets).toBe(before.data.dateDatasets);
            expect(DateDatasetsMetaService.getDateDatasetsMeta(next)).toEqual(
                DateDatasetsMetaService.getDateDatasetsMeta(before),
            );
        });

        it("keeps the loaded catalog data across CLEAR_INSIGHT_CONTENT too", () => {
            const before = loaded();

            const next = applyInsightContentCleared(before);

            expect(next.data.itemCache).toBe(before.data.itemCache);
            expect(next.data.dateDatasets).toBe(before.data.dateDatasets);
            expect(next.data.insightUsagesOnDashboards).toBe(before.data.insightUsagesOnDashboards);
        });

        // resetWholeApplication (navigation that clears the open report back to the default one)
        // additionally resets the date datasets
        it("resets the date datasets on the whole-application reset, keeping the itemCache", () => {
            const before = navigate(loaded(), "#/report1/edit");

            const next = navigate(before, "#/");

            expect(next.data.dateDatasets.available).toEqual([]);
            expect(next.data.dateDatasets.unavailable).toBe(0);
            expect(next.data.dateDatasets.loaded).toBe(false);
            expect(next.data.dateDatasets.dropdownLoaded).toBe(false);
            expect(next.data.itemCache).toBe(before.data.itemCache);
        });
    });

    // RESET_FOR_PLUGGABLE_MOUNT short-circuits the chain and returns the pristine initialState,
    // which deliberately does not carry slice-owned subtrees (they self-initialize via
    // _infra/lift_slice). Pins that the gap is unobservable for this domain's readers.
    describe("RESET_FOR_PLUGGABLE_MOUNT (host unmount)", () => {
        const resetState = () =>
            dispatch(
                dispatchAll(getInitializedState(), [
                    setVisualizationClasses([COLUMN_CLASS, TABLE_CLASS]),
                    updateItemCache({ "metric.m1": cacheItem("m1") }),
                    setDateDatasetsLoaded(true),
                    updateInsightUsageOnDashboards([createAnalyticalDashboard("Sale", "Bee", 123)], []),
                    storeConfigurationPanelCollapsed(false),
                ]),
                { type: ActionTypeKeys.RESET_FOR_PLUGGABLE_MOUNT },
            );

        it("serves the domain defaults through its selectors right after the reset", () => {
            const after = resetState();

            expect(getItemCache(after)).toEqual({});
            expect(getVisualizationClasses(after).length).toBe(0);
            expect(getVisualizationClass(after)).toBeNull();
            expect(DateDatasetsService.isDateDatasetsLoaded(after)).toBe(false);
            expect(DateDatasetsMetaService.getDateDatasetsMeta(after)).toEqual({ items: [] });
            expect(getInsightUsageOnDashboardsSelector(after)).toEqual({
                accessibleDashboards: [],
                allDashboards: [],
                allDashboardsCount: 0,
                inaccessibleDashboardsCount: 0,
            });
            expect(isConfigurationPanelCollapsed(after)).toBe(true);
        });

        it("re-materializes the domain branches on the next dispatched action", () => {
            const remounted = dispatch(resetState(), updateItemCache({ "metric.m2": cacheItem("m2") }));

            expect(Object.keys(getItemCache(remounted))).toEqual(["metric.m2"]);
            expect(isConfigurationPanelCollapsed(remounted)).toBe(true);
            expect(DateDatasetsService.isDateDatasetsLoaded(remounted)).toBe(false);
        });
    });
});
