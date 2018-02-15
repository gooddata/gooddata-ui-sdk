import { Selector } from 'testcafe';
import { config } from './utils/config';

fixture('Login') // eslint-disable-line no-undef
    .page(config.hostname);

test('should show login overlay and log in successfully', async (t) => {
    const loginOverlay = Selector('.s-login-overlay');

    await t
        .typeText('input[name=email]', config.username)
        .typeText('input[name=password]', config.password)
        .click('button.s-login-submit')
        .expect(loginOverlay.exists).notOk();
});
