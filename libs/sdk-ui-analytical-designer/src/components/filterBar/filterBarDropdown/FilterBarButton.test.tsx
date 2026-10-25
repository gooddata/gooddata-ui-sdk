// (C) 2019-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { mockIntlProp } from "../../../utils/with_intl.js";

import { FilterBarButton, type IFilterBarButtonProps } from "./FilterBarButton.js";

const customTranslations = {
    "filter_bar_add_filter.tooltip": "Translated add filter title",
};

const DEFAULT_PROPS: IFilterBarButtonProps = {
    isActive: false,
    onClick: () => {},
    intl: mockIntlProp(customTranslations),
    refCallback: () => {},
};

describe("FilterBarButton", () => {
    it("should not add 'is-active' classname when 'isActive' prop is falsy", () => {
        const { container } = render(<FilterBarButton {...DEFAULT_PROPS} />);
        const wrapper = container.querySelector(".s-filter-bar-button");
        expect(wrapper).not.toHaveClass("is-active");
    });

    it("should add 'is-active' classname when 'isActive' prop is truthy", () => {
        const { container } = render(<FilterBarButton {...DEFAULT_PROPS} isActive />);
        const wrapper = container.querySelector(".s-filter-bar-button");
        expect(wrapper).toHaveClass("is-active");
    });

    it("should call 'onClick' prop when button is clicked", () => {
        const onClick = vi.fn();
        const { container } = render(<FilterBarButton {...DEFAULT_PROPS} onClick={onClick} />);
        const button = container.querySelector(".s-filter-bar-button button");
        fireEvent.click(button);
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("should not set any animation class when 'animationTimestamp' prop is undefined", () => {
        const { container } = render(<FilterBarButton {...DEFAULT_PROPS} />);
        expect(container.querySelector(".adi-filter-bar-button-highlight--even")).toBeFalsy();
        expect(container.querySelector(".adi-filter-bar-button-highlight--odd")).toBeFalsy();
    });

    it("should not set any animation class when 'animationTimestamp' prop is null", () => {
        const { container } = render(<FilterBarButton {...DEFAULT_PROPS} animationTimestamp={null} />);
        expect(container.querySelector(".adi-filter-bar-button-highlight--even")).toBeFalsy();
        expect(container.querySelector(".adi-filter-bar-button-highlight--odd")).toBeFalsy();
    });

    it("should set one of animation classes when 'animationTimestamp' prop is set", () => {
        const { container } = render(<FilterBarButton {...DEFAULT_PROPS} animationTimestamp={42} />);

        const hasAnimationClass =
            !!container.querySelector(".adi-filter-bar-button-highlight--even") ||
            !!container.querySelector(".adi-filter-bar-button-highlight--odd");
        expect(hasAnimationClass).toBe(true);
    });

    it("should return the ref of the button DOM node", () => {
        const refCallback = vi.fn();

        render(<FilterBarButton {...DEFAULT_PROPS} refCallback={refCallback} />);

        expect(refCallback).toHaveBeenCalledWith(
            expect.objectContaining({
                tagName: "BUTTON",
            }),
        );
    });
});
