// (C) 2007-2018 GoodData Corporation
import { Selector } from 'testcafe';
import { config } from './utils/config';
import { loginUsingGreyPages } from './utils/helpers';

fixture('Basic components') // eslint-disable-line no-undef
    .page(config.hostname)
    .beforeEach(loginUsingGreyPages(`${config.hostname}`));

test('Column chart should render', async (t) => {
    const loading = Selector('.s-loading');
    const chart = Selector('.s-column-chart');
    await t
        .expect(loading.exists).ok()
        .expect(chart.exists).ok()
        .expect(chart.textContent);
});

test('Bar chart should render', async (t) => {
    const loading = Selector('.s-loading');
    const chart = Selector('.s-bar-chart');
    await t
        .expect(loading.exists).ok()
        .expect(chart.exists).ok()
        .expect(chart.textContent);
});

test('Line chart should render', async (t) => {
    const loading = Selector('.s-loading');
    const chart = Selector('.s-line-chart');
    await t
        .expect(loading.exists).ok()
        .expect(chart.exists).ok()
        .expect(chart.textContent);
});

test('Line chart should have custom colors', async (t) => {
    const lineChart = Selector('.s-line-chart');
    const CUSTOM_COLORS = [
        'rgb(195, 49, 73)',
        'rgb(168, 194, 86)',
        'rgb(243, 217, 177)',
        'rgb(194, 153, 121)'
    ];

    await t
        .expect(lineChart.exists).ok();
    const legendIcons = lineChart.find('.series-icon');
    for (let index = 0; index < CUSTOM_COLORS.length; index += 1) {
        await t.expect(await legendIcons.nth(index).getStyleProperty('background-color')).eql(CUSTOM_COLORS[index]); // eslint-disable-line no-await-in-loop
    }
});

test('Pie chart should render', async (t) => {
    const loading = Selector('.s-loading');
    const chart = Selector('.s-pie-chart');
    await t
        .expect(loading.exists).ok()
        .expect(chart.exists).ok()
        .expect(chart.textContent);
});

test('Table should render', async (t) => {
    const loading = Selector('.s-loading');
    const table = Selector('.s-table');
    await t
        .expect(loading.exists).ok()
        .expect(table.exists).ok()
        .expect(table.textContent);
});

test('KPI has correct number', async (t) => {
    const kpi = Selector('.gdc-kpi', { timeout: 20000 });
    await t
        .expect(kpi.exists).ok()
        .expect(kpi.textContent)
        .eql('92,556,577.3');
});
