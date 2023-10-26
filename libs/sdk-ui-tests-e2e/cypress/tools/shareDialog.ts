// (C) 2023 GoodData Corporation
export class ShareDialog {
    constructor() {}

    getElement() {
        return cy.get(".s-gd-share-dialog");
    }

    getPermissionsDropdownElement() {
        return cy.get(".s-granular-permissions-overlay");
    }

    dialogExists(exists = true) {
        this.getElement().should(exists ? "exist" : "not.exist");
        return this;
    }

    addButtonIsActive() {
        this.getElement().get(".s-add-users-or-groups:not(.disabled)").should("exist");
        return this;
    }

    getItemForGivenUserOrGroup(userOrGroup: string) {
        return this.getElement()
            .find(".s-share-dialog-grantee-item")
            .contains(userOrGroup)
            .parents(".s-share-dialog-grantee-item");
    }

    shareItemExistsForUserOrGroup(userOrGroup: string, exists = true) {
        this.getElement()
            .contains(userOrGroup)
            .should(exists ? "exist" : "not.exist");
        return this;
    }

    hasPermissionSet(user: string, permission: string) {
        this.getItemForGivenUserOrGroup(user)
            .find(".s-granular-permission-button")
            .contains(new RegExp("^" + permission + "$", "g"));
        return this;
    }

    openDropdownForUserOrGroup(userOrGroup: string) {
        this.getItemForGivenUserOrGroup(userOrGroup).find(".s-granular-permission-button").click();
        return this;
    }

    isGranularPermissionButtonEnabled(userOrGroup: string, isEnable = true) {
        this.getItemForGivenUserOrGroup(userOrGroup)
            .find(".s-granular-permission-button")
            .should(isEnable ? "not.have.class" : "have.class", "disabled");
        return this;
    }

    setPermission(user: string, permission: string) {
        this.openDropdownForUserOrGroup(user);
        this.getPermissionsDropdownElement()
            .find(".gd-granular-permission-select-item")
            // we need exact match here! (View is also included in View & share)
            .contains(new RegExp("^" + permission + "$", "g"))
            .click();
        return this;
    }

    isPermissionDisabled(permission: string) {
        this.getPermissionsDropdownElement()
            .find(".gd-granular-permission-select-item.is-disabled")
            .contains(new RegExp("^" + permission + "$", "g"));
        return this;
    }

    remove(userOrGroup: string) {
        this.openDropdownForUserOrGroup(userOrGroup);
        this.getPermissionsDropdownElement().find(".gd-list-item").contains("Remove").click();

        return this;
    }

    save() {
        this.getElement().get(".s-save").click();
        return this;
    }

    share() {
        this.getElement().get(".s-dialog-submit-button.s-share").click();
        return this;
    }

    cancel() {
        this.getElement().get(".s-cancel").click();
        return this;
    }

    isEmpty(empty: boolean = true) {
        this.getElement()
            .find(".s-gd-share-dialog-grantee-list-empty-selection")
            .should(empty ? "exist" : "not.exist");
        return this;
    }

    clickOnAddButton() {
        this.getElement().get(".s-add-users-or-groups:not(.disabled)").click();
        return this;
    }

    clickOnUserOrGroupDropdownOption(userOrGroup: string) {
        this.getElement().find(".gd-share-dialog__option > .option-content").contains(userOrGroup).click();
        return this;
    }
}
