// (C) 2022 GoodData Corporation
import { AttributeFilterParentChild } from "../../tools/attributeFilterParentChild";
import * as Navigation from "../../tools/navigation";

const PARENT_FILTER_SELECTOR = "button.s-product";
const CHILD_FILTER_SELECTOR = "button.s-department";

describe(
    "Parent-child filtering on Single selection AttributeFilter",
    { tags: ["pre-merge_isolated_bear"] },
    () => {
        beforeEach(() => {
            cy.login();

            Navigation.visit("filters/single-selection-attribute-filter-parent-child");
        });

        it("check right resetting of children filters", () => {
            const parentChildFilters = new AttributeFilterParentChild(
                PARENT_FILTER_SELECTOR,
                CHILD_FILTER_SELECTOR,
            );

            parentChildFilters
                .getParentFilter()
                .open()
                .searchAndSelectFilterItem("CompuSci", true)
                .clickApply();

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

        it("it handles all child elements filtered out by parent", () => {
            const parentChildFilters = new AttributeFilterParentChild(
                PARENT_FILTER_SELECTOR,
                CHILD_FILTER_SELECTOR,
            );

            parentChildFilters
                .getParentFilter()
                .open()
                .searchAndSelectFilterItem("TouchAll", true)
                .clickApply();

            parentChildFilters.getChildFilter().open().isAllElementsFilteredByParent();

            cy.get(".f-parent .count").should("have.text", "1");
            cy.get(".f-child .count").should("have.text", "0");
        });
    },
);
