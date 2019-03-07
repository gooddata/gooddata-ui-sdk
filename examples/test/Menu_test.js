// (C) 2007-2019 GoodData Corporation
import { Selector } from 'testcafe';
import { config } from './utils/config';
import { loginUsingLoginForm, waitForPivotTableStopLoading } from './utils/helpers';

const totalValues = {
    sum: ['Sum', '', '', '$1,566,007', '$150,709'],
    max: ['Max', '', '', '$101,055', '$25,140'],
    empty: '–'
};

const getMeasureCell = (column) => {
    return Selector(`[col-id="a_2009_1-a_2071_1-m_${column}"] .s-pivot-table-column-header`);
};

const getMeasureGroupCell = (column) => {
    return Selector(`[col-id="2_${column}"]`);
};

const getPivotTableFooterCell = (row, column) => {
    return Selector(`[row-index="b-${row}"] .s-cell-${row}-${column}`);
};

const getMenu = (cell) => {
    return cell.find('.s-table-header-menu');
};

const clickOnMenuAggregationItem = async (t, cell, aggregationItemClass) => {
    const menu = getMenu(cell);

    await t.hover(cell);
    await t.click(menu);

    const sumTotal = Selector(aggregationItemClass);
    await t.click(sumTotal);
    await waitForPivotTableStopLoading(t);
};

fixture('Menu')
    .page(config.url)
    .beforeEach(async (t) => {
        await loginUsingLoginForm(`${config.url}/hidden/pivot-table-dynamic`)(t);

        await t.click(Selector('.s-total-preset-aggregations'));

        // Cells in ag-grid are windowed (only cells that are in the ag-grid
        // viewport are visible). Since we need to click on cells that are not
        // by default visible we need to make the table bigger so they render.
        // Another option would be to scroll on ag-grid but scroll actions does
        // not seem to be implemented in test-cafe.
        await t.click(Selector('.s-total-preset-wide'));

        await waitForPivotTableStopLoading(t);
    });

test('should show menu button when mouse hovers over the cell', async (t) => {
    const measureCell = getMeasureCell(0);
    const menu = getMenu(measureCell);

    await t.hover(measureCell);
    await t.expect(menu.visible).eql(true);

    const anotherCell = getMeasureGroupCell(0);
    await t.hover(anotherCell);
    await t.expect(menu.visible).eql(false);
});

test('should open/close menu when mouse clicks on menu button', async (t) => {
    const measureCell = getMeasureCell(0);
    const menu = getMenu(measureCell);

    await t.hover(measureCell);
    await t.expect(menu.visible).eql(true);

    const anotherCell = getMeasureGroupCell(0);
    await t.hover(anotherCell);
    await t.expect(menu.visible).eql(false);
});

test('should add totals for first measure, when selected from menu in measure', async (t) => {
    const measureCell = getMeasureCell(0);

    await t.expect(getPivotTableFooterCell(0, 0).exists).eql(false);

    await clickOnMenuAggregationItem(t, measureCell, '.s-menu-aggregation-sum');

    await t.expect(getPivotTableFooterCell(0, 0).exists).eql(true);
    await t.expect(getPivotTableFooterCell(0, 0).textContent).eql(totalValues.sum[0]);
    await t.expect(getPivotTableFooterCell(1, 0).exists).eql(false);
    await t.expect(getPivotTableFooterCell(0, 3).textContent).eql(totalValues.sum[3]);
    await t.expect(getPivotTableFooterCell(0, 4).textContent).eql(totalValues.empty);
});

test('should add totals for all measures, when selected from menu in measure group', async (t) => {
    const measureCell = getMeasureGroupCell(0);
    await clickOnMenuAggregationItem(t, measureCell, '.s-menu-aggregation-sum');

    await t.expect(getPivotTableFooterCell(0, 0).textContent).eql(totalValues.sum[0]);
    await t.expect(getPivotTableFooterCell(0, 3).textContent).eql(totalValues.sum[3]);
    await t.expect(getPivotTableFooterCell(0, 4).textContent).eql(totalValues.sum[4]);
});

test('should add totals for one measure and then turn it off', async (t) => {
    const measureCell = getMeasureCell(0);

    await clickOnMenuAggregationItem(t, measureCell, '.s-menu-aggregation-sum');
    await t.expect(getPivotTableFooterCell(0, 0).textContent).eql(totalValues.sum[0]);
    await t.expect(getPivotTableFooterCell(0, 3).textContent).eql(totalValues.sum[3]);
    await t.expect(getPivotTableFooterCell(0, 4).textContent).eql(totalValues.empty);

    await clickOnMenuAggregationItem(t, measureCell, '.s-menu-aggregation-sum');
    await t.expect(getPivotTableFooterCell(0, 0).exists).eql(false);
});

