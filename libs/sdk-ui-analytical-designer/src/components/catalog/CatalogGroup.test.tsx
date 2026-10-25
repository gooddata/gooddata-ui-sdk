// (C) 2019-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { withIntl } from "../../utils/with_intl.js";

import { CatalogGroup, type ICatalogGroupProps } from "./CatalogGroup.js";

describe("CatalogGroup", () => {
    const renderComponent = (props = {}) => {
        const Wrapped = withIntl(CatalogGroup);
        return render(<Wrapped {...defaultTestProps} {...props} />);
    };

    const defaultTestProps: ICatalogGroupProps = {
        name: "group name",
        id: "group.id",
        isExpanded: true,
        isLoading: false,
        onClick: (v) => v,
    };

    it("should render the group name with title", () => {
        const { container } = renderComponent();

        expect(container.querySelector(".adi-catalog-group-label").textContent).toBe(defaultTestProps.name);
        expect(container.querySelector(".adi-catalog-group-label")).toHaveAttribute(
            "title",
            defaultTestProps.name,
        );
    });

    it("should add the expanded class when the group is expanded", () => {
        const { container } = renderComponent();

        expect(container.querySelector(".adi-catalog-group-label")).toHaveClass("expanded");
    });

    it("should not add the expanded class when the group is expanded", () => {
        const { container } = renderComponent({ isExpanded: false });

        expect(container.querySelector(".adi-catalog-group-label")).not.toHaveClass("expanded");
    });

    it("should call an event after click on catalog group component", () => {
        const onClick = vi.fn();
        const { container } = renderComponent({ isExpanded: false, onClick });

        fireEvent.click(container.querySelector(".adi-catalog-group-label"));

        expect(onClick).toHaveBeenCalledWith(defaultTestProps.id);
    });

    it("should render spinner when the group is expanded and loading", () => {
        const { container } = renderComponent({ isLoading: true });

        const spinnerWrapper = container.querySelectorAll(".s-gd-spinner");
        expect(spinnerWrapper).toHaveLength(1);
    });

    it("should not render spinner when the group is expanded and loaded", () => {
        const { container } = renderComponent({ isLoading: false });

        const spinnerWrapper = container.querySelectorAll(".s-gd-spinner");
        expect(spinnerWrapper).toHaveLength(0);
    });
});
