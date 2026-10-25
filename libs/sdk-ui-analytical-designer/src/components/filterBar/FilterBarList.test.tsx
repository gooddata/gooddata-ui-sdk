// (C) 2007-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { rootReducer } from "../../reducers/root_reducer.js";
import { storeFilterBarAutoOpen } from "../../store/filter_bar/filter_bar_actions.js";
import { type IParameterFilter } from "../../store/filter_bar/parameter_filter_types.js";
import { type IAppState } from "../../store/types.js";
import { filtersMock } from "../../tests/filter.test.helpers.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { withDragDrop } from "../../utils/with_drag_drop_context.js";
import { withIntl } from "../../utils/with_intl.js";
import { withRedux } from "../../utils/with_redux.js";

import { DraggableFilterItem } from "./DraggableFilterItem.js";
import { FilterBarList } from "./FilterBarList.js";

vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("./DraggableFilterItem", () => ({
    __esModule: true,
    DraggableFilterItem: vi.fn(({ filterItem, isAutoOpen }) => (
        <div
            className={`s-filter ${isAutoOpen ? "s-auto-open" : ""}`}
            data-testid={`s-filter-${filterItem.localIdentifier}`}
        />
    )),
}));

vi.mock("./filterBarDropTarget/FilterBarDropTarget", () => ({
    __esModule: true,
    PureFilterBarDropTarget: vi.fn(() => <div className="s-filter-drop" />),
}));

vi.mock("./filterBarDropdown/FilterBarDropdown", () => ({
    __esModule: true,
    FilterBarDropdown: vi.fn(() => <div className="s-filter-dropdown" />),
}));

describe("FilterBarList", () => {
    describe("Component", () => {
        function createComponent(state: IAppState = getInitializedState()) {
            const Wrapped = withIntl(withDragDrop(withRedux(FilterBarList, () => state)));

            const attribute = filtersMock[0];
            const otherItem = filtersMock[1];
            const parameterItems: IParameterFilter[] = [];
            const props = {
                filterItems: [attribute, otherItem],
                parameterItems,
            };

            return render(<Wrapped {...props} />);
        }

        it("should render items", () => {
            const { container } = createComponent();
            expect(container.querySelectorAll(".s-filter")).toHaveLength(2);
        });

        it("should render drop target", () => {
            const { container } = createComponent();
            expect(container.querySelectorAll(".s-filter-drop")).toHaveLength(1);
        });

        it("should render drop down", () => {
            const { container } = createComponent();
            expect(container.querySelectorAll(".s-filter-dropdown")).toHaveLength(1);
        });
    });

    describe("auto-open hand-over", () => {
        const attribute = filtersMock[0];
        const otherItem = filtersMock[1];

        // a live store seeded with the pending hand-over
        function createLiveComponent(pendingAutoOpen: string | undefined) {
            const states: IAppState[] = [];
            const Wrapped = withIntl(
                withDragDrop(
                    withRedux(FilterBarList, (state, action) => {
                        const next = rootReducer(
                            states.length === 0 && pendingAutoOpen
                                ? rootReducer(state, storeFilterBarAutoOpen(pendingAutoOpen))
                                : state,
                            action,
                        );
                        states.push(next);
                        return next;
                    }),
                ),
            );

            const rendered = render(
                <Wrapped filterItems={[attribute, otherItem]} parameterItems={[] as IParameterFilter[]} />,
            );
            return { ...rendered, latestState: () => states[states.length - 1] };
        }

        it("should hand the auto-open over to the named filter's item only and keep it in the store", () => {
            vi.mocked(DraggableFilterItem).mockClear();
            const { container, latestState } = createLiveComponent(otherItem.localIdentifier);

            const renders = vi.mocked(DraggableFilterItem).mock.calls.map(([props]) => props);
            expect(renders.some((props) => props.filterItem === attribute && props.isAutoOpen)).toBe(false);
            expect(
                container.querySelector(`[data-testid="s-filter-${otherItem.localIdentifier}"]`),
            ).toHaveClass("s-auto-open");
            expect(
                container.querySelector(`[data-testid="s-filter-${attribute.localIdentifier}"]`),
            ).not.toHaveClass("s-auto-open");

            // the store owns the hand-over until that picker closes; rendering does not consume it
            expect(latestState().filterBarAutoOpen).toBe(otherItem.localIdentifier);
        });

        it("should keep a hand-over for a filter that is not rendered", () => {
            const { container, latestState } = createLiveComponent("not.rendered");

            expect(container.querySelectorAll(".s-auto-open")).toHaveLength(0);
            expect(latestState().filterBarAutoOpen).toBe("not.rendered");
        });

        it("should hand nothing over when no auto-open is pending", () => {
            const { container } = createLiveComponent(undefined);

            expect(container.querySelectorAll(".s-auto-open")).toHaveLength(0);
        });
    });
});
