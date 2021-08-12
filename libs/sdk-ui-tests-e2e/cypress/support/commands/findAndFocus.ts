// (C) 2021 GoodData Corporation

// (C) 2021 GoodData Corporation

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        interface Chainable<Subject> {
            // @ts-ignore
            findAndFocus: (element) => Chainable<void>;
        }
    }
}

export default {};

Cypress.Commands.add("findAndFocus", { prevSubject: "element" }, (subject, element) => {
    cy.wrap(subject).find(element).focus();
});
