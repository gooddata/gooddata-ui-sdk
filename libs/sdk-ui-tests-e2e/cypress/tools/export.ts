// (C) 2022-2025 GoodData Corporation

import { join } from "path";

import { Messages } from "./messages";

const messages = new Messages();
const EXPORT_CSV_SELECTOR = ".s-options-menu-export-csv";
const EXPORT_XLSX_SELECTOR = ".s-options-menu-export-xlsx";

export class Export {
    deleteDownloadFolder(downloadsFolder: string) {
        cy.exec("find . -name " + downloadsFolder + "file");
        cy.exec("cd " + downloadsFolder + " " + "&& rm -rf *");
        cy.wait(1000); // wait to make sure the folder download is deleted successful.
    }

    expectExportedPDF(filename: string, contents: string) {
        messages.hasProgressMessage(false);
        messages.hasSuccessMessage("Export successful.");
        const downloadsFolder = Cypress.config("downloadsFolder");
        cy.readFile(join(downloadsFolder, filename)).should("exist");
        cy.readPdf(join(downloadsFolder, filename)).then((dataContent) => {
            const actual = JSON.stringify(dataContent).replace(//g, "");
            const expected = JSON.stringify(contents).replace(/"/g, "");
            expect(actual).contain(expected);
        });
        // delete download folder before exporting
        this.deleteDownloadFolder(downloadsFolder);
    }

    exportToCSV() {
        cy.get(EXPORT_CSV_SELECTOR).click();
        return this;
    }

    exportToXLSX() {
        cy.get(EXPORT_XLSX_SELECTOR).click();
        return this;
    }
}
