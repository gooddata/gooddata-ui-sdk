// (C) 2022 GoodData Corporation
import * as Navigation from "../../tools/navigation";
import { AttributeFilterConfiguration } from "../../tools/attributeFilterConfig";
import { AttributeFilterButton } from "../../tools/attributeFilterButton";
import { AttributeFilterTooltip } from "../../tools/attributeFilterTooltip";
import { getTestClassByTitle } from "../../support/commands/tools/classes";

Cypress.Cookies.defaults({
    preserve: ["GDCAuthTT", "GDCAuthSTT", "_csrfToken"],
});

Cypress.on("uncaught:exception", (error) => {
    console.error("Uncaught exception cause", error);
    return false;
});

Cypress.Cookies.debug(true);

const ATTRIBUTE_FILTER_RENAMING_BUTTON_SELECTOR = ".s-attribute-filter.s-activity_type";
const CONFIGURATION_SELECTOR = ".s-configuration-button";

describe("AttributeFilterButtonRenaming", { tags: ["pre-merge_isolated_bear"] }, () => {
    beforeEach(() => {
        cy.login();

        Navigation.visit("filters/attribute-filter-button-renaming");
    });

    it("should not show details icon if attribute button is not selected", () => {
        const attributeFilter = new AttributeFilterButton(ATTRIBUTE_FILTER_RENAMING_BUTTON_SELECTOR);

        attributeFilter.titleHasText("Activity Type:").subtitleHasText("Email");
        attributeFilter.expectDetailsIcon(false);
    });

    it("should show details icon if attribute button is selected", () => {
        const attributeFilter = new AttributeFilterButton(ATTRIBUTE_FILTER_RENAMING_BUTTON_SELECTOR);
        attributeFilter.open().expectDetailsIcon();
    });

    it("should show attribute details when icon is hover", () => {
        const attributeFilterName = "Activity Type";
        const attributeFilter = new AttributeFilterButton(ATTRIBUTE_FILTER_RENAMING_BUTTON_SELECTOR);
        attributeFilter.open().expectDetailsIcon().hoverDetailsIcon();
        new AttributeFilterTooltip()
            .hasHeading(attributeFilterName)
            .hasAttributeName(attributeFilterName)
            .hasDataSet("Activity");
    });

    it("should show updated attribute title on details tooltip", () => {
        const attributeFilterName = "Activity Type";
        const customTitle = "Custom Title";
        const attributeFilter = new AttributeFilterButton(ATTRIBUTE_FILTER_RENAMING_BUTTON_SELECTOR);

        attributeFilter.open().openConfiguration();

        const configuration = new AttributeFilterConfiguration(CONFIGURATION_SELECTOR);

        configuration.changeAttributeTitle(customTitle).getSaveButton().isEnabled(true).click();

        const updatedAttributeFilter = new AttributeFilterButton(
            `.s-attribute-filter${getTestClassByTitle(customTitle)}`,
        );
        updatedAttributeFilter.expectDetailsIcon().hoverDetailsIcon();

        new AttributeFilterTooltip()
            .hasHeading(customTitle)
            .hasAttributeName(attributeFilterName)
            .hasDataSet("Activity");
    });
});
