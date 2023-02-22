// (C) 2021 GoodData Corporation

import { stringUtils } from "@gooddata/util";

export function getTestClassByTitle(title: string, prefix = ""): string {
    return `.s-${prefix}${stringUtils.simplifyText(title)}`;
}

export function clickOutside(): Cypress.Chainable {
    return cy.get("body").click(0, 0);
}

export function generateUUID(length: number = 10): string {
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const data = [];

    for (let i = 0; i < length; i++) {
        data.push(possible.charAt(Math.floor(Math.random() * possible.length)));
    }

    return data.join("");
}
