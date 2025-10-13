// (C) 2022-2025 GoodData Corporation

import { getTestClassByTitle } from "../../support/commands/tools/classes";
import { AttributeFilterButton } from "../../tools/attributeFilterButton";
import { AttributeFilterConfiguration } from "../../tools/attributeFilterConfig";
import { AttributeFilterTooltip } from "../../tools/attributeFilterTooltip";
import { InsightsCatalog } from "../../tools/insightsCatalog";
import * as Navigation from "../../tools/navigation";

const ATTRIBUTE_FILTER_RENAMING_BUTTON_SELECTOR = ".s-attribute-filter.s-activity_type";

// Can be removed once migrated to tiger or once decided that we don't want to migrate the test.
describe.skip("AttributeFilterButtonRenaming", { tags: ["pre-merge_isolated_bear"] }, () => {
    beforeEach(() => {
        Navigation.visit("dashboard/attribute-filter-button-renaming");
        new InsightsCatalog().waitForCatalogLoad();
    });

    it("should not show details icon if attribute button is not selected", () => {
        const attributeFilter = new AttributeFilterButton(ATTRIBUTE_FILTER_RENAMING_BUTTON_SELECTOR);

        attributeFilter.titleHasText("Activity Type").subtitleHasText("Email");
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

        const configuration = new AttributeFilterConfiguration();

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
