// (C) 2022 GoodData Corporation
import * as Navigation from "../../tools/navigation";

import { AttributeFilterButton } from "../../tools/attributeFilterButton";
import camelCase from "lodash/camelCase";

const SEARCH_QUERY = "101 Financial";

const ATTRIBUTE_FILTER_BUTTON_SELECTOR = ".s-attribute-filter.s-opportunity";

describe("Single selection AttributeFilterButton", { tags: ["pre-merge_isolated_bear"] }, () => {
    beforeEach(() => {
        cy.login();

        Navigation.visit("filters/single-selection-attribute-filter-button");
    });

    it("is loaded with preselected item", () => {
        const attributeFilter = new AttributeFilterButton(ATTRIBUTE_FILTER_BUTTON_SELECTOR);
        attributeFilter.titleHasText("Opportunity:").subtitleHasText("(mt) Media Temple > CompuSci");
    });

    it("selects only one item immediately after clicking on it", () => {
        const attributeFilter = new AttributeFilterButton(ATTRIBUTE_FILTER_BUTTON_SELECTOR);

        attributeFilter
            .selectElement(`.s-attribute-filter-list-item-${camelCase(".decimal > Explorer")}`)
            .titleHasText("Opportunity:")
            .subtitleHasText(".decimal > Explorer");
    });

    it("search", () => {
        const attributeFilter = new AttributeFilterButton(ATTRIBUTE_FILTER_BUTTON_SELECTOR);

        attributeFilter
            .open()
            .waitElementsLoaded()
            .searchElements(SEARCH_QUERY)
            .waitElementsLoaded()
            .isFilteredElementsCount(2);
    });
});
