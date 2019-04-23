// (C) 2007-2019 GoodData Corporation
import { Selector } from "testcafe";
import { config } from "./utils/config";
import { loginUsingLoginForm, waitForPivotTableStopLoading } from "./utils/helpers";

const totalValues = {
    sum: ["Sum", "", "", "$1,566,007", "$150,709"],
    max: ["Max", "", "", "$101,055", "$25,140"],
    nat: ["Rollup (Total)", "", "", "$406,007", "$150,709"],
    empty: "–",
};

const getMeasureCell = column => {
    return Selector(`.s-table-measure-column-header-cell-${column}`);
};

const getMeasureGroupCell = column => {
    return Selector(`.s-table-measure-column-header-group-cell-${column}`);
};

const getPivotTableFooterCell = (row, column) => {
    return Selector(`[row-index="b-${row}"] .s-cell-${row}-${column}`);
};

const getMenu = cell => {
    return cell.find(".s-table-header-menu");
};

const clickOnMenuAggregationItem = async (t, cell, aggregationItemClass) => {
    const menu = getMenu(cell);

    await t.hover(cell);
    await t.click(menu);

    const sumTotal = Selector(aggregationItemClass).find(".s-menu-aggregation-inner");
    await t.click(sumTotal);
    await waitForPivotTableStopLoading(t);
};

fixture("Pivot Table Menu")
    .page(config.url)
    .beforeEach(async t => {
        await loginUsingLoginForm(`${config.url}/hidden/pivot-table-dynamic`)(t);

        await t.click(Selector(".s-total-preset-aggregations"));

        // Cells in ag-grid are windowed (only cells that are in the ag-grid
        // viewport are visible). Since we need to click on cells that are not
        // by default visible we need to make the table bigger so they render.
        // Another option would be to scroll on ag-grid but scroll actions does
        // not seem to be implemented in test-cafe.
        await t.click(Selector(".s-total-preset-wide"));

        await waitForPivotTableStopLoading(t);
    });

test("should show menu toggler button when mouse hovers over the cell", async t => {
    const measureCell = getMeasureCell(0);
    const menuToggler = getMenu(measureCell);

    await t.hover(measureCell);
    await t.expect(menuToggler.visible).eql(true);

    const anotherCell = getMeasureGroupCell(0);
    await t.hover(anotherCell);
    await t.expect(menuToggler.visible).eql(false);
});

test("should open/close menu content when mouse clicks on menu toggler", async t => {
    const measureCell = getMeasureCell(0);
    const menuToggler = getMenu(measureCell);
    const menuContentItem = Selector(".s-menu-aggregation-sum");

    await t.expect(menuContentItem.exists).eql(false);
    await t.hover(measureCell);

    await t.click(menuToggler);
    await t.expect(menuContentItem.visible).eql(true);

    await t.click(menuToggler);
    await t.expect(menuContentItem.exists).eql(false);
});

test("should add totals for first measure, when selected from menu in measure", async t => {
    const measureCell = getMeasureCell(0);

    await t.expect(getPivotTableFooterCell(0, 0).exists).eql(false);

    await clickOnMenuAggregationItem(t, measureCell, ".s-menu-aggregation-sum");

    await t.expect(getPivotTableFooterCell(0, 0).textContent).eql(totalValues.sum[0]);
    await t.expect(getPivotTableFooterCell(0, 3).textContent).eql(totalValues.sum[3]);
    await t.expect(getPivotTableFooterCell(0, 4).textContent).eql(totalValues.empty);
    await t.expect(getPivotTableFooterCell(1, 0).exists).eql(false);
});

test("should add a native total for first measure, when selected from menu in measure", async t => {
    const measureCell = getMeasureCell(0);

    await t.expect(getPivotTableFooterCell(0, 0).exists).eql(false);

    await clickOnMenuAggregationItem(t, measureCell, ".s-menu-aggregation-nat");

    await t.expect(getPivotTableFooterCell(0, 0).textContent).eql(totalValues.nat[0]);
    await t.expect(getPivotTableFooterCell(0, 3).textContent).eql(totalValues.nat[3]);
    await t.expect(getPivotTableFooterCell(0, 4).textContent).eql(totalValues.empty);
    await t.expect(getPivotTableFooterCell(1, 0).exists).eql(false);
});

test("should add totals for all measures, when selected from menu in measure group", async t => {
    const measureCell = getMeasureGroupCell(0);
    await clickOnMenuAggregationItem(t, measureCell, ".s-menu-aggregation-sum");

    await t.expect(getPivotTableFooterCell(0, 0).textContent).eql(totalValues.sum[0]);
    await t.expect(getPivotTableFooterCell(0, 3).textContent).eql(totalValues.sum[3]);
    await t.expect(getPivotTableFooterCell(0, 4).textContent).eql(totalValues.sum[4]);
});

test("should add totals for one measure and then turn it off", async t => {
    const measureCell = getMeasureCell(0);

    await clickOnMenuAggregationItem(t, measureCell, ".s-menu-aggregation-sum");
    await t.expect(getPivotTableFooterCell(0, 0).textContent).eql(totalValues.sum[0]);
    await t.expect(getPivotTableFooterCell(0, 3).textContent).eql(totalValues.sum[3]);
    await t.expect(getPivotTableFooterCell(0, 4).textContent).eql(totalValues.empty);

    await clickOnMenuAggregationItem(t, measureCell, ".s-menu-aggregation-sum");
    await t.expect(getPivotTableFooterCell(0, 0).exists).eql(false);
});

