// (C) 2007-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { Provider } from "react-redux";
import { legacy_createStore as createStore } from "redux";
import { describe, expect, it, vi } from "vitest";

import type { compareSelector } from "../../../../selectors/over_time_comparison_selector.js";
import { getIntlOptions, withIntl } from "../../../../utils/with_intl.js";

import { ComparedMeasuresDropdown, type IComparedMeasuresDropdownProps } from "./ComparedMeasuresDropdown.js";
import { type IComparedMeasure } from "./model/compared_measure_typing.js";

vi.hoisted(() => {
    vi.resetModules();
});

/**
 * The component reads incompatibleMeasurePresent through compareSelector; the tests drive that
 * selector directly instead of assembling a whole root state.
 */
type IStateProps = ReturnType<typeof compareSelector>;

let stateProps: IStateProps;

vi.mock("../../../../selectors/over_time_comparison_selector.js", () => ({
    compareSelector: () => stateProps,
}));

describe("ComparedMeasuresDropdown", () => {
    const intlOptions = getIntlOptions({
        "filter.compare.applied_on.other": "individual {count}",
        "filter.compare.applied_on.none": "none",
        "filter.compare.applied_on.all": "all",
    });

    const DropdownWrapper = withIntl(ComparedMeasuresDropdown, intlOptions);

    const compatibleMeasures: IComparedMeasure[] = [
        {
            localIdentifier: "m1",
            title: "measure 1",
            sequenceNumber: 1,
        },
        {
            localIdentifier: "m2",
            title: "measure 2",
            sequenceNumber: 2,
        },
    ];

    function renderComponent(customProps: Partial<IComparedMeasuresDropdownProps & IStateProps> = {}) {
        const { incompatibleMeasurePresent = false, ...ownProps } = customProps;

        stateProps = { incompatibleMeasurePresent };

        const props: IComparedMeasuresDropdownProps = {
            listItemHeight: 15,
            compatibleMeasures,
            selectedMeasures: [],
            onSelectionApplied: () => {},
            selectedAllCompatible: false,
            ...ownProps,
        };

        const store = createStore((state: null = null) => state);

        return render(
            <Provider store={store}>
                <DropdownWrapper {...props} />
            </Provider>,
        );
    }

    it("should render component", () => {
        renderComponent();
        expect(document.querySelectorAll(".adi-compare-measures")).toHaveLength(1);
    });

    describe("disabled", () => {
        it("should render as enabled when compatible measures available", () => {
            renderComponent();
            expect(document.querySelector(".s-compare-apply-measures-button")).not.toHaveClass("disabled");
        });

        it("should render as disabled when no compatible measures available", () => {
            renderComponent({
                compatibleMeasures: [],
            });
            expect(document.querySelector(".s-compare-apply-measures-button")).toHaveClass("disabled");
        });
    });

    describe("incompatibleMeasurePresent", () => {
        it('should not render "some incompatible present" message', () => {
            renderComponent({
                incompatibleMeasurePresent: false,
            });
            expect(document.querySelectorAll(".s-compare-apply-incompatible")).toHaveLength(0);
        });

        it('should render "some incompatible present" message', () => {
            renderComponent({
                incompatibleMeasurePresent: true,
            });
            expect(document.querySelectorAll(".s-compare-apply-incompatible")).toHaveLength(1);
        });
    });

    describe("dropdown button", () => {
        it('should render dropdown button with text "individual selection" when some measures selected', () => {
            renderComponent({
                incompatibleMeasurePresent: true,
                selectedMeasures: ["m1"],
            });
            expect(document.querySelector(".s-compare-apply-measures-button").textContent).toEqual(
                "individual 1",
            );
        });

        it('should render dropdown button with text "all" when some measures selected', () => {
            renderComponent({
                incompatibleMeasurePresent: true,
                selectedMeasures: ["m1", "m2"],
            });

            expect(document.querySelector(".s-compare-apply-measures-button").textContent).toEqual("all");
        });

        it("should open dropdown on click on the button and close it with repeated click", () => {
            renderComponent();
            fireEvent.click(document.querySelector(".s-compare-apply-measures-button"));

            expect(document.querySelector(".s-compare-apply-measures-list")).toBeInTheDocument();

            fireEvent.click(document.querySelector(".s-compare-apply-measures-button"));

            expect(document.querySelector(".s-compare-apply-measures-list")).not.toBeInTheDocument();
        });
    });
});
