// (C) 2026 GoodData Corporation

import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { type UnknownAction } from "redux";
import { afterEach, describe, expect, it, vi } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { redo, undo } from "../../actions/time_travel_actions.js";
import { createStore } from "../../create_store.js";
import { rootReducer } from "../../reducers/root_reducer.js";
import { watchFilterBar } from "../../sagas/filter_bar/filter_bar_saga.js";
import { addFilter, addRankingFilterFromMetric } from "../../sagas/filter_bar/filter_bar_ui_actions.js";
import { type IAppState } from "../../store/types.js";
import {
    countryAttribute,
    itemCache,
    productAttribute,
    setupAppStateWithDateDatasetMeta,
    setupAppStateWithDateDatasets,
} from "../../tests/constants.test.helpers.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { withData, withRoot } from "../../tests/state_builder.test.helpers.js";
import { type ICacheItem, type ICatalogEntry } from "../../typings/state_objects.js";
import { withDragDrop } from "../../utils/with_drag_drop_context.js";
import { withIntl } from "../../utils/with_intl.js";

import { FilterBar } from "./FilterBar.js";

vi.hoisted(() => {
    vi.resetModules();
});

// The SDK attribute filter loads elements from a backend and opens only once they are there; what
// matters here is the `autoOpen` prop each filter is rendered with, which the stub records per render
// (keyed by the filter's local identifier) without ever opening anything itself. Its close button
// stands in for the picker closing (apply, cancel, outside click).
interface IAttributeFilterRender {
    localIdentifier: string;
    autoOpen: boolean;
}
const attributeFilterRenders = vi.hoisted(() => [] as IAttributeFilterRender[]);
vi.mock("../AttributeFilter/AttributeFilter", () => ({
    AttributeFilter: vi.fn(
        ({
            autoOpen,
            filter,
            onClose,
        }: {
            autoOpen: boolean;
            filter: { original: { localIdentifier: string } | null };
            onClose: () => void;
        }) => {
            const localIdentifier = filter.original?.localIdentifier ?? "";
            attributeFilterRenders.push({ localIdentifier, autoOpen });
            return (
                <div
                    className={`s-filter-button ${autoOpen ? "s-auto-open" : ""}`}
                    data-testid={`s-attribute-filter-${localIdentifier}`}
                >
                    <button className="s-stub-close" onClick={onClose} />
                </div>
            );
        },
    ),
}));

const rendersOf = (localIdentifier: string) =>
    attributeFilterRenders
        .filter((render) => render.localIdentifier === localIdentifier)
        .map((render) => render.autoOpen);

const dateCatalogItem: ICatalogEntry = {
    type: "date",
    ref: idRef("date.ref"),
    title: "Date",
    identifier: "date.identifier",
    uri: "/date/uri",
};

const metricCatalogItem: ICacheItem = {
    type: "metric",
    identifier: "metric.amount",
    ref: idRef("metric.amount"),
    title: "Amount",
} as ICacheItem;

/**
 * The REAL store (root reducer + saga middleware running the filter bar watcher) under the real
 * FilterBar, so the test sees exactly the dispatch sequence production sees: the UI add action, the
 * saga's `addFiltersToState` put and its `storeFilterBarAutoOpen` put.
 */
function renderFilterBarWithStore(featureFlags: IAppState["featureFlags"]) {
    const seeded = withRoot(
        setupAppStateWithDateDatasets(
            setupAppStateWithDateDatasetMeta(withData(getInitializedState(), { itemCache })),
        ),
        { featureFlags },
    );
    const { store, sagaMiddleware } = createStore((state: IAppState | undefined, action: UnknownAction) =>
        rootReducer(state ?? seeded, action),
    );
    const task = sagaMiddleware.run(watchFilterBar);

    const Wrapped = withIntl(withDragDrop(FilterBar));
    const rendered = render(
        <Provider store={store}>
            <Wrapped />
        </Provider>,
    );

    return { ...rendered, store, stop: () => task.cancel() };
}

