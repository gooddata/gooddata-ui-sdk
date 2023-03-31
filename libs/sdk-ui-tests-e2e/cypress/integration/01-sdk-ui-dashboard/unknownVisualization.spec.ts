// (C) 2021 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { Widget } from "../../tools/widget";

Cypress.on("uncaught:exception", (error) => {
    // eslint-disable-next-line no-console
    console.error("Uncaught excepton cause", error);
    return false;
});

Cypress.Cookies.debug(true);

describe("Dashboard with unknown visualization class", { tags: ["pre-merge_isolated_tiger"] }, () => {
    describe("Basic case", () => {
        beforeEach(() => {
            cy.login();
            Navigation.visit("dashboard/dashboard-tiger-unknown-visualization");
        });

        it("should render dashboard even if it contains unknown visualization class", () => {
            new Widget(0).hasError();
        });
    });
});
