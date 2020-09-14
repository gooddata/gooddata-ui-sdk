// (C) 2007-2020 GoodData Corporation
import { Selector } from "testcafe";
import { navigateToStory } from "../_infra/testcafeUtils";
import {
    getMenu,
    getMeasureCell,
    getMeasureGroupCell,
    getPivotTableFooterCell,
    waitForPivotTableStopLoading,
    checkCellValue,
} from "./utils";

const clickOnMenuAggregationItem = async (t, cell, aggregationItemClass, attribute) => {
    await t.hover(cell);
    const menu = getMenu(cell);
    await t.click(menu);

    const sumTotal = Selector(aggregationItemClass).find(".s-menu-aggregation-inner");

    if (attribute) {
        await t.hover(sumTotal);
        await t.wait(1000);
        const submenu = Selector(".s-table-header-submenu-content");
        await t.click(submenu.find(`.s-aggregation-item-${attribute}`));
    } else {
        await t.click(sumTotal);
    }

    await waitForPivotTableStopLoading(t);
};

const nonEmptyValue = /\$?[0-9,.]+/;

fixture("Pivot Table Aggregations menu").beforeEach(
    navigateToStory("50-stories-for-e2e-tests-pivot-table--complex-table-with-aggregations-menu"),
);

test("should show menu toggler button when mouse hovers over the cell", async (t) => {
    const measureCell = getMeasureCell(0);
    const menuToggler = getMenu(measureCell);

    await t.hover(measureCell);
    await t.expect(menuToggler.visible).eql(true);

    const anotherCell = getMeasureGroupCell(0);
    await t.hover(anotherCell);
    await t.expect(menuToggler.visible).eql(false);
});

test("hovering over menu does not show sorting icon", async (t) => {
    const measureCell = getMeasureCell(0);
    const menuToggler = getMenu(measureCell);
    const sortArrow = Selector(".s-sort-direction-arrow");

    await t.hover(measureCell);
    await t.expect(sortArrow.exists).eql(true);

    await t.hover(menuToggler);
    await t.expect(sortArrow.exists).eql(false);
});

test("should add totals for one measure and then turn it off", async (t) => {
    const measureCell = getMeasureCell(0);

    await clickOnMenuAggregationItem(t, measureCell, ".s-menu-aggregation-sum");
    await t.expect(getPivotTableFooterCell(0, 0).textContent).eql("Sum");
    await t.expect(getPivotTableFooterCell(0, 2).textContent).match(nonEmptyValue);
    await t.expect(getPivotTableFooterCell(0, 3).textContent).notMatch(nonEmptyValue);
    await t.expect(getPivotTableFooterCell(1, 0).exists).eql(false);

    await clickOnMenuAggregationItem(t, measureCell, ".s-menu-aggregation-sum");
    await t.expect(getPivotTableFooterCell(0, 0).exists).eql(false);
});

test("should add totals for all measures and then turn them off", async (t) => {
    const measureCell = getMeasureGroupCell(0);

    await clickOnMenuAggregationItem(t, measureCell, ".s-menu-aggregation-sum");
    await t.expect(getPivotTableFooterCell(0, 0).textContent).eql("Sum");
    await t.expect(getPivotTableFooterCell(0, 2).textContent).match(nonEmptyValue);
    await t.expect(getPivotTableFooterCell(0, 3).textContent).match(nonEmptyValue);

    await clickOnMenuAggregationItem(t, measureCell, ".s-menu-aggregation-sum");
    await t.expect(getPivotTableFooterCell(0, 0).exists).eql(false);
});

test("should add totals for group and then turn them all off with individual measures", async (t) => {
    const measureGroup = getMeasureGroupCell(0);
    await clickOnMenuAggregationItem(t, measureGroup, ".s-menu-aggregation-sum");
    await t.expect(getPivotTableFooterCell(0, 0).textContent).eql("Sum");
    await t.expect(getPivotTableFooterCell(0, 2).textContent).match(nonEmptyValue);
    await t.expect(getPivotTableFooterCell(0, 3).textContent).match(nonEmptyValue);

    const measureCell1 = getMeasureCell(1);
    await clickOnMenuAggregationItem(t, measureCell1, ".s-menu-aggregation-sum");
    await t.expect(getPivotTableFooterCell(0, 0).textContent).eql("Sum");
    await t.expect(getPivotTableFooterCell(0, 2).textContent).match(nonEmptyValue);
    await t.expect(getPivotTableFooterCell(0, 3).textContent).notMatch(nonEmptyValue);

    const measureCell0 = getMeasureCell(0);
    await clickOnMenuAggregationItem(t, measureCell0, ".s-menu-aggregation-sum");
    await t.expect(getPivotTableFooterCell(0, 0).exists).eql(false);
});

test("should be able to add and remove subtotals via burger menu", async (t) => {
    const measureCell = getMeasureCell(0);
    await clickOnMenuAggregationItem(t, measureCell, ".s-menu-aggregation-sum", "a_label-owner-department");
    await checkCellValue(t, ".s-pivot-table-aggregations-menu", "Sum", ".s-cell-2-1");
    await clickOnMenuAggregationItem(t, measureCell, ".s-menu-aggregation-sum", "a_label-owner-department");
    await checkCellValue(t, ".s-pivot-table-aggregations-menu", "Direct Sales", ".s-cell-2-1");
});
