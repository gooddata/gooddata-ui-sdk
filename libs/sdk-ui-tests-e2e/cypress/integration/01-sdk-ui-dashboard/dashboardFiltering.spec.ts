// (C) 2022 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { AttributeFilterButtonParentChild } from "../../tools/attributeFilterButtonParentChild";
import { Headline } from "../../tools/headline";

Cypress.Cookies.defaults({
    preserve: ["GDCAuthTT", "GDCAuthSTT", "_csrfToken"],
});

Cypress.on("uncaught:exception", (error) => {
    // eslint-disable-next-line no-console
    console.error("Uncaught exception cause", error);
    return false;
});

Cypress.Cookies.debug(true);
const PARENT_FILTER_SELECTOR = ".s-attribute-filter.s-product";
const CHILD_FILTER_SELECTOR = ".s-attribute-filter.s-department";

describe("Dashboard Filtering", () => {
    beforeEach(() => {
        cy.login();

        Navigation.visit("dashboard/filtering");
    });

    it("AttributeFilterButton on dashboard", () => {
        const parentAttributeFilters = new AttributeFilterButtonParentChild(
            PARENT_FILTER_SELECTOR,
            CHILD_FILTER_SELECTOR,
        );
        const headline = new Headline();

        parentAttributeFilters.getParentFilter().titleHasText("Product").subtitleHasText("All");
        parentAttributeFilters.getChildFilter().titleHasText("Department").subtitleHasText("All");

        headline.hasValue("$38,310,753.45");

        parentAttributeFilters
            .getParentFilter()
            .open()
            .waitElementsLoaded()
            .clearSelection()
            .selectElement("touchAll")
            .clickApply();
        parentAttributeFilters
            .getChildFilter()
            .waitFilteringFinished()
            .subtitleHasText("All")
            .open()
            .isAllElementsFilteredByParent();
        headline.noValue();
    });

    it("Headline value changes after filters change", () => {
        const parentAttributeFilters = new AttributeFilterButtonParentChild(
            PARENT_FILTER_SELECTOR,
            CHILD_FILTER_SELECTOR,
        );
        const headline = new Headline();

        parentAttributeFilters.getParentFilter().titleHasText("Product").subtitleHasText("All");
        parentAttributeFilters.getChildFilter().titleHasText("Department").subtitleHasText("All");

        headline.hasValue("$38,310,753.45");

        parentAttributeFilters
            .getParentFilter()
            .open()
            .clearSelection()
            .selectElement("compuSci")
            .clickApply();
        headline.hasValue("$9,237,969.87");

        parentAttributeFilters
            .getChildFilter()
            .open()
            .clearSelection()
            .selectElement("directSales")
            .clickApply();
        headline.hasValue("$6,111,808.02");
    });
});
