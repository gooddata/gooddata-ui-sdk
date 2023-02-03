// (C) 2023 GoodData Corporation
export class ShareDialog {
    constructor() {}

    getElement() {
        return cy.get(".s-gd-share-dialog");
    }

    getPermissionsDropdownElement() {
        return cy.get(".gd-granular-permissions-overlay");
    }

    dialogExists(exists = true) {
        this.getElement().should(exists ? "exist" : "not.exist");
        return this;
    }

    addButtonIsActive() {
        this.getElement().get(".s-add-users-or-groups:not(.disabled)").should("exist");
        return this;
    }

    setPermission(user: string, permission: string) {
        this.getElement()
            .find(".s-share-dialog-grantee-item")
            .contains(user)
            .parents(".s-share-dialog-grantee-item")
            .find(".s-granular-permission-button")
            .click();
        this.getPermissionsDropdownElement()
            .find(".gd-granular-permission-select-item")
            // we need exact match here! (View is also included in View & share)
            .contains(new RegExp("^" + permission + "$", "g"))
            .click();
        return this;
    }

    save() {
        this.getElement().get(".s-save").click();
        return this;
    }
}
