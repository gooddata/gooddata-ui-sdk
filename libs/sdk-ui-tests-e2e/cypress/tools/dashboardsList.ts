// (C) 2021-2022 GoodData Corporation

import { DashboardName, splitCamelCaseToWords } from "./insightsCatalog";

export class DashboardsList {
    getElement() {
        return cy.get(".s-navigation");
    }

    getMobileElement() {
        return cy.get(".s-mobile-navigation-dropdown");
    }

    itemVisible(dashboardName: DashboardName) {
        this.getElement().contains(splitCamelCaseToWords(dashboardName)).should("exist");
        return this;
    }

    itemMobileVisible(dashboardName: DashboardName) {
        this.getMobileElement().contains(splitCamelCaseToWords(dashboardName)).should("exist");
        return this;
    }

    itemNotExist(dashboardName: DashboardName) {
        this.getElement().contains(splitCamelCaseToWords(dashboardName)).should("not.exist");
        return this;
    }

    isVisible() {
        // note: in edit mode it's still there, just covered by creation panel
        this.getElement().should("be.visible");
        return this;
    }

    isVisibleMobileNavigation() {
        // note: in edit mode it's still there, just covered by creation panel
        this.getMobileElement().should("be.visible");
        return this;
    }

    clickAddDashboard() {
        this.getElement().find(".s-navigation-add-dashboard").click();
        return this;
    }

    clickDashboardItem(dashboardName: DashboardName) {
        const reconstructedName = splitCamelCaseToWords(dashboardName);
        const re = new RegExp(`^${reconstructedName}$`);
        this.getElement().find(".s-navigation-list-item").contains(re).click();
        return this;
    }

    isDashboardItemAtIndex(dashboardName: DashboardName, expectedIndex: number) {
        const reconstructedName = splitCamelCaseToWords(dashboardName);
        this.getElement()
            .find(".s-navigation-list-item")
            .eq(expectedIndex)
            .should("have.text", reconstructedName);
        return this;
    }

    isDesktopPrivateSectionExpanded() {
        this.getElement().find(".s-grouped-navigation-section--is-expanded").should("exist");
        return this;
    }

    openMobileDashboardList() {
        cy.get(".s-grouped-mobile-navigation-button").click();
        return this;
    }

    verifyColorOfNavigationPanel(color: string) {
        cy.get(".s-navigation").should("have.css", "background-color").and("eq", color);
        return this;
    }
}
