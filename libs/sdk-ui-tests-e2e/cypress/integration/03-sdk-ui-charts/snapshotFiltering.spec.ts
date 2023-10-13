// (C) 2021 GoodData Corporation
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

describe("Insight with FIRST_VALUE/LAST_VALUE functions", { tags: "checklist_integrated_tiger" }, () => {
    it(`check insight with FIRST_VALUE, LAST_VALUE function of order`, () => {
        Navigation.visit(
            "visualizations/pivot-table/firstvaluelastvalue/pivot-table-of-first-last-value-with-order",
        );
        table.waitLoaded();
        table.getColumnValues(0).should("deep.equal", ["205,434,904.22"]);
        table.getColumnValues(1).should("deep.equal", ["166,985,877.61"]);
        table.getColumnValues(2).should("deep.equal", ["166,985,877.61"]);
        table.getColumnValues(3).should("deep.equal", ["205,434,904.22"]);
    });

    it(`check insight with FIRST_VALUE, LAST_VALUE function of quarter`, () => {
        Navigation.visit(
            "visualizations/pivot-table/firstvaluelastvalue/pivot-table-of-first-last-value-with-quarter",
        );
        table.waitLoaded();
        table
            .getColumnValues(2)
            .should("deep.equal", [
                "3,782,819.08",
                "3,782,819.08",
                "3,782,819.08",
                "45,451,566.19",
                "45,451,566.19",
                "45,451,566.19",
                "45,451,566.19",
            ]);
        table
            .getColumnValues(3)
            .should("deep.equal", [
                "47,410,840.57",
                "47,410,840.57",
                "47,410,840.57",
                "16,739,606.15",
                "16,739,606.15",
                "16,739,606.15",
                "16,739,606.15",
            ]);
    });

    it(`check insight with FIRST_VALUE, LAST_VALUE function of within attribute`, () => {
        Navigation.visit(
            "visualizations/pivot-table/firstvaluelastvalue/pivot-table-of-first-last-value-within-attribute",
        );
        table.waitLoaded();
        table
            .getColumnValues(1)
            .should("deep.equal", [
                "11,707,748.68",
                "17,922,937.68",
                "72,322,103.05",
                "75,374,703.58",
                "8,182,197.40",
            ]);
        table
            .getColumnValues(2)
            .should("deep.equal", [
                "8,811,958.20",
                "46,812,340.80",
                "111,033,603.96",
                "180,091,143.53",
                "9,425,523.72",
            ]);
    });

    it(`check insight with FIRST_VALUE, LAST_VALUE function of run sum`, () => {
        Navigation.visit(
            "visualizations/pivot-table/firstvaluelastvalue/pivot-table-of-first-last-value-with-run-sum",
        );
        table.waitLoaded();
        table
            .getColumnValues(3)
            .should("deep.equal", ["72,322,103.05", "147,696,806.63", "–", "–", "–", "–"]);
        table
            .getColumnValues(4)
            .should("deep.equal", ["72,322,103.05", "147,696,806.63", "–", "–", "–", "–"]);
    });

    it(`check insight with FIRST_VALUE, LAST_VALUE function of previous`, () => {
        Navigation.visit(
            "visualizations/pivot-table/firstvaluelastvalue/pivot-table-of-first-last-value-with-previous",
        );
        table.waitLoaded();
        table.getColumnValues(1).should("deep.equal", ["404,437.78", "–", "1,044,000.00"]);
        table.getColumnValues(2).should("deep.equal", ["51,702,180.70", "37,373,398.72", "19,700,474.52"]);
    });

    it(`check insight with FIRST_VALUE, LAST_VALUE function of POP`, () => {
        Navigation.visit(
            "visualizations/pivot-table/firstvaluelastvalue/pivot-table-of-first-last-value-with-pop",
        );
        table.waitLoaded();
        table
            .getColumnValues(2)
            .should("deep.equal", ["4,994,872.73", "404,437.78", "6,308,438.17", "161,942.48", "–", "–"]);
        table
            .getColumnValues(3)
            .should("deep.equal", ["258,770.40", "51,702,180.70", "3,969,181.80", "4,213,015.60", "–", "–"]);
        table
            .getColumnValues(4)
            .should("deep.equal", ["–", "–", "4,994,872.73", "404,437.78", "6,308,438.17", "161,942.48"]);
        table
            .getColumnValues(5)
            .should("deep.equal", ["–", "–", "258,770.40", "51,702,180.70", "3,969,181.80", "4,213,015.60"]);
    });

    // Will enable this test when CAL-1100 is solved
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip(`check insight with FIRST_VALUE, LAST_VALUE function of rank`, () => {
        Navigation.visit(
            "visualizations/pivot-table/firstvaluelastvalue/pivot-table-of-first-last-value-with-rank",
        );
        table.waitLoaded();
        table
            .getColumnValues(3)
            .should("deep.equal", ["1.00", "1.00", "249,442.00", "249,442.00", "269,790.00", "269,790.00"]);
        table
            .getColumnValues(4)
            .should("deep.equal", [
                "141,161.00",
                "141,161.00",
                "162,051.00",
                "162,051.00",
                "37,020.00",
                "37,020.00",
            ]);
    });

    it(`check insight with FIRST_VALUE, LAST_VALUE function of run var`, () => {
        Navigation.visit(
            "visualizations/pivot-table/firstvaluelastvalue/pivot-table-of-first-last-value-with-runvar",
        );
        table.waitLoaded();
        table
            .getColumnValues(3)
            .should("deep.equal", [
                "0.00",
                "6,644,109,505.12",
                "2,234,457,654.05",
                "0.00",
                "37,503,132.32",
                "176,421,008.08",
            ]);
        table
            .getColumnValues(4)
            .should("deep.equal", [
                "7,943,735,733.70",
                "2,900,380,588.62",
                "1,534,245,999.06",
                "37,503,132.32",
                "174,008,711.54",
                "76,370,757.75",
            ]);
    });
});
