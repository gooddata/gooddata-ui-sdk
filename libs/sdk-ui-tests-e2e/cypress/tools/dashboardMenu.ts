// (C) 2021-2025 GoodData Corporation
export const enum ExportMenu {
    EXPORT_SNAPSHOT = ".s-pdf-export-item",
    EXPORT_SLIDE_PDF = ".s-pdf-presentation-export-item",
    EXPORT_SLIDE_PPTX = ".s-pptx-presentation-export-item",
}

export class DashboardMenu {
    getButtonElement() {
        return cy.get(".s-header-options-button");
    }

    toggle() {
        this.getButtonElement().should("be.visible").click();
        return this;
    }

    private getDropdownItemElement(optionLabel: string) {
        return cy.get(".gd-header-menu-overlay").find(".gd-list-item").contains(optionLabel);
    }

    clickOption(optionLabel: string) {
        this.getDropdownItemElement(optionLabel).should("not.have.class", "is-disabled").click();
        return this;
    }

    hasOption(optionLabel: string, expect = true) {
        this.getDropdownItemElement(optionLabel).should(expect ? "be.visible" : "not.exist");
        return this;
    }

    optionItemNotExist(optionLabel: string) {
        this.getDropdownItemElement(optionLabel).should("not.exist");
    }

    clickExport() {
        cy.get(".s-menu-exports-list").should("not.have.class", "is-disabled").and("be.visible").click();
        return this;
    }

    clickExportOption(item: ExportMenu) {
        cy.get(item).should("be.visible").click();
        return this;
    }
}
