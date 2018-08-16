// (C) 2007-2018 GoodData Corporation
import { Selector } from 'testcafe';
import { config } from './utils/config';
import { loginUsingGreyPages } from './utils/helpers';

async function checkRender(t, selector, cellValue, cellSelector = '.ag-cell') {
    const chart = Selector(selector);
    await t
        .expect(chart.exists).ok();
    if (cellSelector) {
        const cell = chart.find(cellSelector);
        await t
            .expect(cell.exists).ok();

        if (cellValue) {
            await t
                .expect(cell.textContent).eql(cellValue);
        }
    }
}

fixture('Pivot Table') // eslint-disable-line no-undef
    .page(config.url)
    .beforeEach(loginUsingGreyPages(`${config.url}/pivot-table`));

test('should render all tables', async (t) => {
    await checkRender(t, '.s-measures-row-attributes-and-column-attributes', 'Alabama');
    await checkRender(t, '.s-measures-and-column-attributes', '406006.57195');
    await checkRender(t, '.s-measures-and-attributes', 'Alabama');
    await checkRender(t, '.s-measures-only', '4214352.77185');
    await checkRender(t, '.s-row-attributes-only', 'Alabama');
    await checkRender(t, '.s-error', null, null);
});
