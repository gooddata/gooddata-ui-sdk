// (C) 2022 GoodData Corporation
import { AttributeFilterButtonParentChild } from "../../tools/attributeFilterButtonParentChild";
import * as Navigation from "../../tools/navigation";

const PARENT_FILTER_SELECTOR = ".s-attribute-filter.s-product";
const CHILD_FILTER_SELECTOR = ".s-attribute-filter.s-department";

describe("Parent-child filtering on AttributeFilterButton", () => {
    beforeEach(() => {
        cy.login();

        Navigation.visit("filters/parent-child-filters-with-placeholder");
    });

    it("Parent and child filter loaded", () => {
        const parentChildFilters = new AttributeFilterButtonParentChild(
            PARENT_FILTER_SELECTOR,
            CHILD_FILTER_SELECTOR,
        );

        parentChildFilters.getParentFilter().titleHasText("Product");
        parentChildFilters.getChildFilter().titleHasText("Department");
    });

    it("Child elements are all filtered out", () => {
        const parentChildFilters = new AttributeFilterButtonParentChild(
            PARENT_FILTER_SELECTOR,
            CHILD_FILTER_SELECTOR,
        );

        parentChildFilters
            .getParentFilter()
            .open()
            .waitElementsLoaded()
            .waitElementsLoaded()
            .clearSelection()
            .selectElement("touchAll")
            .clickApply();
        parentChildFilters.getChildFilter().waitFilteringFinished().subtitleHasText("All");

        parentChildFilters
            .getChildFilter()
            .open()
            .waitElementsLoaded()
            .isAllElementsFilteredByParent()
            .applyDisabled();
    });

    it("Child selection resets to all if parent selection changed", () => {
        const parentChildFilters = new AttributeFilterButtonParentChild(
            PARENT_FILTER_SELECTOR,
            CHILD_FILTER_SELECTOR,
        );

        parentChildFilters
            .getChildFilter()
            .open()
            .waitElementsLoaded()
            .clearSelection()
            .selectElement("directSales")
            .clickApply()
            .subtitleHasText("Direct Sales");
        parentChildFilters
            .getParentFilter()
            .open()
            .waitElementsLoaded()
            .clearSelection()
            .selectElement("compuSci")
            .clickApply()
            .subtitleHasText("CompuSci");

        parentChildFilters
            .getChildFilter()
            .waitFilteringFinished()
            .open()
            .waitElementsLoaded()
            .allElementsSelected();
    });
});
