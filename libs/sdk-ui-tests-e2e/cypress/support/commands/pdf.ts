// (C) 2021-2026 GoodData Corporation

// oxlint-disable @typescript-eslint/no-namespace

declare global {
    namespace Cypress {
        // eslint-disable-next-line @typescript-eslint/naming-convention
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
