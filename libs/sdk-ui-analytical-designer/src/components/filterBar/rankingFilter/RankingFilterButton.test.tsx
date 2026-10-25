// (C) 2020-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { removeMetadata } from "@gooddata/util";

import rawTranslations from "../../../translations/en-US.json" with { type: "json" };

import {
    buttonValueWithAttribute,
    buttonValueWithSequenceAndAttribute,
    buttonValueWithoutAttribute,
} from "./RankingFilter.test.helpers.js";
import { type IRankingFilterButtonProps, RankingFilterButton } from "./RankingFilterButton.js";

const defaultProps: IRankingFilterButtonProps = {
    model: buttonValueWithoutAttribute,
    onClick: () => {},
    isActive: false,
    className: "s-rf-dropdown-toggle-button",
};

const translations = removeMetadata(rawTranslations);

const NBSP = "\u00a0";
const RF_BUTTON_TITLE = ".s-rf-title";
const RF_BUTTON_CONFIGURATION = ".s-rf-configuration";

const renderComponent = (props?: Partial<IRankingFilterButtonProps>) => {
    return render(
        <IntlProvider locale="en-US" messages={translations}>
            <RankingFilterButton {...defaultProps} {...props} />
        </IntlProvider>,
    );
};

describe("RankingFilterButton", () => {
    it("should call onClick on button click", () => {
        const onClick = vi.fn();
        const { container } = renderComponent({ onClick });

        fireEvent.click(container.querySelector(".s-filter-button"));

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("should render correct text without attribute title and measure sequence", () => {
        const { container } = renderComponent();

        expect(container.querySelector(RF_BUTTON_TITLE).textContent).toBe(`Top 10 records`);
        expect(container.querySelector(RF_BUTTON_CONFIGURATION).textContent).toEqual("by Measure 1");
    });
    it("should render correct text with attribute title", () => {
        const { container } = renderComponent({ model: buttonValueWithAttribute });

        expect(container.querySelector(RF_BUTTON_TITLE).textContent).toBe(`Top 10 out of Attribute 1`);
        expect(container.querySelector(RF_BUTTON_CONFIGURATION).textContent).toEqual(`based on Measure 1`);
    });
    it("should render correct text with measure sequence", () => {
        const { container } = renderComponent({ model: buttonValueWithSequenceAndAttribute });

        expect(container.querySelector(RF_BUTTON_TITLE).textContent).toBe(`Bottom 10 out of Attribute 1`);
        expect(container.querySelector(RF_BUTTON_CONFIGURATION).textContent).toEqual(
            `based on Measure 1${NBSP}(M1)`,
        );
    });
});
