import * as Navigation from "../../tools/navigation";
import { AttributeFilterButton } from "../../tools/attributeFIlterButton";
import camelCase from "lodash/camelCase";

describe("AttributeFilterButton with initial selection", () => {
    beforeEach(() => {
        cy.login();

        Navigation.visit("filters/attribute-filter-button-with-selection");
    });

    it("attribute filter loaded", () => {
        const attributeFilter = new AttributeFilterButton();
        attributeFilter.titleHasText("Opportunity").subtitleHasText("Zoup! Fresh Soup > CompuSci");
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

        attributeFilter.clickCancel().subtitleHasText("Zoup! Fresh Soup > CompuSci");
    });
});
