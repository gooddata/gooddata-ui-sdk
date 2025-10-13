// (C) 2021-2025 GoodData Corporation

import { InsightsCatalog } from "./insightsCatalog";

const EDIT_BUTTON_SELECTOR = ".s-edit_button";
const SAVE_EDIT_BUTTON_SELECTOR = ".s-save_button";
const SAVING_EDIT_BUTTON_SELECTOR = ".s-saving_button";
const CANCEL_EDIT_BUTTON = ".s-cancel_button";

export class EditMode {
    getWrapperElement() {
        return cy.get(".dash-control-buttons");
    }

    saveButtonEnabled(expect = true) {
        cy.get(SAVE_EDIT_BUTTON_SELECTOR).should(expect ? "not.have.class" : "have.class", "disabled");
        return this;
    }

    save(waitForEnabled = true) {
        this.getWrapperElement().find(SAVE_EDIT_BUTTON_SELECTOR).scrollIntoView().click();
        if (waitForEnabled) {
            this.editButtonEnabled();
        }
        return this;
    }

    editButtonEnabled(expect = true) {
        cy.get(EDIT_BUTTON_SELECTOR).should(expect ? "not.have.class" : "have.class", "disabled");
        return this;
    }

    editButtonVisible(expect = true) {
        cy.get(EDIT_BUTTON_SELECTOR).should(expect ? "be.visible" : "not.be.visible");
        return this;
    }

    edit() {
        this.editButtonEnabled();
        this.getWrapperElement().find(EDIT_BUTTON_SELECTOR).click();
        this.getWrapperElement().find(EDIT_BUTTON_SELECTOR).should("not.exist");
        new InsightsCatalog().waitForCatalogLoad();
        return this;
    }

    isInEditMode(expect = true) {
        cy.get(SAVE_EDIT_BUTTON_SELECTOR).should(expect ? "exist" : "not.exist");
        if (!expect) {
            cy.get(SAVING_EDIT_BUTTON_SELECTOR).should(expect ? "exist" : "not.exist");
        }
        return this;
    }

    cancel() {
        cy.get(CANCEL_EDIT_BUTTON).click();
        return this;
    }

    discard() {
        cy.get(".s-discard_changes").click();
        return this;
    }

    closeDiscardChange() {
        cy.get(".s-dialog-close-button").click();
        return this;
    }
}
