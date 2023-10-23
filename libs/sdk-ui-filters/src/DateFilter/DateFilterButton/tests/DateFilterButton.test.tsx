// (C) 2023 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";
import { DateFilterButton } from "../DateFilterButton.js";
import { IFilterButtonCustomIcon } from "../../../shared/index.js";
import { describe, it, expect, vi } from "vitest";
import * as shared from "../../../shared/index.js";

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
        expect(MockCustomIconComponent).toHaveBeenCalledWith({ customIcon }, {});
    });
});
