// (C) 2022 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { EditMode } from "../../tools/editMode";
import { DashboardHeader } from "../../tools/dashboardHeader";
import { DashboardMenu } from "../../tools/dashboardMenu";
import { Widget } from "../../tools/widget";
import { DateFilter } from "../../tools/dateFilter";
import { KpiConfiguration } from "../../tools/kpiConfiguration";

Cypress.Cookies.defaults({
    preserve: ["GDCAuthTT", "GDCAuthSTT", "_csrfToken"],
});

Cypress.on("uncaught:exception", (error) => {
    console.error("Uncaught exception cause", error);
    return false;
});

Cypress.Cookies.debug(true);

const dashboardHeader = new DashboardHeader();
const editMode = new EditMode();
const dashboardMenu = new DashboardMenu();

describe("Dashboard Date Related", { tags: "pre-merge_isolated_bear" }, () => {
    beforeEach(() => {
        cy.login();
    });

    it("Make no change on unrelated date insight", () => {
        Navigation.visit("dashboard/date-filtering");

        new Widget(0).getTable().hasCellValue(1, 0, "01/01/1900");
    });

    it("Make no change on disabled date dataset filter insight", () => {
        Navigation.visit("dashboard/date-filtering");

        new Widget(1).getTable().hasCellValue(1, 0, "01/01/1900");
    });

    it("Override filter if insight using same date dataset", () => {
        Navigation.visit("dashboard/date-filtering");

        new Widget(2).getTable().hasCellValue(0, 0, "12/24/2011");
    });

    it("Combine filters if insight using different date dataset", () => {
        Navigation.visit("dashboard/date-filtering");

        new Widget(3).getTable().hasCellValue(0, 0, "12/24/2012");
    });

    it("Check insight not reloaded after ignore filter", () => {
        Navigation.visit("dashboard/date-filtering");

        new DateFilter().open().selectRelativePreset("relative-this-year").apply();

        new Widget(1).isLoading(false);
    });

    it("Check available datasets", () => {
        Navigation.visit("dashboard/kpis");
        editMode.edit();

        new KpiConfiguration(0)
            .open()
            .isDateDropdownLoaded()
            .openDateDataset()
            .getDateDatasets()
            .should("deep.equal", ["Created", "Closed", "Snapshot"]);
    });

    it("(SEPARATE) Check date dataSet configured", () => {
        Navigation.visit("dashboard/kpis");
        dashboardMenu.toggle();
        dashboardHeader.saveAsNew("Clone");
        editMode.edit();

        const kpiConfiguration = new KpiConfiguration(0)
            .open()
            .isDateDropdownLoaded()
            .openDateDataset()
            .selectDateDataset("closed")
            .close();

        editMode.save(true);
        editMode.edit();

        kpiConfiguration.open().isDateDropdownLoaded().selectedDataset("closed");
    });

    it("Render date dataset after adding multiple KPIs", () => {
        Navigation.visit("dashboard/kpis");
        editMode.edit();

        new KpiConfiguration(0).open().isDateDropdownLoaded().selectedDataset("created").close();
        new KpiConfiguration(3).open().isDateDropdownLoaded().selectedDataset("closed").close();
    });
});
