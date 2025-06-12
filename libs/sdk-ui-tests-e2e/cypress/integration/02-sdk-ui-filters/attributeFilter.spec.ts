// (C) 2022-2024 GoodData Corporation
import { AttributeFilterParentChild } from "../../tools/attributeFilterParentChild";
import * as Navigation from "../../tools/navigation";

const PARENT_FILTER_SELECTOR = "button.s-product";
const CHILD_FILTER_SELECTOR = "button.s-department";

// Can be removed once migrated to tiger or once decided that we don't want to migrate the test.
// eslint-disable-next-line jest/no-disabled-tests
describe.skip("Parent-child filtering on AttributeFilter", { tags: ["post-merge_integrated_bear"] }, () => {
    beforeEach(() => {
        Navigation.visit("filters/attribute-filter-parent-child-example");
    });

    it("check right resetting of children filters", () => {
        const parentChildFilters = new AttributeFilterParentChild(
            PARENT_FILTER_SELECTOR,
            CHILD_FILTER_SELECTOR,
        );

        parentChildFilters.getParentFilter().open().searchAndSelectFilterItem("CompuSci", true).clickApply();

        parentChildFilters
            .getChildFilter()
            .open()
            .searchAndSelectFilterItem("Direct Sales", true)
            .clickApply();

        cy.get(".f-parent .count").should("have.text", "1");
        cy.get(".f-child .count").should("have.text", "1");

        parentChildFilters.getParentFilter().open().selectAll().clickApply();

        cy.get(".f-parent .count").should("have.text", "0");
        cy.get(".f-child .count").should("have.text", "0");
    });
});
