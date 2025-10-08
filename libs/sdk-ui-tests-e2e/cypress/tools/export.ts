// (C) 2022-2025 GoodData Corporation

import { join } from "path";

import { ExportDialog } from "./exportDialog";
import { ExportOption } from "./exportOption";
import { Messages } from "./messages";
import { Widget } from "./widget";
import { WidgetOptionsMenu } from "./widgetOptionsMenu";

const messages = new Messages();
const EXPORT_CSV_SELECTOR = ".s-options-menu-export-csv";
const EXPORT_XLSX_SELECTOR = ".s-options-menu-export-xlsx";
const exportDialog = new ExportDialog();

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

    exportInsightOnWidgetByIndexToCSV = (index: number) => {
        const widget = new Widget(index).waitChartLoaded();
        new WidgetOptionsMenu(widget).open();
        new ExportOption().getExportToCSVButtonElement();
        messages.hasSuccessMessage("Export successful.");
    };

    exportInsightOnWidgetByIndexToXLSX = (index: number) => {
        const widget = new Widget(index).waitChartLoaded();
        new WidgetOptionsMenu(widget).open();
        new ExportOption().getExportToXLSXButtonElement();
        exportDialog.confirmExportXLSX();
        messages.hasSuccessMessage("Export successful.");
    };

    expectExportedCSV(filename: string, contents: string) {
        const downloadsFolder = Cypress.config("downloadsFolder");
        cy.readFile(join(downloadsFolder, filename)).should("exist");
        if (contents) {
            cy.readFile(join(downloadsFolder, filename)).then(($el) => {
                // remove " character on csv file then comparing the result
                const updatedContents = $el.toString().replace(/"/g, "");
                expect(updatedContents).to.include(contents);
            });
        }
        // delete download folder before exporting
        this.deleteDownloadFolder(downloadsFolder);
    }

    expectExportedXLSX(filename: string, row: any, contents: string) {
        const downloadsFolder = Cypress.config("downloadsFolder");
        cy.readFile(join(downloadsFolder, filename)).should("exist");
        // parse xlsx to json then compare with the result
        if (contents) {
            cy.parseXlsx(join(downloadsFolder, filename)).then((jsonData: any) => {
                // data[1] is the ROW that contains the data to be matched using the const above
                const updatedContents = jsonData[0].data[row];
                expect(updatedContents.toString()).to.include(contents);
            });
        }
        // delete download folder before exporting
        this.deleteDownloadFolder(downloadsFolder);
    }
}
