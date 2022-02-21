import * as Navigation from "../../tools/navigation";
import { AttributeFilterButton } from "../../tools/attributeFIlterButton";

describe("AttributeFilterButton", () => {
    beforeEach(() => {
        cy.login();

        Navigation.visit("attribute-filter-button");
    });

    it("attribute filter loaded", () => {
        const attributeFilter = new AttributeFilterButton();
        attributeFilter.titleHasText("Transaction Id").subtitleHasText("All");
    });

    it("attribute filter basic operations", () => {
        const attributeFilter = new AttributeFilterButton();

        attributeFilter.open().clearSelection().subtitleHasText("None").applyDisabled();

        attributeFilter
            .selectElement("1")
            .selectElement("10")
            .selectElement("100")
            .subtitleHasText("1, 10, 100");

        attributeFilter.clickCancel().subtitleHasText("All");
    });

    it.only("select elements out of limit", () => {
        const attributeFilter = new AttributeFilterButton();

        attributeFilter.open().clearSelection().scrollDown();
    });
});
