// (C) 2023 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";
import { withIntl } from "@gooddata/sdk-ui";
import { describe, it, expect } from "vitest";

import {
    AttributeFilterDropdownButton,
    IAttributeFilterDropdownButtonProps,
} from "../AttributeFilterDropdownButton.js";

describe("Test AttributeFilterDropdownButton", () => {
    function renderComponent(props = {}) {
        const defaultProps: IAttributeFilterDropdownButtonProps = {
            title: "Product name",
            subtitle: "GoodData",
            isOpen: false,
            isLoaded: true,
            isLoading: false,
            isError: false,
        };
        const Wrapped = withIntl(AttributeFilterDropdownButton);
        return render(<Wrapped {...defaultProps} {...props} />);
    }

    it("should render the filter dropdown button at normal state", () => {
        renderComponent();

        expect(document.querySelector(".gd-message")).not.toBeInTheDocument();
    });

    it("should render the filter dropdown button when error state", () => {
        renderComponent({ isError: true });

        expect(document.querySelector(".gd-message")).toBeInTheDocument();
        expect(document.querySelector(".gd-icon-circle-cross")).toBeInTheDocument();
    });
});
