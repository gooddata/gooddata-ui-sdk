// (C) 2021 GoodData Corporation

import { getHost, getUsername, getPassword } from "../constants";

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        interface Chainable<> {
            login: () => Chainable<void>;
        }
    }
}

export default {};

Cypress.Commands.add("login", () => {
    if (!getUsername()) {
        return;
    }

    cy.request("POST", `${getHost()}/gdc/account/login`, {
        postUserLogin: {
            login: getUsername(),
            password: getPassword(),
            remember: 1,
            captcha: "",
            verifyCaptcha: "",
        },
    });
});
