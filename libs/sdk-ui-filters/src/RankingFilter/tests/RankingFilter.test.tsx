// (C) 2020-2025 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { withIntl } from "@gooddata/sdk-ui";

import {
    attributeItems as mockAttributeItems,
    defaultFilter as mockDefaultFilter,
    measureItems as mockMeasureItems,
} from "./mocks.js";
import { type IRankingFilterProps, RankingFilter } from "../RankingFilter.js";

const DROPDOWN_BODY = ".s-rf-dropdown-body";

const renderComponent = (props?: Partial<IRankingFilterProps>) => {
    const defaultProps: IRankingFilterProps = {
        measureItems: mockMeasureItems,
        attributeItems: mockAttributeItems,
        filter: mockDefaultFilter,
        onApply: () => {},
        onCancel: () => {},
        buttonTitle: "Ranking Filter",
    };
    const Wrapped = withIntl(RankingFilter);
    return render(<Wrapped {...defaultProps} {...props} />);
};

describe("RankingFilter", () => {
    it("should render a button with provided title", () => {
        renderComponent({ buttonTitle: "My title" });

        expect(screen.getByText("My title")).toBeInTheDocument();
    });

    it("should open and close dropdown on button click", () => {
        renderComponent();

        const button = screen.getByText("Ranking Filter");
        expect(document.querySelector(DROPDOWN_BODY)).not.toBeInTheDocument();

        fireEvent.click(button);
        expect(document.querySelector(DROPDOWN_BODY)).toBeInTheDocument();

        fireEvent.click(button);
        expect(document.querySelector(DROPDOWN_BODY)).not.toBeInTheDocument();
    });
});
