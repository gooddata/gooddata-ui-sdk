// (C) 2022-2025 GoodData Corporation

import { AttributeFilterButton } from "../../tools/attributeFilterButton";
import { AttributeFilterButtonParentChild } from "../../tools/attributeFilterButtonParentChild";
import { AttributeFilterConfiguration } from "../../tools/attributeFilterConfig";
import { EditMode } from "../../tools/editMode";
import * as Navigation from "../../tools/navigation";

const ACCOUNT_FILTER_SELECTOR = ".s-attribute-filter.s-account";
const SALES_REP_FILTER_SELECTOR = ".s-attribute-filter.s-sales_rep";
const ACTIVITY_FILTER_SELECTOR = ".s-attribute-filter.s-activity";
const STAGE_NAME_FILTER_SELECTOR = ".s-attribute-filter.s-stage_name";

const SAVE_CONFIGURATION_BUTTON_SELECTOR = ".s-attribute-filter-dropdown-configuration-save-button";
const ITEM_SALES_REP_SELECTOR = ".s-attribute-filter-dropdown-configuration-item.s-sales_rep";
const CONFIGURATION_SELECTOR = ".s-attribute-filter-dropdown-configuration";
const ORDER_DISPLAY_FORM_VALUE = ".gd-list-item.s-attribute-display-form-name-order";

describe("Attribute filter", () => {
    // Can be removed once migrated to tiger or once decided that we don't want to migrate the test.
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

    //Cover ticket: RAIL-4671
    describe("Config attribute filter", () => {
        it(
            "Should reset display form value dropdown after cancel attribute panel",
            { tags: ["checklist_integrated_tiger", "checklist_integrated_tiger_releng"] },
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
