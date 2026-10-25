// (C) 2007-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type OverTimeComparisonType, OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import { getIntlOptions, withIntl } from "../../../../utils/with_intl.js";
import { DROPDOWN_ITEM_HEIGHT } from "../constants.js";

import { TimeComparisonTypesDropdown } from "./TimeComparisonTypesDropdown.js";

describe("TimeComparisonTypesDropdown", () => {
    const customTranslations = {
        "filter.compare.type.dropdown.same_period_previous_year": "test string",
    };

    const TypesDropdownWrapper = withIntl(TimeComparisonTypesDropdown, getIntlOptions(customTranslations));

    const supportedTypes: OverTimeComparisonType[] = [OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR];

    function renderComponent(props = {}) {
        return render(
            <TypesDropdownWrapper
                selectedType={OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR}
                supportedTypes={supportedTypes}
                defaultDialogHeight={100}
                itemHeight={DROPDOWN_ITEM_HEIGHT}
                isAllTimeDateFilter={false}
                {...props}
                isPoPAvailable={false}
            />,
        );
    }

    function clickOnDropdownButton(container: HTMLElement) {
        fireEvent.click(container.querySelector("button.s-comparison-types-button"));
    }

    function renderOpenedDropdown(props = {}) {
        const { container } = renderComponent(props);
        clickOnDropdownButton(container);

        return container;
    }

    it("should render button displaying selected value", () => {
        const container = renderOpenedDropdown();
        expect(container.querySelector(".s-comparison-types-button .gd-button-text").textContent).toEqual(
            "test string",
        );
    });

    it("should render number of options given through props including 'Nothing' option", () => {
        renderOpenedDropdown();
        expect(document.querySelectorAll(".s-list-item")).toHaveLength(supportedTypes.length + 1);
    });

    it("should always render 'Nothing' option as first item in dropdown", () => {
        renderOpenedDropdown();
        expect(document.querySelectorAll(".s-list-item")[0].textContent).toEqual("Nothing");
    });
});
