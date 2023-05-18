// (C) 2021-2022 GoodData Corporation

const HEADER_CONTROL_SELECTOR = ".dash-control-buttons";
const EDIT_BUTTON_SELECTOR = ".s-edit_button";
const SAVE_AS_NEW_SELECTOR = ".s-save_as_new";
const SAVE_AS_NEW_DIALOG = ".save-as-new-dialog";
const CONFIRM_BUTTON = ".s-create_dashboard";
const INPUT_DASHBOARD_TITLE = ".dashboard-title";
const LOCK_STATUS = ".s-locked-status";

export class DashboardHeader {
    hasTitle(title: string) {
        cy.get(".s-dash-title").should("contain.text", title);
        return this;
    }

    getEditableTitleElement() {
        return cy.get(".s-dash-title-editable-label");
    }
    hasEditableTitle(title: string) {
        this.getEditableTitleElement().should("contain.text", title);
        return this;
    }

    dashboardTitleHasValue(value: string): this {
        cy.get(".s-gd-dashboard-title").should("have.text", value);
        return this;
    }

    dashboardTitleExist(exist = true) {
        cy.get(".s-gd-dashboard-title").should(exist ? "exist" : "not.exist");
        return this;
    }

    isTitleFocused() {
        this.getEditableTitleElement().find("textarea").should("be.focused");
        return this;
    }

    setTitle(newTitle: string) {
        this.getEditableTitleElement().click().type(`${newTitle}{enter}`);
        return this;
    }

    hasPrivateShareStatus(expect = true) {
        cy.get(".s-share-status").should(expect ? "exist" : "not.exist");
        return this;
    }

    hasLockedStatusVisible(expect = true) {
        cy.get(LOCK_STATUS).should(expect ? "be.visible" : "not.exist");
        return this;
    }

    isEditButtonPresent(expect = true) {
        cy.get(HEADER_CONTROL_SELECTOR)
            .find(EDIT_BUTTON_SELECTOR)
            .should(expect ? "exist" : "not.exist");
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
