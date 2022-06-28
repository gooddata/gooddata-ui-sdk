// (C) 2022 GoodData Corporation
import * as Navigation from "../../tools/navigation";
import { AttributeFilterConfiguration } from "../../tools/attributeFilterConfig";
import { AttributeFilterButton } from "../../tools/attributeFilterButton";
import { AttributeFilterButtonParentChild } from "../../tools/attributeFilterButtonParentChild";

Cypress.Cookies.defaults({
    preserve: ["GDCAuthTT", "GDCAuthSTT", "_csrfToken"],
});

Cypress.on("uncaught:exception", (error) => {
    // eslint-disable-next-line no-console
    console.error("Uncaught exception cause", error);
    return false;
});

Cypress.Cookies.debug(true);

const ACCOUNT_FILTER_SELECTOR = ".s-attribute-filter.s-account";
const SALES_REP_FILTER_SELECTOR = ".s-attribute-filter.s-sales_rep";
const ACTIVITY_FILTER_SELECTOR = ".s-attribute-filter.s-activity";

const SAVE_CONFIGURATION_BUTTON_SELECTOR = ".s-attribute-filter-dropdown-configuration-save-button";
const ITEM_SALES_REP_SELECTOR = ".s-attribute-filter-dropdown-configuration-item.s-sales_rep";
const CONFIGURATION_SELECTOR = ".s-attribute-filter-dropdown-configuration";

describe("Attribute filter Configuration", () => {
    beforeEach(() => {
        cy.login();

        Navigation.visit("filters/attribute-filter-config");
    });

    it("Change parent filtering configuration", () => {
        const parentAttributeFilters = new AttributeFilterButtonParentChild(
            ACCOUNT_FILTER_SELECTOR,
            SALES_REP_FILTER_SELECTOR,
        );

        parentAttributeFilters.getParentFilter().open().openConfiguration();

        const configuration = new AttributeFilterConfiguration(CONFIGURATION_SELECTOR);
        configuration
            .isSaveButtonDisabled()
            .clickElement(ITEM_SALES_REP_SELECTOR)
            .clickElement(SAVE_CONFIGURATION_BUTTON_SELECTOR);

        parentAttributeFilters.getParentFilter().waitElementsLoaded().openConfiguration();
        configuration.isItemSelected(ITEM_SALES_REP_SELECTOR);

        parentAttributeFilters.getChildFilter().open().openConfiguration();
        configuration.isItemDisabled(".s-attribute-filter-dropdown-configuration-item.s-account");
    });

    it("change connecting attribute configuration", () => {
        const parentAttributeFilters = new AttributeFilterButtonParentChild(
            ACCOUNT_FILTER_SELECTOR,
            SALES_REP_FILTER_SELECTOR,
        );

        parentAttributeFilters.getParentFilter().open().openConfiguration();

        const configuration = new AttributeFilterConfiguration(CONFIGURATION_SELECTOR);

        configuration.clickElement(ITEM_SALES_REP_SELECTOR).isConnectingAttributeDropdown();
        configuration.clickElement(".gd-button.s-opp__snapshot").isConnectingDropdownOpen();
        configuration
            .selectConnectingAttribute(".gd-list-item.s-activity")
            .isConnectingAttributeSelected("Activity")
            .clickElement(SAVE_CONFIGURATION_BUTTON_SELECTOR);

        parentAttributeFilters.getParentFilter().waitElementsLoaded().openConfiguration();
        configuration.isConnectingAttributeSelected("Activity");
    });

    it("change attribute filter display form", () => {
        const attributeFilter = new AttributeFilterButton(ACTIVITY_FILTER_SELECTOR);

        attributeFilter.open().openConfiguration();

        const configuration = new AttributeFilterConfiguration(CONFIGURATION_SELECTOR);
        configuration
            .clickElement(".s-attribute-display-form-button")
            .selectDisplayForm(".gd-list-item.s-attribute-display-form-name-subject")
            .isDisplayFormSelected("Subject")
            .clickElement(SAVE_CONFIGURATION_BUTTON_SELECTOR);
    });
});
