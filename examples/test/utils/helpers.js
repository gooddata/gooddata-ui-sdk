// (C) 2007-2018 GoodData Corporation
import { t as testController } from 'testcafe';
import { config } from './config';

export const loginUsingGreyPages = (redirectUri = '/') => {
    return (tc = testController) => tc
        .navigateTo('/gdc/account/login')
        .typeText('input[name=USER]', config.username, { paste: true, replace: true })
        .typeText('input[name=PASSWORD]', config.password, { paste: true, replace: true })
        .click('input[name=submit]')
        .navigateTo(redirectUri);
};
