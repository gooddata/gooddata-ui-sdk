// (C) 2019-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { type UnknownAction } from "redux";
import { describe, expect, it, vi } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { rootReducer } from "../../reducers/root_reducer.js";
import { storeFilterBarAutoOpen } from "../../store/filter_bar/filter_bar_actions.js";
import { type IParameterFilter } from "../../store/filter_bar/parameter_filter_types.js";
import { filtersMock, rankingFilterWithoutAttributes } from "../../tests/filter.test.helpers.js";
import { withDragDrop } from "../../utils/with_drag_drop_context.js";
import { withIntl } from "../../utils/with_intl.js";
import { withRedux } from "../../utils/with_redux.js";

import { DraggableFilterItemTest, type IDraggableFilterItemProps } from "./DraggableFilterItem.js";

vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("./dateFilter/DateFilterItem", () => {
    return {
        __esModule: true,
        DateFilterItem: vi.fn(() => <div className="s-date-filter" />),
    };
});

vi.mock("./AttributeFilterItem", () => {
    return {
        __esModule: true,
        AttributeFilterItemPure: vi.fn(({ isAutoOpen, onClose }) => (
            <div className={`s-attribute-filter ${isAutoOpen ? "s-auto-open" : ""}`} onClick={onClose} />
        )),
    };
});

vi.mock("./rankingFilter/RankingFilterItem", () => {
    return {
        __esModule: true,
        RankingFilterItem: vi.fn(() => <div className="s-ranking-filter" />),
    };
});

vi.mock("./MeasureValueFilterItem", () => {
    return {
        __esModule: true,
        MeasureValueFilterItem: vi.fn(({ className }) => (
            <div className={`s-measure-value-filter ${className}`} />
        )),
    };
});

vi.mock("./parameterFilter/ParameterFilterItem", () => {
    return {
        __esModule: true,
        ParameterFilterItem: vi.fn(() => <div className="s-parameter-filter" />),
    };
});

describe("DraggableFilterItem", () => {
    const defaultProps: IDraggableFilterItemProps = {
        filterItem: null,
        isHighlighted: false,
        onStartFilterItemDrag: null,
        onEndFilterItemDrag: null,
    };

    function renderComponent(customProps?: Partial<IDraggableFilterItemProps>) {
        const Wrapped = withDragDrop(withIntl(withRedux(DraggableFilterItemTest.DraggableFilterItem)));
        return render(<Wrapped {...defaultProps} {...customProps} />);
    }

    describe("rendering filter component by filter type", () => {
        it("should render DateFilterItem when date filter item is provided", () => {
            const { container } = renderComponent({ filterItem: filtersMock[1] });
            expect(container.querySelector(".s-date-filter")).toBeInTheDocument();
        });

        it("should render AttributeFilterItem when attribute filter item is provided", () => {
            const { container } = renderComponent({
                filterItem: filtersMock[0],
            });
            expect(container.querySelector(".s-attribute-filter")).toBeInTheDocument();
        });

        it("should render MeasureValueFilterItem when measure filter item is provided", () => {
            const { container } = renderComponent({ filterItem: filtersMock[2] });
            expect(container.querySelector(".s-measure-value-filter")).toBeInTheDocument();
        });

        it("should render RankingFilterItem when ranking filter item is provided", () => {
            const { container } = renderComponent({ filterItem: rankingFilterWithoutAttributes });
            expect(container.querySelector(".s-ranking-filter")).toBeInTheDocument();
        });

        it("should render ParameterFilterItem when parameter filter item is provided", () => {
            const parameterFilter: IParameterFilter = {
                type: "parameter",
                localIdentifier: "p1",
                parameterRef: idRef("threshold", "parameter"),
                name: "Threshold",
                value: 10,
                definition: { type: "NUMBER", defaultValue: 10 },
            };
            const { container } = renderComponent({ filterItem: parameterFilter });
            expect(container.querySelector(".s-parameter-filter")).toBeInTheDocument();
        });
    });

    describe("auto-open hand-over", () => {
        it("should pass the auto-open down to the filter item", () => {
            const { container } = renderComponent({ filterItem: filtersMock[0], isAutoOpen: true });

            expect(container.querySelector(".s-attribute-filter")).toHaveClass("s-auto-open");
        });

        it("should not auto-open a filter item without the hand-over", () => {
            const { container } = renderComponent({ filterItem: filtersMock[0] });

            expect(container.querySelector(".s-attribute-filter")).not.toHaveClass("s-auto-open");
        });

        // a recording store, so the close hand-shake with the hand-over leaf is observable
        function renderWithRecordingStore(isAutoOpen: boolean) {
            const dispatched: UnknownAction[] = [];
            const Wrapped = withDragDrop(
                withIntl(
                    withRedux(DraggableFilterItemTest.DraggableFilterItem, (state, action) => {
                        dispatched.push(action);
                        return rootReducer(state, action);
                    }),
                ),
            );
            const rendered = render(
                <Wrapped {...defaultProps} filterItem={filtersMock[0]} isAutoOpen={isAutoOpen} />,
            );
            return { ...rendered, dispatched };
        }

        it("should release the hand-over when the picker it owns closes", () => {
            const { container, dispatched } = renderWithRecordingStore(true);

            // the mocked item reports its picker closed on click
            fireEvent.click(container.querySelector(".s-attribute-filter"));

            expect(dispatched).toContainEqual(storeFilterBarAutoOpen(null));
        });

        it("should leave the hand-over alone when a picker it does not own closes", () => {
            const { container, dispatched } = renderWithRecordingStore(false);

            fireEvent.click(container.querySelector(".s-attribute-filter"));

            expect(dispatched.some((action) => storeFilterBarAutoOpen.match(action))).toBe(false);
        });
    });

    it("should pass the hover className down to filter item component only when mouse is over list item", () => {
        const { container } = renderComponent({ filterItem: filtersMock[2] });

        expect(container.querySelector(".s-measure-value-filter")).not.toHaveClass("adi-filter-button-hover");

        fireEvent.mouseOver(container.querySelector("li"));
        expect(container.querySelector(".s-measure-value-filter")).toHaveClass("adi-filter-button-hover");

        fireEvent.mouseOut(container.querySelector("li"));
        expect(container.querySelector(".s-measure-value-filter")).not.toHaveClass("adi-filter-button-hover");
    });
});
