// (C) 2023 GoodData Corporation
import { getUserName } from "./constants";
import { Api, getTigerAuthToken } from "../tools/api";

export const establishSession = () => {
    const tigerAuthToken = getTigerAuthToken();
    const userName = getUserName();

    if (tigerAuthToken) {
        Api.injectAuthHeader(tigerAuthToken);
    }

    if (userName) {
        cy.session(getUserName(), cy.login);
    }
};

before(establishSession);
beforeEach(establishSession);

Cypress.on("uncaught:exception", (error) => {
    console.error("Uncaught exception cause", error);
    return false;
});

Cypress.Cookies.debug(true);
