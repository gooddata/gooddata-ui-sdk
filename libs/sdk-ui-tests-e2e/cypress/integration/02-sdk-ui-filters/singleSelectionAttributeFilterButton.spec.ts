// (C) 2022-2025 GoodData Corporation

import { camelCase } from "lodash-es";

import { AttributeFilterButton } from "../../tools/attributeFilterButton";
import * as Navigation from "../../tools/navigation";

const SEARCH_QUERY = "101 Financial";

const ATTRIBUTE_FILTER_BUTTON_SELECTOR = ".s-attribute-filter.s-opportunity";

// Can be removed once migrated to tiger or once decided that we don't want to migrate the test.
describe.skip("Single selection AttributeFilterButton", { tags: ["pre-merge_isolated_bear"] }, () => {
    beforeEach(() => {
        Navigation.visit("filters/single-selection-attribute-filter-button");
    });

    it("is loaded with preselected item", () => {
        const attributeFilter = new AttributeFilterButton(ATTRIBUTE_FILTER_BUTTON_SELECTOR);
        attributeFilter.titleHasText("Opportunity").subtitleHasText("(mt) Media Temple > CompuSci");
    });

    it("selects only one item immediately after clicking on it", () => {
        const attributeFilter = new AttributeFilterButton(ATTRIBUTE_FILTER_BUTTON_SELECTOR);

        attributeFilter
            .open()
            .selectElement(`.s-attribute-filter-list-item-${camelCase(".decimal > Explorer")}`)
            .titleHasText("Opportunity")
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
