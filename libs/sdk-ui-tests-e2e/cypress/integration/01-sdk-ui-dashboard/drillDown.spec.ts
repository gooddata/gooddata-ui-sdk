// (C) 2021-2024 GoodData Corporation
import * as Navigation from "../../tools/navigation";
import { Table } from "../../tools/table";
import { Widget } from "../../tools/widget";
import { DrillToModal } from "../../tools/drillToModal";
import { DateFilter } from "../../tools/dateFilter";
import { DateFilterValue } from "../../tools/enum/DateFilterValue";
import { DateFilterAbsoluteForm } from "../../tools/dateFilterAbsoluteForm";

const drillModal = new DrillToModal();
const firstWidget = new Widget(0);
const DIRECT_SALES = "Direct Sales";
const INSIDE_SALES = "Inside Sales";
const YEAR_2010 = "2010";

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

const PRODUCT_NAMES = ["CompuSci", "Educationly", "Explorer", "Grammar Plus", "PhoenixSoft", "WonderKid"];
const PRODUCT_VALUE = [
    "$3,312,958.33",
    "$3,762,615.61",
    "$2,178,059.74",
    "$8,566,536.72",
    "$6,758,757.23",
    "$11,640,203.95",
];
const heatmapInsights = [
    {
        title: "heat map only row measure",
        value: PRODUCT_VALUE,
        firstCellValue: INSIDE_SALES,
        tooltip: ["Department", "Inside Sales", "Amount", "$36,219,131.58"],
    },
    {
        title: "heat map only column measure",
        value: [
            "$15,582,695.69",
            "$16,188,138.24",
            "$30,029,658.14",
            "$5,863,972.18",
            "$5,763,242.30",
            "$6,978,618.41",
        ],
        firstCellValue: DIRECT_SALES,
        tooltip: ["Department", "Direct Sales", "Amount", "$80,406,324.96"],
    },
    {
        title: "heat map has measure column row",
        value: PRODUCT_VALUE,
        firstCellValue: INSIDE_SALES,
        tooltip: ["Department", "Inside Sales", "Product", "CompuSci", "Amount", "$11,640,203.95"],
    },
];

/**
 *
 * This method is getting data from bear if this failed one reason could be that data are shifted
 * If test failed in before each or after each hook DEPARTMENT_ID, PRODUCT_ID could be shifted
 * @returns
 */

