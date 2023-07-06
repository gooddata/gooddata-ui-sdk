// (C) 2023 GoodData Corporation

export class ExportOption {
    constructor(private parentSelector: string) {}

    getElement() {
        return cy.get(this.parentSelector).find(".gd-menu-wrapper");
    }

    getExportToXLSXButtonElement() {
        return this.getElement().find(".s-options-menu-export-xlsx").click();
    }

    getExportToCSVButtonElement() {
        return this.getElement().find(".s-options-menu-export-csv").click();
    }
}
