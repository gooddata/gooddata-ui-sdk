// (C) 2021-2025 GoodData Corporation

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/naming-convention
        interface Chainable<Subject> {
            /**
             * # Read PDF
             */
            readPdf: (inputFile: string) => Chainable<void>;
        }
    }
}

// eslint-disable-next-line no-restricted-exports
export default {};

Cypress.Commands.add("readPdf", (inputFile) => {
    return cy.task("readPdf", { filePath: inputFile });
});
