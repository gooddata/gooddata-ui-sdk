// (C) 2021-2025 GoodData Corporation

const SAVE_AS_NEW_SELECTOR = ".s-save_as_new";
const SAVE_AS_NEW_DIALOG = ".save-as-new-dialog";
const CONFIRM_BUTTON = ".s-create_dashboard";
const INPUT_DASHBOARD_TITLE = ".dashboard-title";

export class DashboardHeader {
    getEditButtonElement(): Cypress.Chainable {
        return cy.get(".s-edit_button");
    }

    editButtonIsVisible(visible = true): this {
        this.getEditButtonElement().should(visible ? "exist" : "not.exist");
        return this;
    }

    getShareButtonElement(): Cypress.Chainable {
        return cy.get(".s-header-share-button");
    }

    shareButtonExists(exist = true): this {
        this.getShareButtonElement().should(exist ? "exist" : "not.exist");
        return this;
    }

    dashboardTitleHasValue(value: string): this {
        this.getDashboardTitleElement().should("have.text", value);
        return this;
    }

    dashboardTitleExist(exist = true) {
        this.getDashboardTitleElement().should(exist ? "exist" : "not.exist");
        return this;
    }

    getDashboardTitleElement() {
        return cy.get(".s-gd-dashboard-title");
    }

    hasTitlePlaceholder() {
        this.getDashboardTitleElement().find("textarea").should("have.prop", "placeholder", "Untitled");
    }

    isTitleFocused() {
        this.getDashboardTitleElement().find("textarea").should("be.focused");
        return this;
    }

    saveAsNew(dashboardName: string) {
        cy.get(SAVE_AS_NEW_SELECTOR).should("be.visible").click();
        cy.get(SAVE_AS_NEW_DIALOG).should("exist");
        cy.get(INPUT_DASHBOARD_TITLE).type(dashboardName);
        cy.get(CONFIRM_BUTTON).click();
        return this;
    }

    menuButtonIsVisible(visible = true): this {
        cy.get(".s-header-options-button").should(visible ? "exist" : "not.exist");
        return this;
    }

    clickMenuButton(): this {
        cy.get(".s-header-options-button").click({ force: true });
        return this;
    }

    deleteDashboard(confirm: boolean) {
        cy.get(".s-delete_dashboard").click();
        if (confirm) {
            cy.get(".s-delete").click();
        } else {
            cy.get(".s-cancel").click();
        }
        return this;
    }
}
