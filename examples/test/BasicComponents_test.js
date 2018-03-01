import { Selector } from 'testcafe';
import { range } from 'lodash';
import { config } from './utils/config';
import { loginUsingGreyPages } from './utils/helpers';

fixture('Basic components') // eslint-disable-line no-undef
    .page(config.hostname)
    .beforeEach(loginUsingGreyPages(`${config.hostname}/basic-components`));

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
    const legendIcons = Selector('.s-line-chart .series-icon');
    const CUSTOM_COLORS = [
        'rgb(195, 49, 73)',
        'rgb(168, 194, 86)',
        'rgb(243, 217, 177)',
        'rgb(194, 153, 121)'
    ];

    await t
        .expect(legendIcons.count).eql(4);

    const legendIconsCount = await legendIcons.count;

    const backgroundColors = await Promise.all(range(legendIconsCount).map(
        async (index) => {
            const legendIcon = await legendIcons.nth(index);
            return legendIcon.getStyleProperty('background-color');
        }
    ));

    await t
        .expect(backgroundColors).eql(CUSTOM_COLORS);
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
