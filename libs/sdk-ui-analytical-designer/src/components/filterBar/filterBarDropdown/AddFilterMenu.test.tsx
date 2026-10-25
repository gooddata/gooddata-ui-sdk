// (C) 2026 GoodData Corporation

import { type ComponentProps } from "react";

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { withIntl } from "../../../utils/with_intl.js";

import { AddFilterMenu } from "./AddFilterMenu.js";

const Wrapped = withIntl(AddFilterMenu);

const renderComponent = (props?: Partial<ComponentProps<typeof AddFilterMenu>>) => {
    return render(
        <Wrapped
            onClose={() => {}}
            onAddDateFilter={() => {}}
            onOpenAttributePicker={() => {}}
            onOpenMetricPicker={() => {}}
            onAddRankingFilter={() => {}}
            onOpenRankingMetricPicker={() => {}}
            onOpenParameterPicker={() => {}}
            rankingDisabledReason={undefined}
            isDateItemAvailable
            enableImprovedRankingFilter={false}
            enableParameters={false}
            {...props}
        />,
    );
};

describe("AddFilterMenu - the entries a metric's menu leaves out", () => {
    it("renders every entry for the filter bar by default", () => {
        const { container } = renderComponent();
        expect(container.querySelector(".s-add-filter-menu-item-metric")).not.toBeNull();
        expect(container.querySelector(".s-add-filter-menu-item-ranking")).not.toBeNull();
    });

    it("leaves out the metric and ranking entries when told to", () => {
        const { container } = renderComponent({ showMetricItem: false, showRankingItem: false });
        expect(container.querySelector(".s-add-filter-menu-item-date")).not.toBeNull();
        expect(container.querySelector(".s-add-filter-menu-item-attribute")).not.toBeNull();
        expect(container.querySelector(".s-add-filter-menu-item-metric")).toBeNull();
        expect(container.querySelector(".s-add-filter-menu-item-ranking")).toBeNull();
    });

    it("disables the attribute entry when no more attribute filters fit", () => {
        const { container } = renderComponent({ isAttributeItemAvailable: false });
        expect(
            container.querySelector(".s-add-filter-menu-item-attribute").getAttribute("aria-disabled"),
        ).toBe("true");
    });

    it("explains a disabled date entry with its tooltip anchor", () => {
        const { container } = renderComponent({ isDateItemAvailable: false, dateDisabledTooltip: "Why not" });
        const date = container.querySelector(".s-add-filter-menu-item-date");
        expect(date.getAttribute("aria-disabled")).toBe("true");
        // focusable, so the tooltip is reachable by keyboard too
        expect(date.hasAttribute("disabled")).toBe(false);
        expect(date.closest(".adi-add-filter-menu-item__tooltip-anchor")).not.toBeNull();
    });

    it("explains a disabled attribute entry with its tooltip anchor", () => {
        const { container } = renderComponent({
            isAttributeItemAvailable: false,
            attributeDisabledTooltip: "Full",
        });
        const attribute = container.querySelector(".s-add-filter-menu-item-attribute");
        expect(attribute.closest(".adi-add-filter-menu-item__tooltip-anchor")).not.toBeNull();
    });

    it("ignores clicks on a disabled entry", () => {
        const onOpenAttributePicker = vi.fn();
        const { container } = renderComponent({ isAttributeItemAvailable: false, onOpenAttributePicker });
        fireEvent.click(container.querySelector(".s-add-filter-menu-item-attribute"));
        expect(onOpenAttributePicker).not.toHaveBeenCalled();
    });
});

describe("AddFilterMenu - parameters", () => {
    it("should not render the Parameter item when enableParameters is false", () => {
        const { container } = renderComponent({ enableParameters: false });
        expect(container.querySelector(".s-add-filter-menu-item-parameter")).toBeNull();
    });

    it("should render the Parameter item when enableParameters is true", () => {
        const { container } = renderComponent({ enableParameters: true });
        expect(container.querySelector(".s-add-filter-menu-item-parameter")).not.toBeNull();
    });

    it("should render a separator between filter items and the Parameter item", () => {
        const { container } = renderComponent({ enableParameters: true });
        expect(container.querySelector(".s-add-filter-menu-separator")).not.toBeNull();
    });

    it("should call onOpenParameterPicker when the Parameter item is clicked", () => {
        const onOpenParameterPicker = vi.fn();
        const { container } = renderComponent({
            enableParameters: true,
            onOpenParameterPicker,
        });

        fireEvent.click(container.querySelector(".s-add-filter-menu-item-parameter")!);

        expect(onOpenParameterPicker).toHaveBeenCalledTimes(1);
    });
});
