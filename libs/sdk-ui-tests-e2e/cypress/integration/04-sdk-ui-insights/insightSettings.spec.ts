import * as Navigation from "../../tools/navigation";
import { TopBar } from "../../tools/dashboards";

Cypress.Cookies.defaults({
    preserve: ["GDCAuthTT", "GDCAuthSTT", "_csrfToken"],
});

Cypress.on("uncaught:exception", (error) => {
    console.error("Uncaught exception cause", error);
    return false;
});

Cypress.Cookies.debug(true);

describe("Insight view setting via API", { tags: ["checklist_integrated_bear"] }, () => {
    it("Locale setting is applied on InsightView", () => {
        cy.login();
        Navigation.visit("insight/basic-insight");
        const topBar = new TopBar();
        topBar.dashboardTitleExist().dashboardTitleHasValue("Tádsadhboard");
    });
});
