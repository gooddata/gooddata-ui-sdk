// (C) 2023 GoodData Corporation
import * as Navigation from "../../tools/navigation";
import { FilterBar } from "../../tools/filterBar";
import { AttributeFilterTooltip } from "../../tools/attributeFilterTooltip";

Cypress.Cookies.defaults({
    preserve: ["GDCAuthTT", "GDCAuthSTT", "_csrfToken"],
});

Cypress.on("uncaught:exception", (error) => {
    console.error("Uncaught exception cause", error);
    return false;
});

Cypress.Cookies.debug(true);

const filterBar = new FilterBar();
const attributeFilterTooltip = new AttributeFilterTooltip();

describe("Attribute selection tooltip", { tags: ["pre-merge_isolated_bear"] }, () => {
    beforeEach(() => {
        cy.login();

        Navigation.visit("dashboard/attribute-selection");
    });

    it("should show attribute values, title and dataset on tooltip when item is hover", () => {
        filterBar.dragAttributeToFilterBar().searchAttributeName("Account").showTooltipDialog("Account");

        attributeFilterTooltip
            .hasHeading("Account")
            .hasDataSet("Account")
            .hasAttributeValues([".decimal", "(add)ventures", "(blank)", "(mt) Media Temple", "@properties"]);
    });
});
