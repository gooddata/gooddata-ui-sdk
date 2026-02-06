// (C) 2021-2026 GoodData Corporation

// oxlint-disable @typescript-eslint/no-namespace

declare global {
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

// eslint-disable-next-line no-restricted-exports
export default {};

Cypress.Commands.add("getIframeBody", (iframeSelector: string) => {
    return cy.get(iframeSelector).its("0.contentDocument.body").should("not.be.empty").then(cy.wrap);
});
