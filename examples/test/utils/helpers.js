import { t as testController } from 'testcafe';
import { config } from './config';

export const loginUsingGreyPages = (redirectUri = '/') => {
    return (tc = testController) => tc
        .navigateTo('/gdc/account/login')
        .typeText('input[name=USER]', config.username)
        .typeText('input[name=PASSWORD]', config.password)
        .click('input[name=REMEMBER]')
        .click('input[name=submit]')
        .navigateTo(redirectUri);
};
