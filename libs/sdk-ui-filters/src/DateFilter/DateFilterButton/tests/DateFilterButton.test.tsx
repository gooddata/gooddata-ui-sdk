// (C) 2023-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import * as shared from "../../../shared/components/internal/FilterButtonCustomIcon.js";
import { type IFilterButtonCustomIcon } from "../../../shared/interfaces/index.js";
import { DateFilterButton } from "../DateFilterButton.js";

describe("DateFilterButton", () => {
    const renderComponent = (params: { customIcon?: IFilterButtonCustomIcon } = {}) => {
        const defaultProps = {
            title: "Date filter",
            isMobile: false,
            ...params,
        };

        return render(<DateFilterButton {...defaultProps} />);
    };

    it("should render custom icon", () => {
        const MockCustomIconComponent = vi.spyOn(shared, "FilterButtonCustomIcon");
        const customIcon = {
            icon: "icon",
            tooltip: "tooltip",
        };

        renderComponent({ customIcon });
        expect(MockCustomIconComponent).toHaveBeenCalledWith({ customIcon }, undefined);
    });
});
