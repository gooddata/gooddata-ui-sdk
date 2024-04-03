// (C) 2023-2024 GoodData Corporation
import { Api, getTigerAuthToken } from "../tools/api";

export const establishSession = () => {
    const tigerAuthToken = getTigerAuthToken();

    if (tigerAuthToken) {
        Api.injectAuthHeader(tigerAuthToken);
    }
};

Cypress.on("uncaught:exception", (error) => {
    console.error("Uncaught exception cause", error);
    return false;
});

Cypress.Cookies.debug(true);
