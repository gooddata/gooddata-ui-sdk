// (C) 2022 GoodData Corporation
import { getMockServer } from "./constants";

let testInfo: any;

Cypress.on("test:before:run", (_attributes, test) => {
    testInfo = test;
});

before(() => {
    cy.login();
});

beforeEach(() => {
    const testName = `${testInfo.parent.title} - It ${testInfo.title}`;
    let heading = "TEST:";
    if (testInfo._currentRetry !== 0) {
        heading = "  retry:";
    }
    cy.task("log", `  ${heading} ${testName}`);

    /**
     * Reset scenario state of the mock server
     */
    const mockServer = getMockServer();
    if (mockServer) {
        cy.task("resetRecordingsScenarios", mockServer);
    }

    /**
     * Detect tests that need separate recordings.
     * Separate recordings are needed just for POST and PUT requests.
     * Requests are made unique by adding extra header with test name.
     */
    const separateRecordings = testName.indexOf("(SEPARATE)") !== -1;
    if (separateRecordings) {
        const separateRecordingsKey = testName.replace(/\s/g, "-");
        cy.intercept("POST", "*", (request) => {
            request.headers["X-GDC-TEST-NAME"] = separateRecordingsKey;
        });
        cy.intercept("PUT", "*", (request) => {
            request.headers["X-GDC-TEST-NAME"] = separateRecordingsKey;
        });
    }
});
