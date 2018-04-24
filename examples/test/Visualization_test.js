// (C) 2007-2018 GoodData Corporation
import { Selector } from 'testcafe';
import { config } from './utils/config';
import { loginUsingGreyPages } from './utils/helpers';

fixture('Visualization') // eslint-disable-line no-undef
    .page(config.hostname)
    .beforeEach(loginUsingGreyPages(`${config.hostname}/visualization`));

test('Chart visualization should render', async (t) => {
    const loading = Selector('.s-loading');
    const chart = Selector('.s-visualization-chart svg');
    await t
        .expect(loading.exists).ok()
        .expect(chart.exists)
        .ok()
        .expect(chart.textContent)
        .eql('Created with Highcharts 4.2.5Month/Year (Date)$ Total Sales$2,658,106$2,409,757$2,655,618$2,621,884$2,625,589$984,801Jul 2017Aug 2017Sep 2017Oct 2017Nov 2017Dec 20170M1M2M3M');
});

test('Custom visualization should render', async (t) => {
    const loading = Selector('.s-loading');
    const chart = Selector('.s-visualization-custom .recharts-surface');
    const legend = Selector('.s-visualization-custom .recharts-legend-wrapper');
    await t
        .expect(loading.exists).ok()
        .expect(chart.exists)
        .ok()
        .expect(legend.textContent)
        .eql('$ Franchise Fees (Ad Royalty)$ Franchise Fees (Initial Franchise Fee)$ Franchise Fees (Ongoing Royalty)');
});

test('Table visualization should render', async (t) => {
    const loading = Selector('.s-loading');
    const table = Selector('.s-visualization-table .indigo-table-component');
    const tableHeader = Selector('.s-visualization-table .table-header');
    await t
        .expect(loading.exists).ok()
        .expect(table.exists)
        .ok()
        .expect(tableHeader.textContent)
        .eql('Month/Year (Date)$ Total Costs - Labor$ Scheduled Labor Costs');
});