describe("Drilling", () => {
    beforeEach(() => {
        // Sets drilling on Department attribute into Product attribute
        // api.setUpDrillDownAttribute(DEPARTMENT_ID, PRODUCT_ID);
    });

    afterEach(() => {
        // Removes drilling from Department attribute
        // api.setUpDrillDownAttribute(DEPARTMENT_ID);
    });

    // Can be removed once migrated to tiger or once decided that we don't want to migrate the test.
    // eslint-disable-next-line jest/no-disabled-tests
    describe.skip("Basic drill down", { tags: ["checklist_integrated_bear"] }, () => {
        it("Should drill down on table with one drillable", () => {
            Navigation.visit("dashboard/dashboard-table-drill-down");
            dashboardTable.forEach((insight, index) => {
                new Widget(index).waitTableLoaded().getTable().click(0, 0);
                drillModal.waitForDrillModalViz().hasTitleHeader(insight.title + " › " + DIRECT_SALES);
                insight.values.forEach((assertValue, index) => {
                    drillModal.getTable().hasCellValue(0, index, assertValue);
                });
                drillModal.close();
            });
        });

        it("Should drill down on table transpose", () => {
            Navigation.visit("dashboard/dashboard-table-drill-down");
            new Widget(5).scrollIntoView().waitTableLoaded().getTable().click(0, 1);
            drillModal
                .waitForDrillModalViz()
                .hasTitleHeader("table transpose row left" + " › " + DIRECT_SALES);
            drillModal.getTable().hasCellValue(0, 1, "CompuSci").hasCellValue(1, 1, "763,142,664.03");
            drillModal.close();
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
            drillModal.selectDropdownAttribute("2008").hasTitleHeader("Combo chart › 2008");
            drillModal.getChart().hasDataLabelValues(firstDrillValue).clickSeriesPoint(0);
            drillModal.hasTitleHeader("Combo chart › 2008 › Q1/2008");
            drillModal.getChart().hasDataLabelValues(secondDrillValue).clickSeriesPoint(0);
            drillModal.hasTitleHeader("Combo chart › 2008 › Q1/2008 › Feb 2008");
            drillModal.getChart().hasDataLabelValues(thirdDrillValue);
            drillModal.close();
        });

        it("Should drill down on charts that have two drillable attributes on the difference bucket", () => {
            const valueAttribute = ["81.14%", "18.86%"];
            const assertInsightValues = ["69.6%", "68.22%", "71.1%", "30.4%", "31.78%", "28.9%"];

            Navigation.visit("dashboard/insight");
            //api.setUpDrillDownAttribute(DISPLAYFORM_PRODUCT, YEAR_CLOSE);
            firstWidget.waitChartLoaded().getChart().waitLoaded();
            new DateFilter()
                .openAndSelectDateFilterByName(DateFilterValue.ALL_TIME)
                .apply()
                .subtitleHasValue(DateFilterValue.ALL_TIME);

            firstWidget
                .waitChartLoaded()
                .getChart()
                .hasDataLabelValues(assertInsightValues)
                .hasTooltipContents(0, 0, [
                    "Year (Closed)",
                    "2010",
                    "Department",
                    "Direct Sales",
                    "Won",
                    "69.6%",
                ])
                .clickSeriesPoint(1);
            drillModal
                .selectDropdownAttribute(INSIDE_SALES)
                .hasTitleHeader("Column chart with years › " + INSIDE_SALES)
                .getChart()
                .clickSeriesPoint(0);

            drillModal
                .selectDropdownAttribute(YEAR_2010)
                .waitForDrillModalViz()
                .hasTitleHeader("Column chart with years › " + INSIDE_SALES + " › " + YEAR_2010)
                .close();

            firstWidget.waitChartLoaded().getChart().clickSeriesPoint(1, 0);
            drillModal
                .selectDropdownAttribute(YEAR_2010)
                .waitForDrillModalViz()
                .hasTitleHeader("Column chart with years › " + YEAR_2010)
                .getChart()
                .clickSeriesPoint(0);
            drillModal
                .selectDropdownAttribute("Q2/" + YEAR_2010)
                .hasTitleHeader("Column chart with years › " + YEAR_2010 + " › Q2/" + YEAR_2010);
            drillModal.getChart().hasDataLabelValues(valueAttribute);
            //api.setUpDrillDownAttribute(DISPLAYFORM_PRODUCT);
        });

        it("Drilling down continue on a table ", () => {
            const YEAR_LIST = ["2010", "2011", "2012", "2013"];
            const YEAR_LIST_CLOSE = ["2010", "2011", "2012", "2013", "2014"];

            Navigation.visit("dashboard/dashboard-table-drill-down");
            //api.setUpDrillDownAttribute(DISPLAYFORM_PRODUCT, YEAR_CLOSE);
            [DIRECT_SALES, INSIDE_SALES].forEach((value, index) => {
                firstWidget.waitTableLoaded().getTable().hasCellValue(index, 0, value);
            });

            firstWidget.waitTableLoaded().getTable().click(0, 0);
            drillModal.hasTitleHeader("table has row column measure › " + DIRECT_SALES);
            PRODUCT_NAMES.forEach((value, index) => {
                drillModal.getTable().hasCellValue(index, 0, value);
            });
            drillModal.getTable().waitLoaded().click(0, 0);
            drillModal.hasTitleHeader("table has row column measure › " + DIRECT_SALES + " › CompuSci");
            YEAR_LIST.forEach((value, index) => {
                drillModal.getTable().hasCellValue(index, 0, value);
            });
            drillModal.back();
            drillModal.hasTitleHeader("table has row column measure › " + DIRECT_SALES);
            PRODUCT_NAMES.forEach((value, index) => {
                drillModal.getTable().hasCellValue(index, 0, value);
            });
            drillModal.getTable().waitLoaded().click(1, 0);
            drillModal.hasTitleHeader("table has row column measure › " + DIRECT_SALES + " › Educationly");
            YEAR_LIST_CLOSE.forEach((value, index) => {
                drillModal.getTable().hasCellValue(index, 0, value);
            });
            drillModal.close();
            //api.setUpDrillDownAttribute(DISPLAYFORM_PRODUCT);
        });

        it("Drilling down on a table that has two drillable attributes separate", () => {
            Navigation.visit("dashboard/implicit-drill");
            //api.setUpDrillDownAttribute(DISPLAYFORM_PRODUCT, YEAR_CLOSE);
            const TABLE_WITH_YEAR = [
                "$6,583,208.52",
                "$2,876,022.26",
                "$14,004,144.97",
                "$6,524,077.69",
                "$5,917,506.59",
                "$2,405,793.42",
            ];
            TABLE_WITH_YEAR.forEach((value, index) => {
                firstWidget.waitTableLoaded().getTable().hasCellValue(index, 2, value);
            });
            firstWidget.getTable().click(0, 0);
            drillModal
                .hasTitleHeader("Table with years › " + YEAR_2010)
                .getTable()
                .hasCellValue(0, 0, "Q2/" + YEAR_2010);
            drillModal.getTable().waitLoaded().click(0, 0);
            drillModal.hasTitleHeader("Table with years › " + YEAR_2010 + " › " + "Q2/" + YEAR_2010);
            drillModal.getTable().hasCellValue(0, 0, "Jun 2010");
            drillModal.close();

            TABLE_WITH_YEAR.forEach((value, index) => {
                firstWidget.waitTableLoaded().getTable().hasCellValue(index, 2, value);
            });
            firstWidget.waitTableLoaded().getTable().click(0, 1);
            drillModal.hasTitleHeader("Table with years › " + DIRECT_SALES);
            PRODUCT_NAMES.forEach((value, index) => {
                drillModal.getTable().hasCellValue(index, 0, value);
            });
            drillModal.getTable().waitLoaded().click(0, 0);
            drillModal.hasTitleHeader("Table with years › " + DIRECT_SALES + " › CompuSci");
            drillModal.back();
            //api.setUpDrillDownAttribute(DISPLAYFORM_PRODUCT);
        });

        it("Can not drill down with table that only has measures and columns", () => {
            Navigation.visit("dashboard/dashboard-table-drill-down");
            new Widget(4)
                .scrollIntoView()
                .waitTableLoaded()
                .getTable()
                .hasCellValue(0, 0, "$12,076,034.56")
                .isCellUnderlined(DIRECT_SALES, false);
        });

        it("Should drill down on heat map chart", () => {
            Navigation.visit("dashboard/heatmap-drill-down");
            //api.setUpDrillDownAttribute(DISPLAYFORM_PRODUCT);
            heatmapInsights.forEach((insight, index) => {
                new Widget(index)
                    .scrollIntoView()
                    .waitChartLoaded()
                    .getChart()
                    .hasTooltipContents(0, 0, insight.tooltip)
                    .clickCellHeatMap(0);
                drillModal
                    .waitForDrillModalViz()
                    .hasTitleHeader(insight.title + " › " + insight.firstCellValue)
                    .getChart()
                    .hasDataLabelValues(insight.value);
                drillModal.close();
            });
        });

        it("Can not drill down on heat map chart has only measure", () => {
            Navigation.visit("dashboard/heatmap-drill-down");
            const thirdWidget = new Widget(3);
            thirdWidget
                .scrollIntoView()
                .waitChartLoaded()
                .getChart()
                .hasDataLabelValues(["$116,625,456.54"])
                .isColumnHighlighted("$116,625,456.54", false);
        });

        it("Drilling down on heat map chart with two drillable attributes", () => {
            Navigation.visit("dashboard/heatmap-drill-down");
            //api.setUpDrillDownAttribute(DISPLAYFORM_PRODUCT, YEAR_CLOSE);
            firstWidget.waitChartLoaded().getChart().clickCellHeatMap(0);
            drillModal
                .hasTitleHeader("heat map only row measure › " + INSIDE_SALES)
                .getChart()
                .hasDataLabelValues(PRODUCT_VALUE)
                .clickCellHeatMap(0);

            drillModal
                .hasTitleHeader("heat map only row measure › " + INSIDE_SALES + " › WonderKid")
                .getChart()
                .hasDataLabelValues([
                    "$8,560.00",
                    "$4,274.40",
                    "$1,001,723.68",
                    "$915,932.67",
                    "$1,382,467.58",
                ]);
            drillModal.back().getChart().hasDataLabelValues(PRODUCT_VALUE);
            //api.setUpDrillDownAttribute(DISPLAYFORM_PRODUCT);
        });

        it("drilling down on heat map that have two drillable attributes on the difference bucket", () => {
            const secondWidget = new Widget(2);
            Navigation.visit("dashboard/heatmap-drill-down");
            //api.setUpDrillDownAttribute(DISPLAYFORM_PRODUCT, YEAR_CLOSE);
            secondWidget.scrollIntoView().waitChartLoaded().getChart().clickCellHeatMap(0);

            drillModal
                .selectDropdownAttribute(INSIDE_SALES)
                .hasTitleHeader("heat map has measure column row › " + INSIDE_SALES)
                .getChart()
                .clickCellHeatMap(0);

            drillModal
                .selectDropdownAttribute("WonderKid")
                .hasTitleHeader("heat map has measure column row › " + INSIDE_SALES + " › WonderKid")
                .getChart()
                .hasDataLabelValues([
                    "$8,560.00",
                    "$4,274.40",
                    "$1,001,723.68",
                    "$915,932.67",
                    "$1,382,467.58",
                ]);

            drillModal
                .back()
                .hasTitleHeader("heat map has measure column row › " + INSIDE_SALES)
                .close();

            secondWidget.scrollIntoView().waitChartLoaded().getChart().clickCellHeatMap(0);

            drillModal
                .selectDropdownAttribute("CompuSci")
                .hasTitleHeader("heat map has measure column row › CompuSci")
                .getChart()
                .hasDataLabelValues([
                    "$1,761,522.97",
                    "$2,757,078.40",
                    "$6,955,359.58",
                    "$162,599.00",
                    "$3,644.00",
                    "$3,476,276.54",
                    "$5,690,108.03",
                    "$5,639,031.41",
                    "$777,279.71",
                ]);
            //api.setUpDrillDownAttribute(DISPLAYFORM_PRODUCT);
        });

        it("Drilling down on chart that have two attribute same bucket with two drillable attributes", () => {
            Navigation.visit("dashboard/drilldown-on-chart");
            const bulletWidget = new Widget(1);
            //api.setUpDrillDownAttribute(DISPLAYFORM_PRODUCT, YEAR_CLOSE);
            bulletWidget
                .scrollIntoView()
                .waitChartLoaded()
                .getChart()
                .hasTooltipContents(0, 0, [
                    "Department",
                    "Direct Sales",
                    "Product",
                    "CompuSci",
                    "Amount",
                    "$15,582,695.69",
                ])
                .clickSeriesPoint(0);

            drillModal
                .selectDropdownAttribute(DIRECT_SALES)
                .hasTitleHeader("bullet with two attributes same bucket › " + DIRECT_SALES)
                .waitForDrillModalViz()
                .getChart()
                .hasTooltipContents(0, 0, ["Product", "CompuSci", "Amount", "$15,582,695.69"])
                .clickSeriesPoint(0);

            drillModal
                .hasTitleHeader("bullet with two attributes same bucket › " + DIRECT_SALES + " › CompuSci")
                .getChart()
                .hasTooltipContents(0, 0, ["Year (Closed)", "2010", "Amount", "$3,476,276.54"]);
            drillModal.back();

            drillModal
                .hasTitleHeader("bullet with two attributes same bucket › " + DIRECT_SALES)
                .waitForDrillModalViz()
                .getChart()
                .hasTooltipContents(0, 0, ["Product", "CompuSci", "Amount", "$15,582,695.69"])
                .clickSeriesPoint(0);
            drillModal.close();

            bulletWidget.scrollIntoView().waitChartLoaded().getChart().clickSeriesPoint(0, 0);
            drillModal
                .selectDropdownAttribute("CompuSci")
                .hasTitleHeader("bullet with two attributes same bucket › CompuSci")
                .waitForDrillModalViz()
                .getChart()
                .hasTooltipContents(0, 0, ["Year (Closed)", "2010", "Amount", "$3,476,276.54"]);

            drillModal.close();
            //api.setUpDrillDownAttribute(DISPLAYFORM_PRODUCT);
        });

        it("Drilling down on charts that have two drillable attributes separates with date filter", () => {
            Navigation.visit("dashboard/drilldown-on-chart");
            const dateFilter = new DateFilter().open().selectAbsoluteForm();
            new DateFilterAbsoluteForm()
                .openFromRangePicker()
                .typeIntoFromRangePickerInput("01/01/2011")
                .openToRangePicker()
                .typeIntoToRangePickerInput("12/31/2012");
            dateFilter.apply().subtitleHasValue("01/01/2011 – 12/31/2012");

            firstWidget
                .scrollIntoView()
                .waitChartLoaded()
                .getChart()
                .hasTooltipContents(0, 0, [
                    "Department",
                    "Direct Sales",
                    "Year (Closed)",
                    "2011",
                    "Amount",
                    "$40,105,983.96",
                ])
                .clickSeriesPoint(0, 0);

            drillModal
                .selectDropdownAttribute(DIRECT_SALES)
                .hasTitleHeader("Column with two drillable attributes › " + DIRECT_SALES)
                .waitForDrillModalViz()
                .getChart()
                .hasTooltipContents(0, 0, [
                    "Product",
                    "CompuSci",
                    "Year (Closed)",
                    "2011",
                    "Amount",
                    "$5,690,108.03",
                ]);
            drillModal.close();

            firstWidget.getChart().clickSeriesPoint(1, 0);
            drillModal
                .selectDropdownAttribute("2012")
                .hasTitleHeader("Column with two drillable attributes › 2012")
                .waitForDrillModalViz()
                .getChart()
                .hasTooltipContents(0, 0, [
                    "Department",
                    "Direct Sales",
                    "Quarter/Year (Closed)",
                    "Q1/2012",
                    "Amount",
                    "$8,217,514.98",
                ]);
        });
    });

    // Can be removed once migrated to tiger or once decided that we don't want to migrate the test.
    // eslint-disable-next-line jest/no-disabled-tests
    describe.skip("implicit drill to attribute url", { tags: ["post-merge_integrated_bear"] }, () => {
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

    // Can be removed once migrated to tiger or once decided that we don't want to migrate the test.
    // eslint-disable-next-line jest/no-disabled-tests
    describe.skip("Advanced drill down", { tags: ["post-merge_integrated_bear"] }, () => {
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

            drillModal.getModalText().should("have.text", "Sorry, we can't display this visualization");
        });

        it("Drill down on column chart with invalid drill", () => {
            Navigation.visit("dashboard/dashboard-target");
            new Widget(1).scrollIntoView().waitChartLoaded().getChart().waitLoaded().clickSeriesPoint(0, 0);

            drillModal.getModalText().should("have.text", "Sorry, we can't display this visualization");
        });

        it("Check attribute value when drilling in bubble chart", () => {
            Navigation.visit("dashboard/dashboard-target");
            new Widget(2).scrollIntoView().waitChartLoaded().getChart().waitLoaded().clickSeriesPoint(1, 0);

            drillModal.getTable().getColumnValues(0).should("deep.equal", ["2011"]);
        });
    });
});
