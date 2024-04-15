// (C) 2021-2024 GoodData Corporation
import * as Navigation from "../../tools/navigation";
import { Table } from "../../tools/table";

const table = new Table(".s-pivot-table");

describe("Insight with MAX/MIN functions", { tags: "checklist_integrated_tiger" }, () => {
    it(`check insight with MAX function of Year macro`, () => {
        Navigation.visit("visualizations/pivot-table/maxmin/pivot-table-of-max-with-macro-year");
        table.waitLoaded();
        table
            .getColumnValues(2)
            .should("deep.equal", ["–", "1,715,220,318.80", "514,845,231.57", "19,844,348.22"]);
        table.getColumnValues(3).should("deep.equal", ["3,203,400.73", "–", "–", "–"]);
    });

    it(`check insight with MAX function of case when`, () => {
        Navigation.visit("visualizations/pivot-table/maxmin/pivot-table-of-max-with-case-when");
        table.waitLoaded();
        table
            .getColumnValues(4)
            .should("deep.equal", [
                "–",
                "–",
                "25,878,905.96",
                "–",
                "–",
                "–",
                "42,319,455.63",
                "8,359,752.04",
                "12,608,380.27",
                "49,953,753.31",
                "26,984.40",
                "–",
                "–",
                "–",
                "–",
            ]);
    });

    it(`check insight with MIN function of if then`, () => {
        Navigation.visit("visualizations/pivot-table/maxmin/pivot-table-of-min-with-if-then");
        table.waitLoaded();
        table
            .getColumnValues(4)
            .should("deep.equal", [
                "–",
                "–",
                "–",
                "25,878,905.96",
                "–",
                "–",
                "12,608,380.27",
                "22,801,433.61",
                "34,506,395.03",
                "13,541,923.93",
                "–",
                "–",
                "–",
                "–",
            ]);
    });

    it(`check insight with MIN function of by all other`, () => {
        Navigation.visit("visualizations/pivot-table/maxmin/pivot-table-of-min-with-by-all-other");
        table.waitLoaded();
        table
            .getColumnValues(3)
            .should("deep.equal", [
                "1,271,348,691.47",
                "–",
                "–",
                "–",
                "1,715,220,318.80",
                "–",
                "–",
                "155,389,542.37",
            ]);
        table
            .getColumnValues(4)
            .should("deep.equal", [
                "1,271,348,691.47",
                "–",
                "–",
                "–",
                "1,715,220,318.80",
                "–",
                "–",
                "155,389,542.37",
            ]);
    });
});

