// (C) 2019-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { filtersMock } from "../../tests/filter.test.helpers.js";

import {
    addFiltersToState,
    closeFilterDropdown,
    openFilterDropdown,
    removeFiltersFromState,
    setMigratedAdditionalFilters,
    setMultilineFilterBar,
    toggleFilterDropdown,
} from "./filter_bar_actions.js";
import { filterBarReducer } from "./filter_bar_reducer.js";
import { type IFilterBarState } from "./filter_bar_state.js";
import { type IFilter } from "./filter_bar_types.js";

const defaultAttributeFilter = filtersMock[0];
const dateFilter = filtersMock[1];

const getDefaultFilterBarState = (filters?: ReadonlyArray<IFilter>): IFilterBarState => ({
    attributeFilterConfigs: {},
    items: filters ?? [defaultAttributeFilter],
    isMultiline: false,
    migratedAdditionalFilters: [],
    parameterItems: [],
    filterBarDropdownOpen: false,
});

describe("filterBarReducer", () => {
    describe("STORE_ADD_FILTERS_TO_STATE", () => {
        it("should add new date filter to the filter list in FilterBarState", () => {
            const action = addFiltersToState([dateFilter], true);
            const newState = filterBarReducer(getDefaultFilterBarState(), action);

            expect(newState.items.length).toBe(2);
            expect(newState.items[1]).toEqual(dateFilter);
        });
    });

    describe("STORE_REMOVE_FILTERS_FROM_STATE", () => {
        it("should remove filter from filter list in FilterBarState", () => {
            const action = removeFiltersFromState([defaultAttributeFilter.localIdentifier], true);
            const newState = filterBarReducer(getDefaultFilterBarState(), action);

            expect(newState.items.length).toBe(0);
        });
    });

    describe("STORE_SET_MULTILINE_FILTER_BAR", () => {
        it("should correctly switch filterBar from/to multiline mode", () => {
            let newState: IFilterBarState;

            newState = filterBarReducer(getDefaultFilterBarState(), setMultilineFilterBar(true));
            expect(newState.isMultiline).toBe(true);
            newState = filterBarReducer(getDefaultFilterBarState(), setMultilineFilterBar(false));
            expect(newState.isMultiline).toBe(false);
            newState = filterBarReducer(getDefaultFilterBarState(), setMultilineFilterBar(true));
            expect(newState.isMultiline).toBe(true);
        });
    });

    describe("STORE_MIGRATED_ADDITIONAL_FILTERS", () => {
        it("should set additional date attributes reset flag", () => {
            const migratedFilters = ["id1"];
            const updatedState = filterBarReducer(
                getDefaultFilterBarState(),
                setMigratedAdditionalFilters(migratedFilters),
            );
            expect(updatedState.migratedAdditionalFilters).toBe(migratedFilters);
        });

        it("should clear the marks when dismissed with an empty list", () => {
            const markedState = filterBarReducer(
                getDefaultFilterBarState(),
                setMigratedAdditionalFilters(["id1", "id2"]),
            );
            const updatedState = filterBarReducer(markedState, setMigratedAdditionalFilters([]));
            expect(updatedState.migratedAdditionalFilters).toEqual([]);
        });
    });

    describe("STORE_TOGGLE_FILTER_DROPDOWN", () => {
        it("should toggle the filter dropdown", () => {
            const updatedState = filterBarReducer(getDefaultFilterBarState(), toggleFilterDropdown());
            expect(updatedState.filterBarDropdownOpen).toBe(true);
            const updatedStateAgain = filterBarReducer(updatedState, toggleFilterDropdown());
            expect(updatedStateAgain.filterBarDropdownOpen).toBe(false);
        });
    });

    describe("STORE_OPEN_FILTER_DROPDOWN", () => {
        it("should open the filter dropdown", () => {
            const updatedState = filterBarReducer(getDefaultFilterBarState(), openFilterDropdown());
            expect(updatedState.filterBarDropdownOpen).toBe(true);
        });
    });

    describe("STORE_CLOSE_FILTER_DROPDOWN", () => {
        it("should close the filter dropdown", () => {
            const updatedState = filterBarReducer(getDefaultFilterBarState(), closeFilterDropdown());
            expect(updatedState.filterBarDropdownOpen).toBe(false);
        });
    });
});