test("should add totals for all measures and then turn them off", async t => {
    const measureCell = getMeasureGroupCell(0);

    await clickOnMenuAggregationItem(t, measureCell, ".s-menu-aggregation-sum");
    await t.expect(getPivotTableFooterCell(0, 0).textContent).eql(totalValues.sum[0]);
    await t.expect(getPivotTableFooterCell(0, 3).textContent).eql(totalValues.sum[3]);
    await t.expect(getPivotTableFooterCell(0, 4).textContent).eql(totalValues.sum[4]);

    await clickOnMenuAggregationItem(t, measureCell, ".s-menu-aggregation-sum");
    await t.expect(getPivotTableFooterCell(0, 0).exists).eql(false);
});

test("should add totals for group and then turn them all off with individual measures", async t => {
    const measureGroup = getMeasureGroupCell(0);
    await clickOnMenuAggregationItem(t, measureGroup, ".s-menu-aggregation-sum");
    await t.expect(getPivotTableFooterCell(0, 0).textContent).eql(totalValues.sum[0]);
    await t.expect(getPivotTableFooterCell(0, 3).textContent).eql(totalValues.sum[3]);
    await t.expect(getPivotTableFooterCell(0, 4).textContent).eql(totalValues.sum[4]);

    const measureCell1 = getMeasureCell(0);
    await clickOnMenuAggregationItem(t, measureCell1, ".s-menu-aggregation-sum");
    await t.expect(getPivotTableFooterCell(0, 0).textContent).eql(totalValues.sum[0]);
    await t.expect(getPivotTableFooterCell(0, 3).textContent).eql(totalValues.empty);
    await t.expect(getPivotTableFooterCell(0, 4).textContent).eql(totalValues.sum[4]);

    const measureCell2 = getMeasureCell(1);
    await clickOnMenuAggregationItem(t, measureCell2, ".s-menu-aggregation-sum");
    await t.expect(getPivotTableFooterCell(0, 0).exists).eql(false);
});

// test("should turn on/off multiple totals", async t => {
//     const measureCell = getMeasureCell(0);
//     const measureGroup = getMeasureGroupCell(0);
//
//     await clickOnMenuAggregationItem(t, measureCell, ".s-menu-aggregation-sum");
//     await t.expect(getPivotTableFooterCell(0, 0).textContent).eql(totalValues.sum[0]);
//     await t.expect(getPivotTableFooterCell(0, 3).textContent).eql(totalValues.sum[3]);
//     await t.expect(getPivotTableFooterCell(0, 4).textContent).eql(totalValues.empty);
//     await t.expect(getPivotTableFooterCell(1, 0).exists).eql(false);
//
//     await clickOnMenuAggregationItem(t, measureGroup, ".s-menu-aggregation-max");
//     await t.expect(getPivotTableFooterCell(0, 0).textContent).eql(totalValues.sum[0]);
//     await t.expect(getPivotTableFooterCell(0, 3).textContent).eql(totalValues.sum[3]);
//     await t.expect(getPivotTableFooterCell(0, 4).textContent).eql(totalValues.empty);
//     await t.expect(getPivotTableFooterCell(1, 0).textContent).eql(totalValues.max[0]);
//     await t.expect(getPivotTableFooterCell(1, 3).textContent).eql(totalValues.max[3]);
//     await t.expect(getPivotTableFooterCell(1, 4).textContent).eql(totalValues.max[4]);
//     await t.expect(getPivotTableFooterCell(2, 0).exists).eql(false);
//
//     await clickOnMenuAggregationItem(t, measureGroup, ".s-menu-aggregation-sum");
//     await t.expect(getPivotTableFooterCell(0, 0).textContent).eql(totalValues.sum[0]);
//     await t.expect(getPivotTableFooterCell(0, 3).textContent).eql(totalValues.sum[3]);
//     await t.expect(getPivotTableFooterCell(0, 4).textContent).eql(totalValues.sum[4]);
//     await t.expect(getPivotTableFooterCell(1, 0).textContent).eql(totalValues.max[0]);
//     await t.expect(getPivotTableFooterCell(1, 3).textContent).eql(totalValues.max[3]);
//     await t.expect(getPivotTableFooterCell(1, 4).textContent).eql(totalValues.max[4]);
//
//     await clickOnMenuAggregationItem(t, measureGroup, ".s-menu-aggregation-sum");
//     await t.expect(getPivotTableFooterCell(0, 0).textContent).eql(totalValues.max[0]);
//     await t.expect(getPivotTableFooterCell(0, 3).textContent).eql(totalValues.max[3]);
//     await t.expect(getPivotTableFooterCell(0, 4).textContent).eql(totalValues.max[4]);
//     await t.expect(getPivotTableFooterCell(1, 0).exists).eql(false);
//
//     await clickOnMenuAggregationItem(t, measureGroup, ".s-menu-aggregation-max");
//     await t.expect(getPivotTableFooterCell(0, 0).exists).eql(false);
// });

test("hovering over menu does not show sorting icon", async t => {
    const measureCell = getMeasureCell(0);
    const menuToggler = getMenu(measureCell);
    const sortArrow = Selector(".s-sort-direction-arrow");

    await t.hover(measureCell);
    await t.expect(sortArrow.exists).eql(true);

    await t.hover(menuToggler);
    await t.expect(sortArrow.exists).eql(false);
});