describe("Insight with Date arithmetics functions", { tags: "checklist_integrated_tiger" }, () => {
    it(`check insight with DATETIME_ADD function of between`, () => {
        Navigation.visit(
            "visualizations/pivot-table/datearithmetics/pivot-table-of-datetime-add-with-between",
        );
        table.waitLoaded();
        table
            .getColumnValues(2)
            .should("deep.equal", ["49,481,271.67", "242,557,188.77", "841,016,772.34", "–", "–"]);
        table.getColumnValues(3).should("deep.equal", ["–", "–", "–", "1,715,220,318.80", "1,690,326.92"]);
    });

    it(`check insight with DATETIME_ADD function of all granularities`, () => {
        Navigation.visit(
            "visualizations/pivot-table/datearithmetics/pivot-table-of-datetime-add-with-all-granularities",
        );
        table.waitLoaded();
        table
            .getColumnValues(2)
            .should("deep.equal", ["–", "–", "826,241,831.70", "1,715,220,318.80", "1,690,326.92"]);
        table.getColumnValues(3).should("deep.equal", ["–", "242,557,188.77", "–", "–", "–"]);
        table.getColumnValues(4).should("deep.equal", ["–", "–", "85,370,158.02", "–", "–"]);
        table.getColumnValues(5).should("deep.equal", ["–", "–", "12,535,021.81", "–", "–"]);
        table
            .getColumnValues(6)
            .should("deep.equal", [
                "49,481,271.67",
                "242,557,188.77",
                "841,016,772.34",
                "27,146,362.12",
                "–",
            ]);
        table.getColumnValues(7).should("deep.equal", ["–", "–", "–", "1,513,443,673.30", "1,690,326.92"]);
    });

    it(`check insight with DATETIME_ADD function of POP`, () => {
        Navigation.visit("visualizations/pivot-table/datearithmetics/pivot-table-of-datetime-add-with-pop");
        table.waitLoaded();
        table.getRowValues(0).should("deep.equal", ["Jan 2010", "47,497,811.26", "54,854,037.02", "–", "–"]);
        table.getRowValues(1).should("deep.equal", ["Feb 2010", "–", "–", "54,854,037.02", "93,307,617.47"]);
    });

    it(`check insight with DATETIME_ADD function of count`, () => {
        Navigation.visit("visualizations/pivot-table/datearithmetics/pivot-table-of-datetime-add-with-count");
        table.waitLoaded();
        table.getRowValues(1).should("deep.equal", ["2010", "2010", "20.00", "15.00", "-1.00", "–"]);
        table.getRowValues(3).should("deep.equal", ["2010", "2012", "5.00", "–", "-1.00", "–"]);
        table.getRowValues(5).should("deep.equal", ["2011", "2010", "–", "15.00", "1.00", "–"]);
    });

    it(`check insight with DATETIME_DIFF function of year`, () => {
        Navigation.visit("visualizations/pivot-table/datearithmetics/pivot-table-of-datetime-diff-with-year");
        table.waitLoaded();
        table
            .getRowValues(0)
            .should("deep.equal", ["2010", "2010", "0.00", "0.00", "14.00", "11.00", "13.00", "5.00"]);
        table
            .getRowValues(3)
            .should("deep.equal", ["2011", "2010", "-1.00", "-1.00", "13.00", "10.00", "13.00", "4.00"]);
        table
            .getRowValues(6)
            .should("deep.equal", ["2012", "2010", "-2.00", "-2.00", "12.00", "9.00", "13.00", "3.00"]);
    });

    it(`check insight with DATETIME_DIFF function of month`, () => {
        Navigation.visit(
            "visualizations/pivot-table/datearithmetics/pivot-table-of-datetime-diff-with-month",
        );
        table.waitLoaded();
        table
            .getRowValues(0)
            .should("deep.equal", ["Jun 2010", "Jun 2010", "0.00", "5.00", "6.00", "-5.00", "-6.00", "0.00"]);
        table
            .getRowValues(5)
            .should("deep.equal", [
                "Jun 2010",
                "Nov 2010",
                "5.00",
                "10.00",
                "1.00",
                "-5.00",
                "-1.00",
                "0.00",
            ]);
        table
            .getRowValues(7)
            .should("deep.equal", [
                "Jul 2010",
                "Jun 2010",
                "-1.00",
                "5.00",
                "6.00",
                "-6.00",
                "-6.00",
                "0.00",
            ]);
    });

    it(`check insight with DATETIME_DIFF function of week and params`, () => {
        Navigation.visit(
            "visualizations/pivot-table/datearithmetics/pivot-table-of-datetime-diff-with-week-check-params",
        );
        table.waitLoaded();
        table.getRowValues(1).should("deep.equal", ["22/2010", "-1,015.00", "-1,015.00"]);
        table.getRowValues(7).should("deep.equal", ["28/2010", "-1,081.00", "-1,081.00"]);
    });

    it(`check insight with DATETIME_DIFF function of week and other cases`, () => {
        Navigation.visit(
            "visualizations/pivot-table/datearithmetics/pivot-table-of-datetime-diff-with-week-check-others",
        );
        table.waitLoaded();
        table
            .getRowValues(0)
            .should("deep.equal", ["2010", "2010", "0.00", "0.00", "14.00", "11.00", "13.00", "5.00"]);
        table
            .getRowValues(3)
            .should("deep.equal", ["2011", "2010", "-1.00", "-1.00", "13.00", "10.00", "13.00", "4.00"]);
        table
            .getRowValues(6)
            .should("deep.equal", ["2012", "2010", "-2.00", "-2.00", "12.00", "9.00", "13.00", "3.00"]);
    });

    it(`check insight with DATETIME_DIFF function of comparing`, () => {
        Navigation.visit(
            "visualizations/pivot-table/datearithmetics/pivot-table-of-datetime-diff-with-compare",
        );
        table.waitLoaded();
        table.getRowValues(0).should("deep.equal", ["2010", "2008", "–", "7.00", "20.00", "–"]);
        table.getRowValues(1).should("deep.equal", ["2010", "2009", "–", "16.00", "20.00", "–"]);
        table.getRowValues(2).should("deep.equal", ["2010", "2010", "–", "20.00", "20.00", "20.00"]);
        table.getRowValues(3).should("deep.equal", ["2010", "2011", "11.00", "–", "–", "11.00"]);
        table.getRowValues(4).should("deep.equal", ["2011", "2008", "–", "–", "17.00", "–"]);
        table.getRowValues(7).should("deep.equal", ["2011", "2011", "20.00", "–", "20.00", "20.00"]);
    });
});
