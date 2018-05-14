// (C) 2007-2018 GoodData Corporation
import { ClientFunction } from 'testcafe';
import { config } from './utils/config';

fixture('Login') // eslint-disable-line no-undef
    .page(config.hostname);

test('should show login overlay and log in successfully', async (t) => {
    const getLocation = ClientFunction(() => document.location.pathname);
    await t
        .typeText('input[name=email]', config.username)
        .typeText('input[name=password]', config.password)
        .click('button.s-login-submit')
        .expect(getLocation()).eql('/');
});
