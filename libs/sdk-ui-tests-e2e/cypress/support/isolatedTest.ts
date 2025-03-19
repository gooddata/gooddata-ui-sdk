// (C) 2021-2025 GoodData Corporation
import { getBackendHost, getMockServer, getProjectId, getWorkingDir, isRecording } from "./constants";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const record = require("../../scripts/lib/recordings");

const currentTestFileMappings = `${getWorkingDir()}/recordings/mappings/TIGER/mapping-${
    Cypress.spec.name
}.json`;

const wiremockHost = getMockServer();

before(() => {
    if (wiremockHost) {
        wiremockReset(wiremockHost);

        if (isRecording()) {
            wiremockStartRecording(wiremockHost, getBackendHost());
        } else {
            wiremockImportMappings(wiremockHost, currentTestFileMappings);
        }
        wiremockMockLogRequests(wiremockHost);
    }
});

after(() => {
    if (wiremockHost) {
        if (isRecording()) {
            // wiremockStopRecording + wiremockExportMappings
            // This block is used to stop the recording and export mappings
            // Cypress doesn't allow to use async function in hook, so data must be proceeded within hook
            let responseScenarios: any, responsePlain: any;
            cy.request("POST", `${wiremockHost}/__admin/recordings/snapshot`, {
                repeatsAsScenarios: true,
                filters: { urlPattern: ".*executionResults.*" },
                persist: false,
                ...commonSnapshotParams,
            }).then((r) => {
                responseScenarios = r;
            });

            cy.request("POST", `${wiremockHost}/__admin/recordings/snapshot`, {
                repeatsAsScenarios: false,
                filters: {
                    urlPattern: "((?!executionResults).)*",
                },
                persist: false,
                ...commonSnapshotParams,
            }).then((r) => {
                responsePlain = r;
            });

            cy.then(() => {
                // Combine mapping data from wiremock
                const mappings = [...responsePlain.body.mappings, ...responseScenarios.body.mappings];
                // Export mapping data to file
                cy.writeFile(
                    currentTestFileMappings,
                    JSON.stringify(
                        {
                            mappings,
                        },
                        null,
                        2,
                    ) + "\n",
                );
            });
            sanitizeCredentials(currentTestFileMappings);
            sanitizeWorkspaceId(getProjectId(), record.getRecordingsWorkspaceId(), currentTestFileMappings);
        }
        wiremockReset(wiremockHost);
    }
});

function wiremockReset(wiremockHost: string) {
    cy.request("POST", `${wiremockHost}/__admin/reset`).then((res) => {
        cy.task("log", `Wiremock mappings cleaned (status: ${res.status})`);
        expect(res.status).eq(200);
    });
}

function wiremockImportMappings(wiremockHost: string, testFileMappings: string) {
    cy.readFile(testFileMappings).then((mappings) => {
        cy.request("POST", `${wiremockHost}/__admin/mappings/import`, mappings).then((res) => {
            cy.task(
                "log",
                `Wiremock mappings imported from file ${testFileMappings} (status: ${res.status})`,
            );
            expect(res.status).eq(200);
        });
    });
}

function wiremockMockLogRequests(wiremockHost: string) {
    cy.request("POST", `${wiremockHost}/__admin/mappings`, {
        request: {
            method: "POST",
            urlPattern: "/gdc/app/projects/.*/log",
        },
        response: {
            body: "",
            status: 200,
        },
    }).then((res) => {
        cy.task("log", `Started wiremockMockLogRequests (status: ${res.status})`);
        expect(res.status).eq(201);
    });
}

function wiremockStartRecording(wiremockHost: string, appHost: string) {
    cy.request("POST", `${wiremockHost}/__admin/mappings`, {
        request: {
            method: "ANY",
            urlPattern: ".*",
        },
        response: {
            proxyBaseUrl: `${appHost}`,
        },
    }).then((res) => {
        cy.task("log", `Started wiremockRecording (status: ${res.status})`);
        expect(res.status).eq(201);
    });
}

function sanitizeCredentials(testFileMappings: string) {
    cy.readFile(testFileMappings).then((data) => {
        if (data.mappings) {
            data.mappings.forEach((mapping: any) => {
                if (mapping?.request?.url === "/gdc/account/login") {
                    delete mapping.request.bodyPatterns;
                    delete mapping.response.headers["Set-Cookie"];
                }
            });
            cy.writeFile(testFileMappings, JSON.stringify(data, null, 2) + "\n");
            cy.task("log", `sanitizeCredentials - mappings file: ${testFileMappings} is sanitized`);
        } else {
            cy.task("log", `sanitizeCredentials - mappings file: ${testFileMappings} is empty`);
        }
    });
}

function sanitizeWorkspaceId(sourceWorkspaceId: string, targetWorkspaceId: string, testFileMappings: string) {
    if (sourceWorkspaceId === targetWorkspaceId) {
        cy.task(
            "log",
            `sanitizeWorkspaceId - sourceWorkspaceId and targetWorkspaceId are the same, return...`,
        );
        return;
    }
    cy.task("log", `Sanitize projectId (${sourceWorkspaceId} -> ${targetWorkspaceId})`);

    cy.readFile(testFileMappings).then((data) => {
        if (data.mappings) {
            const re = new RegExp(sourceWorkspaceId, "g");
            const dataString = JSON.stringify(data, null, 2).replace(re, targetWorkspaceId);
            cy.writeFile(testFileMappings, dataString + "\n");
            cy.task("log", `sanitizeWorkspaceId - mappings file: ${testFileMappings} is sanitized`);
        } else {
            cy.task("log", `sanitizeWorkspaceId - mappings file: ${testFileMappings} is empty`);
        }
    });
}

const commonSnapshotParams = {
    captureHeaders: { "X-GDC-TEST-NAME": {} },
    requestBodyPattern: {
        matcher: "equalToJson",
        ignoreArrayOrder: false,
        ignoreExtraElements: false,
    },
};
