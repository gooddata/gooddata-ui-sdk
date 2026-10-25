// (C) 2020-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { withIntl } from "../../../utils/with_intl.js";

import { type IRefreshButtonOwnProps, RefreshButton } from "./RefreshButton.js";

describe("RefreshButton", () => {
    const renderComponent = (customProps: Partial<IRefreshButtonOwnProps> = {}) => {
        const props: IRefreshButtonOwnProps = {
            onClick: () => {},
            isVisible: false,
            ...customProps,
        };
        const Wrapper = withIntl(RefreshButton);
        return render(<Wrapper {...props} />);
    };

    it("should call the onClick callback on click", () => {
        const onClick = vi.fn();
        const { container } = renderComponent({ onClick });
        fireEvent.click(container.querySelector(".s-catalog-refresh-button"));
        expect(onClick).toBeCalled();
    });

    it("should not set is-visible className when isVisible prop is falsy", () => {
        const { container } = renderComponent();
        expect(container.querySelector(".s-catalog-refresh-button")).not.toHaveClass("is-visible");
    });

    it("should set is-visible className when isVisible prop is truthy", () => {
        const { container } = renderComponent({ isVisible: true });
        expect(container.querySelector(".s-catalog-refresh-button")).toHaveClass("is-visible");
    });
});
