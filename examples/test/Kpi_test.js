import { Selector } from 'testcafe';
import { config } from './utils/config';
import { loginUsingGreyPages } from './utils/helpers';

fixture('KPI') // eslint-disable-line no-undef
    .page(config.hostname)
    .beforeEach(loginUsingGreyPages(`${config.hostname}/kpi`));

test('kpi has correct number', async (t) => {
    const kpi = Selector('.gdc-kpi');
    await t
        .expect(kpi.exists).ok()
        .expect(kpi.textContent)
        .eql('92,556,577.3');
});
