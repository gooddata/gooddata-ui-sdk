// (C) 2022 GoodData Corporation
import * as Navigation from "../../tools/navigation";
import { AttributeFilterButton } from "../../tools/attributeFilterButton";
import camelCase from "lodash/camelCase";

const SEARCH_QUERY = "101 Financial";
const INVALID_SEARCH_QUERY = "does not exist";

describe("AttributeFilterButton", () => {
    beforeEach(() => {
        cy.login();

        Navigation.visit("filters/attribute-filter-button");
    });

    it("attribute filter loaded", () => {
        const attributeFilter = new AttributeFilterButton();
        attributeFilter.titleHasText("Opportunity").subtitleHasText("All");
    });

    it("attribute filter basic operations", () => {
        const attributeFilter = new AttributeFilterButton();

        attributeFilter.open().clearSelection().subtitleHasText("None").applyDisabled();

        attributeFilter
            .selectElement(camelCase("1000Bulbs.com > Educationly"))
            .selectElement(camelCase("1000Bulbs.com > PhoenixSoft"))
            .selectElement(camelCase("101 Financial > Educationly"))
            .subtitleHasText(
                "1000Bulbs.com > Educationly, 1000Bulbs.com > PhoenixSoft, 101 Financial > Educationly",
            );

        attributeFilter.clickCancel().subtitleHasText("All");
    });

    it("search", () => {
        const attributeFilter = new AttributeFilterButton();

        attributeFilter
            .open()
            .waitElementsLoaded()
            .searchElements(SEARCH_QUERY)
            .waitElementsLoaded()
            .isFilteredElementsCount(2);
    });

    it("select searched elements", () => {
        const attributeFilter = new AttributeFilterButton();

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
        const attributeFilter = new AttributeFilterButton();

        attributeFilter
            .open()
            .waitElementsLoaded()
            .searchElements(SEARCH_QUERY)
            .waitElementsLoaded()
            .clearSelection()
            .subtitleHasText("All except 101 Financial > Educationly, 101 Financial > WonderKid");
    });

    it("search does not modify selection", () => {
        const attributeFilter = new AttributeFilterButton();

        attributeFilter
            .open()
            .waitElementsLoaded()
            .clearSelection()
            .selectElement(camelCase("1000Bulbs.com > Educationly"))
            .selectElement(camelCase("1000Bulbs.com > PhoenixSoft"))
            .selectElement(camelCase("101 Financial > Educationly"))
            .searchElements(SEARCH_QUERY)
            .waitElementsLoaded()
            .subtitleHasText(
                "1000Bulbs.com > Educationly, 1000Bulbs.com > PhoenixSoft, 101 Financial > Educationly",
            );
    });

    it("search elements corresponding with the query", () => {
        const attributeFilter = new AttributeFilterButton();

        attributeFilter
            .open()
            .waitElementsLoaded()
            .searchElements(SEARCH_QUERY)
            .waitElementsLoaded()
            .elementsCorrespondToQuery(SEARCH_QUERY);
    });

    it("search out all elements", () => {
        const attributeFilter = new AttributeFilterButton();

        attributeFilter
            .open()
            .waitElementsLoaded()
            .searchElements(INVALID_SEARCH_QUERY)
            .waitElementsLoaded()
            .isFilteredElementsCount(0)
            .isAllElementsFiltered();
    });

    it("apply not disabled when clear selection on searched out elements", () => {
        const attributeFilter = new AttributeFilterButton();

        attributeFilter
            .open()
            .waitElementsLoaded()
            .searchElements(SEARCH_QUERY)
            .waitElementsLoaded()
            .clearSelection()
            .applyDisabled(false);
    });
});
