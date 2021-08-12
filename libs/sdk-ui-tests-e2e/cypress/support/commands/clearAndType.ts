// (C) 2021 GoodData Corporation

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        interface Chainable<Subject> {
            // @ts-ignore
            clearAndType: (text) => Chainable<void>;
        }
    }
}

export default {};

Cypress.Commands.add("clearAndType", { prevSubject: "element" }, (subject, text) => {
    cy.wrap(subject).clear().type(text);
});
