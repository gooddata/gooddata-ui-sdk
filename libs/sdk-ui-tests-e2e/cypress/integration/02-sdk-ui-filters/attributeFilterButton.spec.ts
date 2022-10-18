// (C) 2022 GoodData Corporation
import * as Navigation from "../../tools/navigation";
import { AttributeFilterButton } from "../../tools/attributeFilterButton";
import camelCase from "lodash/camelCase";

const SEARCH_QUERY = "101 Financial";
const INVALID_SEARCH_QUERY = "does not exist";

const ATTRIBUTE_FILTER_BUTTON_SELECTOR = ".s-attribute-filter.s-opportunity";

describe("AttributeFilterButton", () => {
    beforeEach(() => {
        cy.login();

        Navigation.visit("filters/attribute-filter-button");
    });

    it("attribute filter loaded", () => {
        const attributeFilter = new AttributeFilterButton(ATTRIBUTE_FILTER_BUTTON_SELECTOR);
        attributeFilter.titleHasText("Opportunity:").subtitleHasText("All");
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
            .clearSelection()
            .searchElements(SEARCH_QUERY)
            .waitElementsLoaded()
            .selectAll()
            .clickApply()
            .subtitleHasText("101 Financial > Educationly, 101 Financial > WonderKid");
    });

    it("deselect search elements", () => {
        const attributeFilter = new AttributeFilterButton(ATTRIBUTE_FILTER_BUTTON_SELECTOR);

        attributeFilter
            .open()
            .waitElementsLoaded()
            .searchElements(SEARCH_QUERY)
            .waitElementsLoaded()
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
            .waitElementsLoaded()
            .searchElements(SEARCH_QUERY)
            .waitElementsLoaded()
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
            .searchElements(SEARCH_QUERY)
            .waitElementsLoaded()
            .clearSelection()
            .applyDisabled(false);
    });
});
