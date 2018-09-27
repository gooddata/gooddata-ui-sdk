// (C) 2007-2018 GoodData Corporation
import { Selector } from 'testcafe';
import { config } from './utils/config';
import { loginUsingGreyPages, checkCellValue } from './utils/helpers';
import {
    measuresDrillParams,
    rowAttributesDrillParams,
    columnAndRowAttributesDrillParams,
    measuresColumnAndRowAttributesDrillParams,
    measuresAndColumnAttributesDrillParams,
    measuresAndRowAttributesDrillParams
} from './PivotTableDynamicFixtures.js';

async function checkRender(t, selector, cellSelector = '.ag-cell', checkClass, doClick = false) {
    const chart = Selector(selector);
    await t
        .expect(chart.exists).ok();
    if (cellSelector) {
        const cell = chart.find(cellSelector);
        await t
            .expect(cell.exists).ok();

        if (checkClass) {
            await t
                .expect(
                    cell().hasClass(checkClass)
                ).ok();
        }
        if (doClick) {
            await t.click(cell);
        }
    }
}

async function checkDrill(t, output, selector = '.s-output') {
    const outputElement = Selector(selector);
    await t.expect(outputElement.exists).ok();
    if (outputElement) {
        await t.expect(outputElement.textContent).eql(output);
    }
}

fixture('Pivot Table')
    .page(config.url)
    .beforeEach(loginUsingGreyPages(`${config.url}/next/pivot-table-dynamic`));

test('should add drillable classes and run onFiredDrillEvent with correct params', async (t) => {
    await t.click(Selector('.s-bucket-preset-measures'));
    await checkRender(t, '.s-pivot-table-measures', '.s-cell-0-0', 'gd-cell-drillable', true);
    await checkDrill(t, measuresDrillParams);

    await t.click(Selector('.s-bucket-preset-rowAttributes'));
    await checkRender(t, '.s-pivot-table-rowAttributes', '.s-cell-0-2', 'gd-cell-drillable', true);
    await checkDrill(t, rowAttributesDrillParams);

    await t.click(Selector('.s-bucket-preset-columnAndRowAttributes'));
    await checkRender(t, '.s-pivot-table-columnAndRowAttributes', '.s-cell-5-0', 'gd-cell-drillable', true);
    await checkDrill(t, columnAndRowAttributesDrillParams);

    await t.click(Selector('.s-bucket-preset-measuresColumnAndRowAttributes'));
    await checkRender(t, '.s-pivot-table-measuresColumnAndRowAttributes', '.s-cell-0-3', 'gd-cell-drillable', true);
    await checkDrill(t, measuresColumnAndRowAttributesDrillParams);

    await t.click(Selector('.s-bucket-preset-measuresAndColumnAttributes'));
    await checkRender(t, '.s-pivot-table-measuresAndColumnAttributes', '.s-cell-0-1', 'gd-cell-drillable', true);
    await checkDrill(t, measuresAndColumnAttributesDrillParams);

    await t.click(Selector('.s-bucket-preset-measuresAndRowAttributes'));
    await checkRender(t, '.s-pivot-table-measuresAndRowAttributes', '.s-cell-5-0', 'gd-cell-drillable', true);
    await checkDrill(t, measuresAndRowAttributesDrillParams);
});

test('should sort PivotTable using sortBy prop', async (t) => {
    await t.click(Selector('.s-bucket-preset-measuresColumnAndRowAttributes'));

    await t.click(Selector('.s-sorting-preset-byMenuCategory'));
    await checkCellValue(t, '.s-pivot-table-measuresColumnAndRowAttributes', '$71,476', '.s-cell-0-3');

    await t.click(Selector('.s-sorting-preset-byQ1JanFranchiseFees'));
    await checkCellValue(t, '.s-pivot-table-measuresColumnAndRowAttributes', '$101,055', '.s-cell-0-3');

    await t.click(Selector('.s-sorting-preset-byLocationStateAndQ1JanFranchiseFees'));
    await checkCellValue(t, '.s-pivot-table-measuresColumnAndRowAttributes', '$71,476', '.s-cell-1-3');

    await t.click(Selector('.s-sorting-preset-noSort'));
    await checkCellValue(t, '.s-pivot-table-measuresColumnAndRowAttributes', '$51,421', '.s-cell-1-3');
});

test('should sort PivotTable on column header click', async (t) => {
    await t.click(Selector('.s-bucket-preset-measuresColumnAndRowAttributes'));
    await t.click(Selector('.s-sorting-preset-noSort'));

    await t.click(Selector('[col-id=a_2188] .gd-pivot-table-header-label')); // Menu Category (initial should be ASC)
    await checkCellValue(t, '.s-pivot-table-measuresColumnAndRowAttributes', '$51,918', '.s-cell-1-3');

    await t.click(Selector('[col-id=a_2188] .gd-pivot-table-header-label')); // Menu Category (toggled should be DESC)
    await checkCellValue(t, '.s-pivot-table-measuresColumnAndRowAttributes', '$69,105', '.s-cell-1-3');

    await t.click(Selector('[col-id=a_2188] .gd-pivot-table-header-label')); // Menu Category (third state should be ASC again)
    await checkCellValue(t, '.s-pivot-table-measuresColumnAndRowAttributes', '$51,918', '.s-cell-1-3');

    await t.click(Selector('[col-id=a_2009_1-a_2071_1-m_0] .gd-pivot-table-header-label')); // Franchise fees (initial should be DESC)
    await checkCellValue(t, '.s-pivot-table-measuresColumnAndRowAttributes', '$81,350', '.s-cell-1-3');

    await t.click(Selector('[col-id=a_2009_1-a_2071_1-m_0] .gd-pivot-table-header-label')); // Franchise fees (toggled should be ASC)
    await checkCellValue(t, '.s-pivot-table-measuresColumnAndRowAttributes', '$42,140', '.s-cell-1-3');
});
