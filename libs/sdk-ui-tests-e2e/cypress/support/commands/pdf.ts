// (C) 2021-2025 GoodData Corporation

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        interface Chainable<Subject> {
            /**
             * # Read PDF
             */
            readPdf: (inputFile: string) => Chainable<void>;
        }
    }
}

export default {};

Cypress.Commands.add("readPdf", (inputFile) => {
    return cy.task("readPdf", { filePath: inputFile });
});
