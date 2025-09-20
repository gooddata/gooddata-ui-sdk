// (C) 2022-2025 GoodData Corporation
import { camelCase } from "lodash-es";

import { AttributeFilterButton } from "../../tools/attributeFilterButton";
import * as Navigation from "../../tools/navigation";

const SEARCH_QUERY = "101 Financial";
const INVALID_SEARCH_QUERY = "does not exist";

const ATTRIBUTE_FILTER_BUTTON_SELECTOR = ".s-attribute-filter.s-opportunity";

// Can be removed once migrated to tiger or once decided that we don't want to migrate the test.
// eslint-disable-next-line jest/no-disabled-tests
describe.skip("AttributeFilterButton", { tags: ["pre-merge_isolated_bear"] }, () => {
    beforeEach(() => {
        Navigation.visit("filters/attribute-filter-button");
    });

    it("attribute filter loaded", () => {
        const attributeFilter = new AttributeFilterButton(ATTRIBUTE_FILTER_BUTTON_SELECTOR);
        attributeFilter.titleHasText("Opportunity").subtitleHasText("All");
    });

    it("attribute filter basic operations", () => {
        const attributeFilter = new AttributeFilterButton(ATTRIBUTE_FILTER_BUTTON_SELECTOR);

        attributeFilter.open().clearSelection().statusHasNone().applyDisabled();

        attributeFilter
            .selectElement(`.s-attribute-filter-list-item-${camelCase(".decimal > Explorer")}`)
            .selectElement(`.s-attribute-filter-list-item-${camelCase("(add)ventures > CompuSci")}`)
            .selectElement(`.s-attribute-filter-list-item-${camelCase("(mt) Media Temple > CompuSci")}`)
            .statusHasText(".decimal > Explorer, (add)ventures > CompuSci, (mt) Media Temple > CompuSci");

        attributeFilter.clickCancel().subtitleHasText("All");
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

    it("select searched elements", () => {
        const attributeFilter = new AttributeFilterButton(ATTRIBUTE_FILTER_BUTTON_SELECTOR);

        attributeFilter
            .open()
            .waitElementsLoaded()
            .hasFilterListSize(6527)
            .clearSelection()
            .searchElements(SEARCH_QUERY)
            .waitElementsLoaded()
            .hasFilterListSize(2)
            .isFilteredElementsCount(2)
            .selectAll()
            .clickApply()
            .subtitleHasText("101 Financial > Educationly, 101 Financial > WonderKid");
    });

    it("deselect search elements", () => {
        const attributeFilter = new AttributeFilterButton(ATTRIBUTE_FILTER_BUTTON_SELECTOR);

        attributeFilter
            .open()
            .waitElementsLoaded()
            .hasFilterListSize(6527)
            .searchElements(SEARCH_QUERY)
            .waitElementsLoaded()
            .hasFilterListSize(2)
            .isFilteredElementsCount(2)
            .clearSelection()
            .clickApply()
            .subtitleHasText("All except 101 Financial > Educationly, 101 Financial > WonderKid");
    });

    it("search does not modify selection", () => {
        const attributeFilter = new AttributeFilterButton(ATTRIBUTE_FILTER_BUTTON_SELECTOR);

        attributeFilter
            .open()
            .waitElementsLoaded()
            .clearSelection()
            .selectElement(`.s-attribute-filter-list-item-${camelCase(".decimal > Explorer")}`)
            .selectElement(`.s-attribute-filter-list-item-${camelCase("(add)ventures > CompuSci")}`)
            .selectElement(`.s-attribute-filter-list-item-${camelCase("(mt) Media Temple > CompuSci")}`)
            .searchElements(SEARCH_QUERY)
            .waitElementsLoaded()
            .statusHasText(".decimal > Explorer, (add)ventures > CompuSci, (mt) Media Temple > CompuSci");
    });

    it("search elements corresponding with the query", () => {
        const attributeFilter = new AttributeFilterButton(ATTRIBUTE_FILTER_BUTTON_SELECTOR);

        attributeFilter
            .open()
            .hasFilterListSize(6527)
            .searchElements(SEARCH_QUERY)
            .hasFilterListSize(2)
            .elementsCorrespondToQuery(SEARCH_QUERY);
    });

    it("search out all elements", () => {
        const attributeFilter = new AttributeFilterButton(ATTRIBUTE_FILTER_BUTTON_SELECTOR);

        attributeFilter
            .open()
            .waitElementsLoaded()
            .searchElements(INVALID_SEARCH_QUERY)
            .waitElementsLoaded()
            .isFilteredElementsCount(0)
            .isAllElementsFiltered();
    });

    it("apply not disabled when clear selection on searched out elements", () => {
        const attributeFilter = new AttributeFilterButton(ATTRIBUTE_FILTER_BUTTON_SELECTOR);

        attributeFilter
            .open()
            .waitElementsLoaded()
            .hasFilterListSize(6527)
            .searchElements(SEARCH_QUERY)
            .waitElementsLoaded()
            .hasFilterListSize(2)
            .isFilteredElementsCount(2)
            .clearSelection()
            .applyDisabled(false);
    });
});
