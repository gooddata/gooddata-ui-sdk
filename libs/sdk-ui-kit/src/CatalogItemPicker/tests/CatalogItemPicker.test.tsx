// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { CatalogItemPicker } from "../CatalogItemPicker.js";
import { type ICatalogItemPickerItem, type ICatalogItemPickerItems } from "../types.js";

const messages = {
    "filter_bar_add_filter.attribute.title": "Add attribute filter",
    "filter_bar_add_filter.metric.title": "Add metric filter",
    "filter_bar_add_filter.no_results": "No results",
    "filter_bar_add_filter.no_items": "No items",
    "filter_bar_add_filter.section.from_visualization": "From visualization",
    "filter_bar_add_filter.button.add": "Add",
    "filter_bar_add_filter.attribute.no_selection": "Pick something",
    "filter_bar_add_filter.metric.no_selection": "Pick something",
    "filter_bar_add_filter.menu.attribute": "Attributes",
    "filter_bar_add_filter.menu.date": "Dates",
    "filter_bar_add_filter.menu.metric": "Metrics",
    "mvf.attributePicker.title": "Pick items",
    "mvf.attributePicker.noResults": "No results",
    "mvf.attributePicker.noItems": "No items",
    "mvf.dimensionality.section.fromVisualization": "From visualization",
    "mvf.attributePicker.dateAs": "Date dataset",
    "mvf.attributePicker.filter.attributes": "Attributes",
    "mvf.attributePicker.filter.dates": "Dates",
    "gs.list.search.placeholder": "Search",
    "gs.list.acessibility.search.label": "Search",
    "gs.list.back": "Back",
    cancel: "Cancel",
    "catalog.group_title.ungrouped": "Ungrouped",
};

function renderWithIntl(ui: ReactElement) {
    return render(
        <IntlProvider locale="en" messages={messages}>
            {ui}
        </IntlProvider>,
    );
}

const createAttributeItems = (): ICatalogItemPickerItems<string> => {
    const insightItems: ICatalogItemPickerItem<string>[] = [
        { id: "attr-1", title: "Attr 1", type: "attribute", payload: "attr-1" },
    ];
    return { insightItems, catalogItems: [] };
};

const createMetricItems = (): ICatalogItemPickerItems<string> => {
    const insightItems: ICatalogItemPickerItem<string>[] = [
        { id: "metric-1", title: "Metric 1", type: "metric", payload: "metric-1" },
    ];
    const catalogItems: ICatalogItemPickerItem<string>[] = [
        { id: "metric-2", title: "Metric 2", type: "metric", payload: "metric-2" },
    ];
    return { insightItems, catalogItems };
};

const createAttributeItemsWithDate = (): ICatalogItemPickerItems<string> => ({
    insightItems: [],
    catalogItems: [
        {
            id: "attr-1",
            title: "Attr 1",
            type: "attribute",
            payload: "attr-1",
        },
        {
            id: "date-1",
            title: "Date 1",
            type: "date",
            payload: "date-1",
            dataset: { identifier: { identifier: "dataset" }, title: "Dataset" },
        },
    ],
});

describe("CatalogItemPicker", () => {
    it("calls onSelect in single-select mode and hides multi-select UI", () => {
        const onSelect = vi.fn();
        renderWithIntl(
            <CatalogItemPicker
                itemTypes={["attribute"]}
                selectionMode="single"
                attributeItems={createAttributeItems()}
                onClose={vi.fn()}
                onSelect={onSelect}
            />,
        );

        fireEvent.click(screen.getByText("Attr 1"));
        expect(onSelect).toHaveBeenCalledWith("attr-1");
        expect(screen.queryByTestId("s-catalog-item-picker-add")).not.toBeInTheDocument();
        expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    });

    it("collects selected items in multi-select mode", () => {
        const onAdd = vi.fn();
        renderWithIntl(
            <CatalogItemPicker
                itemTypes={["metric"]}
                selectionMode="multiple"
                metricItems={createMetricItems()}
                onClose={vi.fn()}
                onAdd={onAdd}
            />,
        );

        fireEvent.click(screen.getByText("Metric 1"));
        fireEvent.click(screen.getByTestId("s-catalog-item-picker-add"));
        expect(onAdd).toHaveBeenCalledWith(["metric-1"]);
        // Each list item has its own checkbox in multi-select mode
        expect(screen.getAllByRole("checkbox").length).toBeGreaterThan(0);
    });

    it("shows tabs only when multiple item types are provided", () => {
        renderWithIntl(
            <CatalogItemPicker
                itemTypes={["attribute", "date"]}
                selectionMode="single"
                attributeItems={createAttributeItemsWithDate()}
                onClose={vi.fn()}
                variant="mvf"
            />,
        );

        expect(screen.getByTestId("s-catalog-item-picker-tab-0")).toBeInTheDocument();
        expect(screen.getByTestId("s-catalog-item-picker-tab-1")).toBeInTheDocument();
    });
});
