// (C) 2007-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import { getIntlOptions, withIntl } from "../../../../utils/with_intl.js";

import {
    type ITypesDropdownItemProps,
    TimeComparisonTypesDropdownItem,
} from "./TimeComparisonTypesDropdownItem.js";

const customTranslations = {
    "filter.compare.type.dropdown.same_period_previous_year": "1",
    "filter.compare.type.dropdown.nothing": "2",
};

describe("TypesDropdownItem", () => {
    const defaultProps = {
        selected: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
        item: OverTimeComparisonTypes.NOTHING,
        isAllTimeDateFilter: false,
        isPoPAvailable: true,
    };

    function renderComponent(props: Partial<ITypesDropdownItemProps> = {}) {
        const Wrapped = withIntl(TimeComparisonTypesDropdownItem, getIntlOptions(customTranslations));

        return render(<Wrapped {...defaultProps} {...props} />);
    }

    describe("same period previous year", () => {
        it("should not have class 'is-disabled' when week granularity is selected in view by date", () => {
            const { container } = renderComponent({
                item: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            });

            expect(container.querySelectorAll("div.is-disabled")).toHaveLength(0);
        });

        it("should have class 'is-disabled' when date filter is set to all time", () => {
            const { container } = renderComponent({
                isAllTimeDateFilter: true,
                item: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            });

            expect(container.querySelectorAll("div.is-disabled")).toHaveLength(1);
            expect(container.querySelector(".gd-bubble-trigger")).toBeTruthy();
        });

        it("should has class 'is-selected' when item is same as selected item", () => {
            const { container } = renderComponent({
                item: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                selected: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            });

            expect(container.querySelectorAll("div.is-selected")).toHaveLength(1);
        });
    });

    describe("previous period", () => {
        it("should not have class 'is-disabled' when week granularity is selected in view by date", () => {
            const { container } = renderComponent({
                item: OverTimeComparisonTypes.PREVIOUS_PERIOD,
            });

            expect(container.querySelectorAll("div.is-disabled")).toHaveLength(0);
        });

        it("should have class 'is-disabled' when date filter is set to all time", () => {
            const { container } = renderComponent({
                isAllTimeDateFilter: true,
                item: OverTimeComparisonTypes.PREVIOUS_PERIOD,
            });

            expect(container.querySelectorAll("div.is-disabled")).toHaveLength(1);
            expect(container.querySelector(".gd-bubble-trigger")).toBeTruthy();
        });

        it("should has class 'is-selected' when item is same as selected item", () => {
            const { container } = renderComponent({
                item: OverTimeComparisonTypes.PREVIOUS_PERIOD,
                selected: OverTimeComparisonTypes.PREVIOUS_PERIOD,
            });

            expect(container.querySelectorAll("div.is-selected")).toHaveLength(1);
        });
    });

    describe("calling 'onClick'", () => {
        it("should be called", () => {
            const onClick = vi.fn();
            const { container } = renderComponent({ onClick });

            fireEvent.click(container.querySelector(".s-list-item"));

            expect(onClick).toBeCalled();
        });

        it("should be called when isPoPAvailable is set to false", () => {
            const onClick = vi.fn();
            const { container } = renderComponent({ onClick, isPoPAvailable: false });

            fireEvent.click(container.querySelector(".s-list-item"));

            expect(onClick).toBeCalled();
        });

        it("should not be called when isPoPAvailable is set to false and item is not set to NOTHING", () => {
            const onClick = vi.fn();
            const { container } = renderComponent({
                onClick,
                isPoPAvailable: false,
                item: OverTimeComparisonTypes.PREVIOUS_PERIOD,
            });

            fireEvent.click(container.querySelector(".s-list-item"));

            expect(onClick).not.toBeCalled();
        });

        describe("same period previous year", () => {
            it("should be called", () => {
                const onClick = vi.fn();
                const { container } = renderComponent({
                    item: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                    onClick,
                });
                fireEvent.click(container.querySelector(".s-list-item"));

                expect(onClick).toBeCalled();
            });
        });

        describe("previous period", () => {
            it("should be called", () => {
                const onClick = vi.fn();
                const { container } = renderComponent({
                    item: OverTimeComparisonTypes.PREVIOUS_PERIOD,
                    onClick,
                });
                fireEvent.click(container.querySelector(".s-list-item"));

                expect(onClick).toBeCalled();
            });
        });
    });
});
