// (C) 2021-2024 GoodData Corporation

export class RichText {
    constructor(private parentSelector: string) {}

    getParentElement() {
        return cy.get(this.parentSelector);
    }

    getContentElement() {
        return cy.get(`${this.parentSelector} .s-rich-text`);
    }

    getTextArea() {
        return cy.get(`${this.parentSelector} .s-rich-text textarea`);
    }

    notExist() {
        return this.getContentElement().should("not.exist");
    }

    exist() {
        return this.getContentElement().should("exist");
    }

    isEdit() {
        return this.getContentElement().should("have.class", "s-rich-text-edit");
    }

    isView() {
        return this.getContentElement().should("have.class", "s-rich-text-view");
    }

    getRemoveButtonElement() {
        return this.getParentElement().find(".s-rich-text-remove-button");
    }

    getConfirmButtonElement() {
        return this.getParentElement().find(".s-rich-text-confirm-button");
    }

    getConfirmRemoveDialogElement() {
        return cy.get(".s-rich-text-remove-confirm-dialog");
    }

    clickContent() {
        this.getContentElement().click();
        return this;
    }

    updateContent(updatedContent: string) {
        this.edit().isEdit();
        this.getTextArea().type(updatedContent);
        return this;
    }

    edit() {
        this.getContentElement().scrollIntoView();
        this.getContentElement().then((element) => {
            if (element.hasClass("s-rich-text-view")) {
                this.clickContent();
            }
        });
        return this;
    }

    remove() {
        this.getContentElement().scrollIntoView();
        this.clickContent();
        this.getRemoveButtonElement().click();
        this.getConfirmRemoveDialogElement().find(".s-delete").click();
        this.notExist();
        return this;
    }

    confirmChanges() {
        this.getConfirmButtonElement().click();
        this.isView();
        return this;
    }
}