describe("filter bar auto-open through the real store and sagas", () => {
    afterEach(() => {
        attributeFilterRenders.length = 0;
    });

    it("mounts the date filter added by a single gesture with its picker open", () => {
        const { store, stop } = renderFilterBarWithStore({ enableImprovedMetricDateFilter: true });

        act(() => {
            store.dispatch(addFilter(dateCatalogItem, undefined, true));
        });

        expect(document.querySelectorAll(".s-date-filter")).toHaveLength(1);
        expect(document.querySelector(".s-filter-picker .s-preset-section")).toBeInTheDocument();
        // the store keeps the hand-over until the picker closes
        const [added] = store.getState().data.filterBar.items;
        expect(store.getState().filterBarAutoOpen).toBe(added.localIdentifier);
        stop();
    });

    it("mounts the attribute filter added by a single gesture with autoOpen already set", () => {
        const { store, stop } = renderFilterBarWithStore({ enableImprovedMetricDateFilter: true });

        act(() => {
            store.dispatch(addFilter(countryAttribute, undefined, true));
        });

        expect(document.querySelector(".s-filter-button")).toHaveClass("s-auto-open");
        // the very first render of the attribute filter already had autoOpen — no closed mount first
        expect(attributeFilterRenders[0].autoOpen).toBe(true);
        // the store keeps the hand-over until the picker closes
        const [added] = store.getState().data.filterBar.items;
        expect(store.getState().filterBarAutoOpen).toBe(added.localIdentifier);
        stop();
    });

    it("hands the auto-open to the newest add while an earlier picker is open, and the earlier one lets go", () => {
        const { store, stop } = renderFilterBarWithStore({ enableImprovedMetricDateFilter: true });

        act(() => {
            store.dispatch(addFilter(countryAttribute, undefined, true));
        });
        const [country] = store.getState().data.filterBar.items;
        expect(rendersOf(country.localIdentifier).at(-1)).toBe(true);

        act(() => {
            store.dispatch(addFilter(productAttribute, undefined, true));
        });
        const product = store.getState().data.filterBar.items[1];

        expect(store.getState().filterBarAutoOpen).toBe(product.localIdentifier);
        expect(rendersOf(country.localIdentifier).at(-1)).toBe(false);
        expect(rendersOf(product.localIdentifier).at(-1)).toBe(true);
        stop();
    });

    it("never opens an earlier filter still loading when a newer add took the auto-open over", () => {
        const { store, stop } = renderFilterBarWithStore({ enableImprovedMetricDateFilter: true });

        // A is added; its elements are "still loading", so it has not acted on autoOpen yet
        act(() => {
            store.dispatch(addFilter(countryAttribute, undefined, true));
        });
        const [country] = store.getState().data.filterBar.items;
        const rendersBeforeB = rendersOf(country.localIdentifier).length;

        act(() => {
            store.dispatch(addFilter(productAttribute, undefined, true));
        });
        const product = store.getState().data.filterBar.items[1];

        // from B's add on, A only ever sees autoOpen=false — B is the one waiting to open
        const countryRendersAfterB = rendersOf(country.localIdentifier).slice(rendersBeforeB);
        expect(countryRendersAfterB.length).toBeGreaterThan(0);
        expect(countryRendersAfterB.every((autoOpen) => autoOpen === false)).toBe(true);
        expect(rendersOf(product.localIdentifier).every((autoOpen) => autoOpen === true)).toBe(true);

        // A's (late) close does not touch B's hand-over; B's close releases it
        act(() => {
            fireEvent.click(
                document.querySelector(
                    `[data-testid="s-attribute-filter-${country.localIdentifier}"] .s-stub-close`,
                ),
            );
        });
        expect(store.getState().filterBarAutoOpen).toBe(product.localIdentifier);
        act(() => {
            fireEvent.click(
                document.querySelector(
                    `[data-testid="s-attribute-filter-${product.localIdentifier}"] .s-stub-close`,
                ),
            );
        });
        expect(store.getState().filterBarAutoOpen).toBe(null);
        expect(rendersOf(country.localIdentifier).at(-1)).toBe(false);
        expect(rendersOf(product.localIdentifier).at(-1)).toBe(false);
        stop();
    });

    it("does not reopen the date filter picker on undo and redo of the add once it was closed", () => {
        const { store, stop } = renderFilterBarWithStore({ enableImprovedMetricDateFilter: true });

        act(() => {
            store.dispatch(addFilter(dateCatalogItem, undefined, true));
        });
        expect(document.querySelector(".s-filter-picker .s-preset-section")).toBeInTheDocument();

        act(() => {
            fireEvent.click(document.querySelector(".s-date-filter-cancel"));
        });
        expect(document.querySelector(".s-filter-picker")).not.toBeInTheDocument();
        expect(store.getState().filterBarAutoOpen).toBe(null);

        act(() => {
            store.dispatch(undo());
        });
        expect(document.querySelectorAll(".s-date-filter")).toHaveLength(0);

        act(() => {
            store.dispatch(redo());
        });
        expect(document.querySelectorAll(".s-date-filter")).toHaveLength(1);
        expect(document.querySelector(".s-filter-picker")).not.toBeInTheDocument();
        expect(store.getState().filterBarAutoOpen).toBe(null);
        stop();
    });

    it("mounts the ranking filter added from a metric with its dropdown open, flag off", () => {
        // the improved ranking item reads the insight definition, which needs a rendered visualization;
        // the legacy item is enough to see the dropdown mount open
        const { store, stop } = renderFilterBarWithStore({
            enableImprovedMetricDateFilter: false,
            enableImprovedRankingFilter: false,
        });

        act(() => {
            store.dispatch(addRankingFilterFromMetric(metricCatalogItem));
        });

        expect(document.querySelector(".s-rf-dropdown-body")).toBeInTheDocument();
        const [ranking] = store.getState().data.filterBar.items;
        expect(store.getState().filterBarAutoOpen).toBe(ranking.localIdentifier);

        // cancelling the configuration releases the hand-over
        act(() => {
            fireEvent.click(document.querySelector(".s-rf-dropdown-cancel"));
        });
        expect(document.querySelector(".s-rf-dropdown-body")).not.toBeInTheDocument();
        expect(store.getState().filterBarAutoOpen).toBe(null);
        stop();
    });

    it("lands the added filter and its hand-over in one synchronous dispatch, so the first render sees both", async () => {
        // No act(): the saga's puts must not depend on React batching them — they complete inside the
        // UI action's own dispatch, before any render can happen.
        const actGlobal = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
        const actEnvironment = actGlobal.IS_REACT_ACT_ENVIRONMENT;
        actGlobal.IS_REACT_ACT_ENVIRONMENT = false;
        const { store, stop } = renderFilterBarWithStore({ enableImprovedMetricDateFilter: true });
        attributeFilterRenders.length = 0;

        try {
            store.dispatch(addFilter(countryAttribute, undefined, true));

            // synchronously after dispatch: the filter is in the state AND the hand-over names it
            const [added] = store.getState().data.filterBar.items;
            expect(added).toBeDefined();
            expect(store.getState().filterBarAutoOpen).toBe(added.localIdentifier);

            await waitFor(() =>
                expect(document.querySelector(".s-filter-button")).toHaveClass("s-auto-open"),
            );
            expect(attributeFilterRenders[0].autoOpen).toBe(true);
            expect(store.getState().filterBarAutoOpen).toBe(added.localIdentifier);
        } finally {
            actGlobal.IS_REACT_ACT_ENVIRONMENT = actEnvironment;
            stop();
        }
    });

    it("does not open the picker of a filter added without the single-gesture flag", () => {
        const { store, stop } = renderFilterBarWithStore({ enableImprovedMetricDateFilter: true });

        act(() => {
            store.dispatch(addFilter(dateCatalogItem));
        });

        expect(document.querySelectorAll(".s-date-filter")).toHaveLength(1);
        expect(document.querySelector(".s-filter-picker")).not.toBeInTheDocument();
        stop();
    });
});
