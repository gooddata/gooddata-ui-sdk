// (C) 2023 GoodData Corporation

export class ExportDialog {
    getElement() {
        return cy.get(".gd-export-dialog");
    }

    getFooterElement() {
        return this.getElement().find(".gd-dialog-footer");
    }

    confirmExportXLSX() {
        return this.getFooterElement().find(".s-dialog-submit-button").click();
    }
}
