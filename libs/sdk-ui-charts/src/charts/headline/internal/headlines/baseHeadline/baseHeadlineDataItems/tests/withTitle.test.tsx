// (C) 2023 GoodData Corporation
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

import { withTitle } from "../withTitle.js";
import { IWithTitleProps } from "../../../../interfaces/BaseHeadlines.js";
import { TEST_DATA_ITEM, HEADLINE_TITLE_WRAPPER_SELECTOR } from "../../../../tests/TestData.fixtures.js";

describe("withTitle", () => {
    const WrappedComponent = vi.fn();
    const WithTitleComponent = withTitle(WrappedComponent);
    const renderWithTitleComponent = (props: IWithTitleProps) => {
        return render(<WithTitleComponent {...props} />);
    };

    it("Should render with title", () => {
        const { getByText } = renderWithTitleComponent({ dataItem: TEST_DATA_ITEM });
        expect(getByText(TEST_DATA_ITEM.title)).toBeInTheDocument();
    });

    it("Should render without title", () => {
        const { container } = renderWithTitleComponent({
            dataItem: TEST_DATA_ITEM,
            shouldHideTitle: true,
        });
        expect(container.querySelector(HEADLINE_TITLE_WRAPPER_SELECTOR)).not.toBeInTheDocument();
    });

    it("Should render wrapped component", () => {
        renderWithTitleComponent({ dataItem: TEST_DATA_ITEM });
        expect(WrappedComponent).toHaveBeenCalled();
    });
});
