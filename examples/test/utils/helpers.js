// (C) 2007-2018 GoodData Corporation
import { t as testController, Selector } from 'testcafe';
import { config } from './config';

export async function checkCellValue(t, selector, cellValue, cellSelector = '.ag-cell') {
    const chart = Selector(selector);
    await t
        .expect(chart.exists).eql(true, `${selector} not found`);
    if (cellSelector) {
        const cell = chart.find(cellSelector);
        await t
            .expect(cell.exists).eql(true, `${cellSelector} not found in ${selector}`);

        if (cellValue) {
            await t
                .expect(cell.textContent).eql(cellValue, `expected ${cellSelector} to contain text ${cellValue}`);
        }
    }
}

export const loginUsingGreyPages = (redirectUri = '/') => {
    return (tc = testController) => tc
        .navigateTo('/gdc/account/login')
        .typeText('input[name=USER]', config.username, { paste: true, replace: true })
        .typeText('input[name=PASSWORD]', config.password, { paste: true, replace: true })
        .click('input[name=submit]')
        .navigateTo(redirectUri);
};
