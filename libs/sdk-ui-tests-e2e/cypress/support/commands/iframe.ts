// (C) 2021-2025 GoodData Corporation

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        interface Chainable<Subject> {
            /**
             * Returns iframe context
             */
            getIframeBody: (iframeSelector: string) => Chainable<Subject>;
        }
    }
}

export default {};

Cypress.Commands.add("getIframeBody", (iframeSelector: string) => {
    return cy.get(iframeSelector).its("0.contentDocument.body").should("not.be.empty").then(cy.wrap);
});
