// (C) 2022 GoodData Corporation
import * as Navigation from "../../tools/navigation";
import { AttributeFilterButton } from "../../tools/attributeFilterButton";
import camelCase from "lodash/camelCase";

describe("AttributeFilterButton with initial selection", () => {
    beforeEach(() => {
        cy.login();

        Navigation.visit("filters/attribute-filter-button-with-selection");
    });

    it("attribute filter loaded", () => {
        const attributeFilter = new AttributeFilterButton(".s-attribute-filter.s-opportunity");
        attributeFilter.titleHasText("Opportunity").subtitleHasText("Zoup! Fresh Soup > CompuSci");
    });

    it("attribute filter basic operations", () => {
        const attributeFilter = new AttributeFilterButton(".s-attribute-filter.s-opportunity");

        attributeFilter.open().clearSelection().subtitleHasText("None").applyDisabled();

        attributeFilter
            .selectElement(`.s-attribute-filter-list-item-${camelCase(".decimal > Explorer")}`)
            .selectElement(`.s-attribute-filter-list-item-${camelCase("(add)ventures > CompuSci")}`)
            .selectElement(`.s-attribute-filter-list-item-${camelCase("(mt) Media Temple > CompuSci")}`)
            .subtitleHasText(".decimal > Explorer, (add)ventures > CompuSci, (mt) Media Temple > CompuSci");

        attributeFilter.clickCancel().subtitleHasText("Zoup! Fresh Soup > CompuSci");
    });
});
