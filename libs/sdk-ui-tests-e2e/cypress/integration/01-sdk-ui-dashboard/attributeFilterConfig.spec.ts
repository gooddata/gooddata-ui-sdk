// (C) 2022 GoodData Corporation
import * as Navigation from "../../tools/navigation";
import { AttributeFilterConfiguration } from "../../tools/attributeFilterConfig";
import { AttributeFilterButton } from "../../tools/attributeFilterButton";
import { AttributeFilterButtonParentChild } from "../../tools/attributeFilterButtonParentChild";
import { EditMode } from "../../tools/editMode";

const ACCOUNT_FILTER_SELECTOR = ".s-attribute-filter.s-account";
const SALES_REP_FILTER_SELECTOR = ".s-attribute-filter.s-sales_rep";
const ACTIVITY_FILTER_SELECTOR = ".s-attribute-filter.s-activity";
const STAGE_NAME_FILTER_SELECTOR = ".s-attribute-filter.s-stage_name";

const ITEM_SALES_REP_SELECTOR = ".s-attribute-filter-dropdown-configuration-item.s-sales_rep";
const CONFIGURATION_SELECTOR = ".s-attribute-filter-dropdown-configuration";
const ORDER_DISPLAY_FORM_VALUE = ".gd-list-item.s-attribute-display-form-name-order";

describe("Attribute filter", () => {
    beforeEach(() => {
        cy.login();
    });
    // eslint-disable-next-line jest/no-disabled-tests
    describe.skip("Attribute filter Configuration", { tags: ["pre-merge_isolated_bear"] }, () => {
        beforeEach(() => {
            Navigation.visit("filters/attribute-filter-config");
        });

        it("Change parent filtering configuration", () => {
            const parentAttributeFilters = new AttributeFilterButtonParentChild(
                ACCOUNT_FILTER_SELECTOR,
                SALES_REP_FILTER_SELECTOR,
            );

            parentAttributeFilters.getParentFilter().open().openConfiguration();

            const configuration = new AttributeFilterConfiguration(CONFIGURATION_SELECTOR);
            configuration.isSaveButtonDisabled().clickElement(ITEM_SALES_REP_SELECTOR).save();

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
                .save();

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
                .save();
        });
    });

    //Cover ticket: RAIL-4671
    describe("Config attribute filter", () => {
        it(
            "Should reset display form value dropdown after cancel attribute panel",
            { tags: ["checklist_integrated_tiger"] },
            () => {
                Navigation.visit("dashboard/stage-name");

                new EditMode().edit();

                const attributeFilter = new AttributeFilterButton(STAGE_NAME_FILTER_SELECTOR);

                attributeFilter.open().openConfiguration();

                const configuration = new AttributeFilterConfiguration(CONFIGURATION_SELECTOR);
                configuration
                    .toggleDisplayFormButton()
                    .selectDisplayForm(ORDER_DISPLAY_FORM_VALUE)
                    .isDisplayFormSelected("Order")
                    .cancel();

                attributeFilter.openConfiguration();
                configuration.isDisplayFormSelected("Stage Name");
            },
        );
    });
});
