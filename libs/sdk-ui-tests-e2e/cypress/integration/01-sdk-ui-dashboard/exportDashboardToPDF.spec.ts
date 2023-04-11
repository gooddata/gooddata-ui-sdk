// (C) 2023 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { DashboardMenu } from "../../tools/dashboardMenu";
import { AttributeFilter } from "../../tools/filterBar";
import { Export } from "../../tools/export";
import { TopBar } from "../../tools/dashboards";
import { Widget } from "../../tools/widget";

const dashboardMenu = new DashboardMenu();
const productFilter = new AttributeFilter("Product");
const exportControl = new Export();
const widget = new Widget(0);
const topBar = new TopBar();

Cypress.Cookies.defaults({
    preserve: ["GDCAuthTT", "GDCAuthSTT", "_csrfToken"],
});

Cypress.on("uncaught:exception", (error) => {
    console.error("Uncaught exception cause", error);
    return false;
});

Cypress.Cookies.debug(true);

describe("Export dashboard to pdf", { tags: ["checklist_integrated_tiger"] }, () => {
    beforeEach(() => {
        cy.login();
    });

    it("should export insight to PDF from dashboards", () => {
        cy.fixture("dashboardInfosForExport").then((data) => {
            data["validInsightsForTigerPDFExport"].forEach(
                (dashboardInfo: {
                    dashboardTitle: string;
                    dashboardURL: string;
                    fileName: string;
                    contents: string;
                }) => {
                    Navigation.visit(dashboardInfo.dashboardURL, { enableKPIDashboardExportPDF: true });
                    widget.waitTableLoaded();
                    topBar.dashboardTitleExist().dashboardTitleHasValue(dashboardInfo.dashboardTitle);
                    dashboardMenu.toggle().clickOption("Export to PDF");
                    exportControl.expectExportedPDF(dashboardInfo.fileName, dashboardInfo.contents);
                },
            );
        });
    });

    it("is able to export dashboard with temporary filter to pdf", () => {
        cy.fixture("dashboardInfosForExport").then((data) => {
            data["insightsAfterChangingFilterForPDFExport"].forEach(
                (dashboardInfo: {
                    dashboardTitle: string;
                    dashboardURL: string;
                    fileName: string;
                    contents: string;
                }) => {
                    Navigation.visit(dashboardInfo.dashboardURL);
                    topBar.dashboardTitleExist().dashboardTitleHasValue(dashboardInfo.dashboardTitle);
                    productFilter.open().selectAttributeWithoutSearch("WonderKid");
                    widget.waitTableLoaded();

                    dashboardMenu.toggle().clickOption("Export to PDF");
                    exportControl.expectExportedPDF(dashboardInfo.fileName, dashboardInfo.contents);
                },
            );
        });
    });
});
