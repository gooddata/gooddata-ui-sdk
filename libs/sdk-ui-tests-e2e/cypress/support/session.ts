// (C) 2023-2025 GoodData Corporation
import { Api, getTigerAuthToken } from "../tools/api";

export const establishSession = () => {
    const tigerAuthToken = getTigerAuthToken();

    if (tigerAuthToken) {
        Api.injectAuthHeader(tigerAuthToken);
    }
};

before(establishSession);
beforeEach(establishSession);

Cypress.on("uncaught:exception", (error) => {
    console.error("Uncaught exception cause", error);
    return false;
});

Cypress.Cookies.debug(true);
