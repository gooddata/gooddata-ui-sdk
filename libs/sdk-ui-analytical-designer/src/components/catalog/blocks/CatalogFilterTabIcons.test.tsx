// (C) 2021-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { withIntl } from "../../../utils/with_intl.js";
import { TabIconGroups, TabIcons } from "../model/catalogFilter.js";

import { CatalogFilterTabIcons } from "./CatalogFilterTabIcons.js";

describe("Catalog filter tab icons", () => {
    const filters = [
        {
            name: TabIcons.METRICS,
            label: TabIconGroups.METRIC_FACT,
        },
        {
            name: TabIcons.FACTS,
            label: TabIconGroups.METRIC_FACT,
        },
        {
            name: TabIcons.ATTRIBUTES,
            label: TabIconGroups.ATTRIBUTE,
        },
    ];

    const onSelect = vi.fn();
    const activeTabs = [true, false, false];

    function renderComponent() {
        const Wrapped = withIntl(CatalogFilterTabIcons);
        return render(<Wrapped onSelect={onSelect} availableTabs={filters} activeTabs={activeTabs} />);
    }

    it("should find active component", () => {
        const { container } = renderComponent();

        const activeFilter = container.querySelector(".is-active");

        expect(activeFilter).toHaveClass("s-filter-metrics");
    });

    it("should call onSelect method when clicking non active index", () => {
        const { container } = renderComponent();

        const filterItems = container.querySelectorAll(".s-filter-item");

        expect(filterItems).toHaveLength(3);

        fireEvent.click(filterItems[0]);

        expect(onSelect).toHaveBeenCalledTimes(1);
    });
});