test('should add totals for all measures and then turn them off', async (t) => {
    const measureCell = getMeasureGroupCell(0);

    await clickOnMenuAggregationItem(t, measureCell, '.s-menu-aggregation-sum');
    await t.expect(getPivotTableFooterCell(0, 0).textContent).eql(totalValues.sum[0]);
    await t.expect(getPivotTableFooterCell(0, 3).textContent).eql(totalValues.sum[3]);
    await t.expect(getPivotTableFooterCell(0, 4).textContent).eql(totalValues.sum[4]);

    await clickOnMenuAggregationItem(t, measureCell, '.s-menu-aggregation-sum');
    await t.expect(getPivotTableFooterCell(0, 0).exists).eql(false);
});

test('should add totals for group and then turn them all off with individual measures', async (t) => {
    const measureGroup = getMeasureGroupCell(0);
    await clickOnMenuAggregationItem(t, measureGroup, '.s-menu-aggregation-sum');
    await t.expect(getPivotTableFooterCell(0, 0).textContent).eql(totalValues.sum[0]);
    await t.expect(getPivotTableFooterCell(0, 3).textContent).eql(totalValues.sum[3]);
    await t.expect(getPivotTableFooterCell(0, 4).textContent).eql(totalValues.sum[4]);

    const measureCell1 = getMeasureCell(0);
    await clickOnMenuAggregationItem(t, measureCell1, '.s-menu-aggregation-sum');
    await t.expect(getPivotTableFooterCell(0, 0).textContent).eql(totalValues.sum[0]);
    await t.expect(getPivotTableFooterCell(0, 3).textContent).eql(totalValues.empty);
    await t.expect(getPivotTableFooterCell(0, 4).textContent).eql(totalValues.sum[4]);

    const measureCell2 = getMeasureCell(1);
    await clickOnMenuAggregationItem(t, measureCell2, '.s-menu-aggregation-sum');
    await t.expect(getPivotTableFooterCell(0, 0).exists).eql(false);
});

test('should turn on/off multiple totals', async (t) => {
    const measureCell = getMeasureCell(0);
    const measureGroup = getMeasureGroupCell(0);

    await clickOnMenuAggregationItem(t, measureCell, '.s-menu-aggregation-sum');
    await t.expect(getPivotTableFooterCell(0, 0).textContent).eql(totalValues.sum[0]);
    await t.expect(getPivotTableFooterCell(0, 3).textContent).eql(totalValues.sum[3]);
    await t.expect(getPivotTableFooterCell(0, 4).textContent).eql(totalValues.empty);
    await t.expect(getPivotTableFooterCell(1, 0).exists).eql(false);

    await clickOnMenuAggregationItem(t, measureGroup, '.s-menu-aggregation-max');
    await t.expect(getPivotTableFooterCell(0, 0).textContent).eql(totalValues.sum[0]);
    await t.expect(getPivotTableFooterCell(0, 3).textContent).eql(totalValues.sum[3]);
    await t.expect(getPivotTableFooterCell(0, 4).textContent).eql(totalValues.empty);
    await t.expect(getPivotTableFooterCell(1, 0).textContent).eql(totalValues.max[0]);
    await t.expect(getPivotTableFooterCell(1, 3).textContent).eql(totalValues.max[3]);
    await t.expect(getPivotTableFooterCell(1, 4).textContent).eql(totalValues.max[4]);
    await t.expect(getPivotTableFooterCell(2, 0).exists).eql(false);

    await clickOnMenuAggregationItem(t, measureGroup, '.s-menu-aggregation-sum');
    await t.expect(getPivotTableFooterCell(0, 0).textContent).eql(totalValues.sum[0]);
    await t.expect(getPivotTableFooterCell(0, 3).textContent).eql(totalValues.sum[3]);
    await t.expect(getPivotTableFooterCell(0, 4).textContent).eql(totalValues.sum[4]);
    await t.expect(getPivotTableFooterCell(1, 0).textContent).eql(totalValues.max[0]);
    await t.expect(getPivotTableFooterCell(1, 3).textContent).eql(totalValues.max[3]);
    await t.expect(getPivotTableFooterCell(1, 4).textContent).eql(totalValues.max[4]);

    await clickOnMenuAggregationItem(t, measureGroup, '.s-menu-aggregation-sum');
    await t.expect(getPivotTableFooterCell(0, 0).textContent).eql(totalValues.max[0]);
    await t.expect(getPivotTableFooterCell(0, 3).textContent).eql(totalValues.max[3]);
    await t.expect(getPivotTableFooterCell(0, 4).textContent).eql(totalValues.max[4]);
    await t.expect(getPivotTableFooterCell(1, 0).exists).eql(false);

    await clickOnMenuAggregationItem(t, measureGroup, '.s-menu-aggregation-max');
    await t.expect(getPivotTableFooterCell(0, 0).exists).eql(false);
});
