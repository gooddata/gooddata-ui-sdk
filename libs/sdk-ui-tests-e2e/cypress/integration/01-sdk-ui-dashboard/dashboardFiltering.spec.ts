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

// eslint-disable-next-line jest/no-disabled-tests
describe.skip("Dashboard Filtering", () => {
    beforeEach(() => {
        cy.login();

        Navigation.visit("dashboard/filtering");
    });

    it("AttributeFilterButton on dashboard (SEPARATE)", () => {
        const parentAttributeFilters = new AttributeFilterButtonParentChild(
            PARENT_FILTER_SELECTOR,
            CHILD_FILTER_SELECTOR,
        );
        const headline = new Headline(".s-dash-item.viz-type-headline");

        parentAttributeFilters.getParentFilter().titleHasText("Product").subtitleHasText("All");
        parentAttributeFilters.getChildFilter().titleHasText("Department").subtitleHasText("All");

        // wait until filters applied to headline
        cy.wait(200);

        headline.waitLoaded().hasValue("$38,310,753.45");

        parentAttributeFilters
            .getParentFilter()
            .open()
            .waitElementsLoaded()
            .clearSelection()
            .selectElement(".s-touchall")
            .clickApply();
        parentAttributeFilters
            .getChildFilter()
            .waitFilteringFinished()
            .subtitleHasText("All")
            .open()
            .isAllElementsFilteredByParent();
        // wait until filters applied to headline
        cy.wait(200);

        headline.waitLoaded().isValue();
    });

    it("Headline value changes after filters change (SEPARATE)", () => {
        const parentAttributeFilters = new AttributeFilterButtonParentChild(
            PARENT_FILTER_SELECTOR,
            CHILD_FILTER_SELECTOR,
        );
        const headline = new Headline(".s-dash-item.viz-type-headline");

        parentAttributeFilters.getParentFilter().titleHasText("Product").subtitleHasText("All");
        parentAttributeFilters.getChildFilter().titleHasText("Department").subtitleHasText("All");

        // wait until filters applied to headline
        cy.wait(200);

        headline.waitLoaded().hasValue("$38,310,753.45");

        parentAttributeFilters
            .getParentFilter()
            .open()
            .clearSelection()
            .selectElement(".s-compusci")
            .clickApply();

        // wait until filters applied to headline
        cy.wait(200);

        headline.waitLoaded().hasValue("$9,237,969.87");

        parentAttributeFilters
            .getChildFilter()
            .open()
            .clearSelection()
            .selectElement(".s-direct_sales")
            .clickApply();

        // wait until filters applied to headline
        cy.wait(200);
        headline.waitLoaded().hasValue("$6,111,808.02");
    });
});
