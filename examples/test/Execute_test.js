// (C) 2007-2018 GoodData Corporation
import { Selector } from 'testcafe';
import { config } from './utils/config';
import { loginUsingGreyPages } from './utils/helpers';

fixture('Execute') // eslint-disable-line no-undef
    .page(config.hostname)
    .beforeEach(loginUsingGreyPages(`${config.hostname}/execute`));

test('should display correct result and retry should fail', async (t) => {
    const kpi = Selector('.s-execute-kpi');
    const retryButton = Selector('.s-retry-button');

    await t
        .expect(kpi.exists).ok()
        .expect(kpi.textContent)
        .eql('92556577.3');

    await t
        .click(retryButton)
        .expect(Selector('.Error.s-error').exists).ok();
});
