// (C) 2019-2026 GoodData Corporation

import { act, render } from "@testing-library/react";
import { Provider } from "react-redux";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { uriRef } from "@gooddata/sdk-model";

import { createStore } from "../../create_store.js";
import { setMultilineFilterBar } from "../../sagas/filter_bar/filter_bar_ui_actions.js";
import {
    addFiltersToState,
    setMultilineFilterBar as storeSetMultilineFilterBar,
} from "../../store/filter_bar/filter_bar_actions.js";
import { type IFilter } from "../../store/filter_bar/filter_bar_types.js";
import { addParameterFiltersToState } from "../../store/filter_bar/parameter_filter_actions.js";
import { type IParameterFilter } from "../../store/filter_bar/parameter_filter_types.js";
import { withIntl } from "../../utils/with_intl.js";

import { FilterBar } from "./FilterBar.js";

vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("./DraggableFilterItem");
vi.mock("./FilterBarList");
vi.mock("./filterBarDropdown/FilterBarDropdown");
// the three above resolve to a `__mocks__` file; this one has none, so spell the mock out rather
// than leave it to the automocker — the automocker imports the real module through the registry the
// whole worker shares, and intermittently hands back an empty one
vi.mock("./filterBarDropTarget/FilterBarDropTarget", () => ({
    PureFilterBarDropTarget: vi.fn(() => <div className="s-filter-drop" />),
}));

// the fake clock is installed and uninstalled per test so it does not leak into other test files
beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

const FILTER_ITEMS: IFilter[] = [
    {
        type: "attribute",
        localIdentifier: "id",
        cacheItemIdentifier: "id",
        displayFormRef: uriRef("attr/df/uri"),
    },
    {
        type: "attribute",
        localIdentifier: "id1",
        cacheItemIdentifier: "id1",
        displayFormRef: uriRef("attr/df/uri1"),
    },
];

const PARAMETER_ITEMS: IParameterFilter[] = [
    {
        type: "parameter",
        localIdentifier: "param-id",
        parameterRef: uriRef("parameter/uri"),
        name: "Threshold",
        value: 42,
        definition: { type: "NUMBER", defaultValue: 42 },
    },
];

interface IStoreSetup {
    filterItems?: IFilter[];
    isMultiline?: boolean;
}

describe("FilterBar", () => {
    const FilterBarWithIntl = withIntl(FilterBar);

    function renderComponent({ filterItems = [], isMultiline = false }: IStoreSetup = {}) {
        const { store } = createStore();

        if (filterItems.length > 0) {
            store.dispatch(addFiltersToState(filterItems, false));
        }
        if (isMultiline) {
            store.dispatch(storeSetMultilineFilterBar(true));
        }

        // spy only after the state is seeded so that setup dispatches are not asserted on
        const dispatchSpy = vi.spyOn(store, "dispatch");

        return {
            ...render(
                <Provider store={store}>
                    <FilterBarWithIntl />
                </Provider>,
            ),
            store,
            dispatchSpy,
        };
    }

    it("should render filter list", () => {
        const { getByText } = renderComponent({
            filterItems: FILTER_ITEMS,
        });

        expect(getByText("id")).toBeInTheDocument();
        expect(getByText("id1")).toBeInTheDocument();
    });

    it("should render header", () => {
        const { getByRole } = renderComponent();

        expect(getByRole("heading")).toHaveTextContent("Filters");
    });

    it("should fire setMultilineFilterBar after window resize if state isMultiline is not same", () => {
        const { dispatchSpy } = renderComponent({ isMultiline: true });
        dispatchSpy.mockClear();

        window.dispatchEvent(new Event("resize"));
        vi.runAllTimers();

        expect(dispatchSpy).toHaveBeenCalledTimes(1);
        expect(dispatchSpy).toHaveBeenCalledWith(setMultilineFilterBar(false));
    });

    it("should fire setMultilineFilterBar after mount if state isMultiline is not same", () => {
        const { dispatchSpy } = renderComponent({ isMultiline: true });

        expect(dispatchSpy).toHaveBeenCalledTimes(1);
        expect(dispatchSpy).toHaveBeenCalledWith(setMultilineFilterBar(false));
    });

    it("should fire setMultilineFilterBar after filterItems change if isMultiline is not same", () => {
        const { store, dispatchSpy } = renderComponent({ isMultiline: true });

        dispatchSpy.mockClear();

        act(() => {
            store.dispatch(addFiltersToState(FILTER_ITEMS, false));
        });

        expect(dispatchSpy).toHaveBeenCalledWith(setMultilineFilterBar(false));
    });

    it("should fire setMultilineFilterBar after parameterItems change if isMultiline is not same", () => {
        const { store, dispatchSpy } = renderComponent({ isMultiline: true });

        dispatchSpy.mockClear();

        act(() => {
            store.dispatch(addParameterFiltersToState(PARAMETER_ITEMS));
        });

        expect(dispatchSpy).toHaveBeenCalledWith(setMultilineFilterBar(false));
    });
});
