// (C) 2021-2024 GoodData Corporation

export const getHost = (): string => Cypress.env("HOST");

export const getProjectId = (): string => Cypress.env("TEST_WORKSPACE_ID");

export const getMockServer = (): string => Cypress.env("MOCK_SERVER");

export const isRecording = (): string => Cypress.env("IS_RECORDING");

export const getBackendHost = (): string => Cypress.env("BACKEND_HOST");

export const getWorkingDir = (): string => Cypress.env("WORKING_DIR");

export const getMaximumTimeout = (): number => Cypress.env("timeForInsightLoading");
