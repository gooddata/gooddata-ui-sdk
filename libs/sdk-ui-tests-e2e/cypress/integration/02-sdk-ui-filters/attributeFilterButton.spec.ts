// (C) 2022 GoodData Corporation
import * as Navigation from "../../tools/navigation";
import { AttributeFilterButton } from "../../tools/attributeFilterButton";
import camelCase from "lodash/camelCase";

describe("AttributeFilterButton", () => {
    beforeEach(() => {
        cy.login();

        Navigation.visit("filters/attribute-filter-button");
    });

    it("attribute filter loaded", () => {
        const attributeFilter = new AttributeFilterButton();
        attributeFilter.titleHasText("Opportunity").subtitleHasText("All");
    });

    it("attribute filter basic operations", () => {
        const attributeFilter = new AttributeFilterButton();

        attributeFilter.open().clearSelection().subtitleHasText("None").applyDisabled();

        attributeFilter
            .selectElement(camelCase("1000Bulbs.com > Educationly"))
            .selectElement(camelCase("1000Bulbs.com > PhoenixSoft"))
            .selectElement(camelCase("101 Financial > Educationly"))
            .subtitleHasText(
                "1000Bulbs.com > Educationly, 1000Bulbs.com > PhoenixSoft, 101 Financial > Educationly",
            );

        attributeFilter.clickCancel().subtitleHasText("All");
    });
});
