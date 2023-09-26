// (C) 2021 GoodData Corporation
import * as Navigation from "../../tools/navigation";
import { Table } from "../../tools/table";
import { Widget } from "../../tools/widget";
import { DrillToModal } from "../../tools/drillToModal";
import { DateFilter } from "../../tools/dateFilter";
import { DateFilterValue } from "../../tools/enum/DateFilterValue";
import { Api } from "../../tools/api";

const DEPARTMENT_ID = "1090";
const PRODUCT_ID = "1057";
const drillModal = new DrillToModal();
const api = new Api();
const firstWidget = new Widget(0);

const dashboardTable = [
    {
        title: "table has row column measure",
        values: ["CompuSci", "$4,163,871.80", "$11,418,823.89"],
    },
    {
        title: "table only row and column",
        values: ["CompuSci"],
    },
    {
        title: "table only rows and measures",
        values: ["CompuSci", "$15,582,695.69"],
    },
    {
        title: "table only rows",
        values: ["CompuSci"],
    },
];

/**
 *
 * This method is getting data from bear if this failed one reason could be that data are shifted
 * If test failed in before each or after each hook DEPARTMENT_ID, PRODUCT_ID could be shifted
 * @returns
 */

describe("Drilling", () => {
    before(() => {
        // Sets drilling on Department attribute into Product attribute
        api.setUpDrillDownAttribute(DEPARTMENT_ID, PRODUCT_ID);
    });

    after(() => {
        // Removes drilling from Department attribute
        api.setUpDrillDownAttribute(DEPARTMENT_ID);
    });

    describe("Basic drill down", { tags: ["checklist_integrated_bear"] }, () => {
        it("Should drill down on table with one drillable", () => {
            Navigation.visit("dashboard/dashboard-table-drill-down");
            dashboardTable.forEach((insight, index) => {
                new Widget(index).waitTableLoaded().getTable().click(0, 0);
                drillModal.getTitleElement().should("have.text", insight.title + " › Direct Sales");
                insight.values.forEach((assertValue, index) => {
                    drillModal.getTable().hasCellValue(0, index, assertValue);
                });
                drillModal.close();
            });
        });

        it("Should drill down on charts that have two drillable attributes", () => {
            const firstDrillValue = [
                "617.00",
                "1,903.00",
                "3,526.00",
                "2,046.00",
                "41.00",
                "220.10",
                "386.70",
                "281.00",
            ];
            const secondDrillValue = ["125.00", "492.00", "0.00", "41.00"];
            const thirdDrillValue = ["125.00", "0.00"];

            Navigation.visit("dashboard/drill-to-insight");
            firstWidget.scrollIntoView().waitChartLoaded().getChart().clickSeriesPoint(0);
            drillModal
                .selectDropdownAttribute("2008")
                .getTitleElement()
                .should("have.text", "Combo chart › 2008");
            drillModal.getChart().hasDataLabelValues(firstDrillValue).clickSeriesPoint(0);
            drillModal.getTitleElement().should("have.text", "Combo chart › 2008 › Q1/2008");
            drillModal.getChart().hasDataLabelValues(secondDrillValue).clickSeriesPoint(0);
            drillModal.getTitleElement().should("have.text", "Combo chart › 2008 › Q1/2008 › Feb 2008");
            drillModal.getChart().hasDataLabelValues(thirdDrillValue);
            drillModal.close();
        });

        it("Should drill down on charts that have two drillable attributes on the difference bucket", () => {
            const valueAttribute = ["81.14%", "18.86%"];
            const assertInsightValues = ["69.6%", "68.22%", "71.1%", "30.4%", "31.78%", "28.9%"];

            Navigation.visit("dashboard/insight");
            firstWidget.scrollIntoView().waitChartLoaded().getChart().waitLoaded();
            new DateFilter()
                .openAndSelectDateFilterByName(DateFilterValue.ALL_TIME)
                .apply()
                .subtitleHasValue(DateFilterValue.ALL_TIME);
            firstWidget.getChart().hasDataLabelValues(assertInsightValues);
            firstWidget
                .waitChartLoaded()
                .getChart()
                .getTooltipContents(0)
                .should("deep.equal", ["Year (Closed)", "Department", "Won"]);
            firstWidget.getChart().clickSeriesPoint(1, 0);
            drillModal
                .selectDropdownAttribute("Inside Sales")
                .getTitleElement()
                .should("have.text", "Column chart with years › Inside Sales");
            drillModal.getChart().clickSeriesPoint(0);
            drillModal.getTitleElement().should("have.text", "Column chart with years › Inside Sales › 2010");
            drillModal.close();

            firstWidget.waitChartLoaded().getChart().clickSeriesPoint(1, 0);
            drillModal
                .selectDropdownAttribute("2010")
                .getTitleElement()
                .should("have.text", "Column chart with years › 2010");
            drillModal.getChart().clickSeriesPoint(0);
            drillModal
                .selectDropdownAttribute("Q2/2010")
                .getTitleElement()
                .should("have.text", "Column chart with years › 2010 › Q2/2010");
            drillModal.getChart().hasDataLabelValues(valueAttribute);
        });
    });

    describe("implicit drill to attribute url", { tags: ["post-merge_integrated_bear"] }, () => {
        beforeEach(() => {
            Navigation.visit("dashboard/implicit-drill-to-attribute-url");
        });

        // eslint-disable-next-line jest/no-disabled-tests
        it.skip("should drill to correct url after clicking on attribute", () => {
            const table = new Table(".s-dash-item");

            table.click(0, 0);

            cy.get(".s-attribute-url").should(
                "have.text",
                "https://www.google.com/search?q=.decimal%20%3E%20Explorer",
            );
        });

        // eslint-disable-next-line jest/no-disabled-tests
        it.skip("should drill to correct url after clicking on attribute in drill modal", () => {
            const table = new Table(".s-dash-item");

            table.click(0, 1);

            const drillModalTable = new Table(".s-drill-modal-dialog");

            drillModalTable.click(0, 0);

            cy.get(".s-attribute-url").should(
                "have.text",
                "https://www.google.com/search?q=.decimal%20%3E%20Explorer",
            );
        });
    });

    describe("Advanced drill down", { tags: ["post-merge_integrated_bear"] }, () => {
        it("Drill down on column with one drillable on drill to insight", () => {
            Navigation.visit("dashboard/drill-to-insight");
            new Widget(2).waitTableLoaded().getTable().click(0, 0);

            drillModal.getChart().waitLoaded().clickSeriesPoint(0);
            drillModal
                .getTitleElement()
                .should("have.text", "Bar chart with measures and attribute › Direct Sales");
        });

        it("Drill down on table with one drillable on drill to insight", () => {
            Navigation.visit("dashboard/drill-to-insight");
            new Widget(3).scrollIntoView().waitChartLoaded().getChart().waitLoaded().clickSeriesPoint(0, 7);

            drillModal.getTable().click(0, 1);
            drillModal
                .getTitleElement()
                .should("have.text", "Table Activity by Year and Department › Inside Sales");
        });

        it("Drill down on table with invalid drill", () => {
            Navigation.visit("dashboard/dashboard-target");
            new Widget(0).waitTableLoaded().getTable().click(0, 1);

            drillModal.getModalText().should("have.text", "Sorry, we can't display this insight");
        });

        it("Drill down on column chart with invalid drill", () => {
            Navigation.visit("dashboard/dashboard-target");
            new Widget(1).scrollIntoView().waitChartLoaded().getChart().waitLoaded().clickSeriesPoint(0, 0);

            drillModal.getModalText().should("have.text", "Sorry, we can't display this insight");
        });

        it("Check attribute value when drilling in bubble chart", () => {
            Navigation.visit("dashboard/dashboard-target");
            new Widget(2).scrollIntoView().waitChartLoaded().getChart().waitLoaded().clickSeriesPoint(1, 0);

            drillModal.getTable().getColumnValues(0).should("deep.equal", ["2011"]);
        });
    });
});
