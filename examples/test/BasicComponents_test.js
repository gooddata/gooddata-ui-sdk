import { Selector } from 'testcafe';
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
        .expect(chart.exists)
        .ok()
        .expect(chart.textContent);
});

test('Bar chart should render', async (t) => {
    const loading = Selector('.s-loading');
    const chart = Selector('.s-bar-chart');
    await t
        .expect(loading.exists).ok()
        .expect(chart.exists)
        .ok()
        .expect(chart.textContent);
});

test('Line chart should render', async (t) => {
    const loading = Selector('.s-loading');
    const chart = Selector('.s-line-chart');
    await t
        .expect(loading.exists).ok()
        .expect(chart.exists)
        .ok()
        .expect(chart.textContent);
});

test('Pie chart should render', async (t) => {
    const loading = Selector('.s-loading');
    const chart = Selector('.s-pie-chart');
    await t
        .expect(loading.exists).ok()
        .expect(chart.exists)
        .ok()
        .expect(chart.textContent);
});

test('Table should render', async (t) => {
    const loading = Selector('.s-loading');
    const table = Selector('.s-table');
    await t
        .expect(loading.exists).ok()
        .expect(table.exists)
        .ok()
        .expect(table.textContent);
});
