// (C) 2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { withIntl } from "../../../utils/with_intl.js";
import { withRedux } from "../../../utils/with_redux.js";

import { FilterBarDropdownBody, type IFilterBarDropdownBodyProps } from "./FilterBarDropdownBody.js";

const DEFAULT_PROPS: IFilterBarDropdownBodyProps = {
    onClose: () => {},
    onAddFilters: () => {},
    onAddDateFilter: () => {},
    onAddRankingFilter: () => {},
    onAddRankingFilterFromMetric: () => {},
    onAddParameters: () => {},
    enableParameters: false,
    rankingDisabledReason: undefined,
    buttonNode: document.createElement("button"),
    enableImprovedRankingFilter: false,
    isDateItemAvailable: true,
};

const mountComponent = (props?: Partial<IFilterBarDropdownBodyProps>) => {
    const Wrapped = withRedux(withIntl(FilterBarDropdownBody));
    return render(<Wrapped {...DEFAULT_PROPS} {...props} />);
};

describe("FilterBarDropdownBody", () => {
    it("renders add filter menu by default", () => {
        mountComponent();
        expect(document.querySelector(".s-add-filter-menu-item-date")).toBeInTheDocument();
        expect(document.querySelector(".s-add-filter-menu-item-attribute")).toBeInTheDocument();
        expect(document.querySelector(".s-add-filter-menu-item-metric")).toBeInTheDocument();
    });

    it("renders ranking menu item when enabled", () => {
        mountComponent({ rankingDisabledReason: undefined });
        expect(document.querySelector(".s-add-filter-menu-item-ranking")).toBeInTheDocument();
    });

    it("calls add date handler when date menu item is clicked", () => {
        const onAddDateFilter = vi.fn();
        mountComponent({ onAddDateFilter });
        fireEvent.click(document.querySelector(".s-add-filter-menu-item-date"));
        expect(onAddDateFilter).toHaveBeenCalledTimes(1);
    });
});
