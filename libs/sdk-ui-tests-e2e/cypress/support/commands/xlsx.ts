// (C) 2023-2025 GoodData Corporation
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        interface Chainable<Subject> {
            /**
             * # Read PDF
             */
            parseXlsx: (inputFile: string) => Chainable<void>;
        }
    }
}

export default {};

Cypress.Commands.add("parseXlsx", (inputFile) => {
    return cy.task("parseXlsx", { filePath: inputFile });
});
