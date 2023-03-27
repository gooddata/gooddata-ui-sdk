// (C) 2021 GoodData Corporation

export const getHost = (): string => Cypress.env("HOST");

export const getProjectId = (): string => Cypress.env("TEST_WORKSPACE_ID");

export const getUsername = (): string => Cypress.env("USER_NAME");

export const getMockServer = (): string => Cypress.env("MOCK_SERVER");

export const getPassword = (): string => Cypress.env("PASSWORD");

export const getBackend = (): string => Cypress.env("SDK_BACKEND");

export const isRecording = (): string => Cypress.env("IS_RECORDING");

export const getBackendHost = (): string => Cypress.env("BACKEND_HOST");

export const getWorkingDir = (): string => Cypress.env("WORKING_DIR");
