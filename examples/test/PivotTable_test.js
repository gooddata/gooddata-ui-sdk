// (C) 2007-2018 GoodData Corporation
import { config } from './utils/config';
import { loginUsingGreyPages, checkCellValue } from './utils/helpers';

fixture('Pivot Table') // eslint-disable-line no-undef
    .page(config.url)
    .beforeEach(loginUsingGreyPages(`${config.url}/hidden/pivot-table`));

test('should render all tables', async (t) => {
    await checkCellValue(t, '.s-measures-row-attributes-and-column-attributes', 'Alabama');
    await checkCellValue(t, '.s-measures-and-column-attributes', '406006.57195');
    await checkCellValue(t, '.s-measures-and-attributes', 'Alabama');
    await checkCellValue(t, '.s-measures-only', '4214352.77185');
    await checkCellValue(t, '.s-row-attributes-only', 'Alabama');
    await checkCellValue(t, '.s-error', null, null);
});
