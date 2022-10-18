// (C) 2022 GoodData Corporation
import { AttributeFilterButtonParentChild } from "../../tools/attributeFilterButtonParentChild";
import * as Navigation from "../../tools/navigation";

const PARENT_FILTER_SELECTOR = ".s-attribute-filter.s-product";
const CHILD_FILTER_SELECTOR = ".s-attribute-filter.s-department";

describe("Parent-child filtering on AttributeFilterButton", () => {
    beforeEach(() => {
        cy.login();

        Navigation.visit("filters/attribute-filter-button-parent-child");
    });

    it("Parent and child filter loaded", () => {
        const parentChildFilters = new AttributeFilterButtonParentChild(
            PARENT_FILTER_SELECTOR,
            CHILD_FILTER_SELECTOR,
        );

        parentChildFilters.getParentFilter().titleHasText("Product:");
        parentChildFilters.getChildFilter().titleHasText("Department:");
    });

    it("Child elements are all filtered out", () => {
        const parentChildFilters = new AttributeFilterButtonParentChild(
            PARENT_FILTER_SELECTOR,
            CHILD_FILTER_SELECTOR,
        );

        parentChildFilters
            .getParentFilter()
            .open()
            .clearSelection()
            .selectElement(".s-attribute-filter-list-item-touchAll")
            .clickApply();
        parentChildFilters.getChildFilter().waitFilteringFinished().subtitleHasText("All");

        parentChildFilters.getChildFilter().open().isAllElementsFilteredByParent().applyDisabled();
    });

    it("Child selection resets to all if parent selection changed", () => {
        const parentChildFilters = new AttributeFilterButtonParentChild(
            PARENT_FILTER_SELECTOR,
            CHILD_FILTER_SELECTOR,
        );

        parentChildFilters
            .getChildFilter()
            .open()
            .clearSelection()
            .selectElement(".s-attribute-filter-list-item-directSales")
            .clickApply()
            .subtitleHasText("Direct Sales");
        parentChildFilters
            .getParentFilter()
            .open()
            .clearSelection()
            .selectElement(".s-attribute-filter-list-item-compuSci")
            .clickApply()
            .subtitleHasText("CompuSci");

        parentChildFilters.getChildFilter().waitFilteringFinished().open().allElementsSelected();
    });
});
