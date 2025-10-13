// (C) 2021-2025 GoodData Corporation

export class DashboardsList {
    getElement() {
        return cy.get(".s-navigation");
    }

    isVisible() {
        // note: in edit mode it's still there, just covered by creation panel
        this.getElement().should("be.visible");
        return this;
    }

    clickAddDashboard() {
        this.getElement().find(".s-navigation-add-dashboard").click();
        return this;
    }
}
