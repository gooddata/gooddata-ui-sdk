// (C) 2021 GoodData Corporation

export const getHost = () => Cypress.env("HOST");

export const getProjectId = () => Cypress.env("WORKSPACE");

export const getUsername = () => Cypress.env("USERNAME");

export const getPassword = () => Cypress.env("PASSWORD");

export const getDashboardsUrl = (projectId: string) => `${getHost()}/dashboards/#/project/${projectId}`;
