// (C) 2023-2024 GoodData Corporation

export class ExportOption {
    getExportToXLSXButtonElement() {
        return cy.get(".s-options-menu-export-xlsx").click();
    }

    getExportToCSVButtonElement() {
        return cy.get(".s-options-menu-export-csv").click();
    }
}
