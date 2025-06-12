// (C) 2020-2023 GoodData Corporation
import React from "react";
import { withIntl } from "@gooddata/sdk-ui";
import { fireEvent, render, screen } from "@testing-library/react";
import noop from "lodash/noop.js";
import { IRankingFilterProps, RankingFilter } from "../RankingFilter.js";
import { describe, it, expect } from "vitest";

import * as Mock from "./mocks.js";

const DROPDOWN_BODY = ".s-rf-dropdown-body";

const renderComponent = (props?: Partial<IRankingFilterProps>) => {
    const defaultProps: IRankingFilterProps = {
        measureItems: Mock.measureItems,
        attributeItems: Mock.attributeItems,
        filter: Mock.defaultFilter,
        onApply: noop,
        onCancel: noop,
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
