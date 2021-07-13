// (C) 2021 GoodData Corporation
import { ISettings } from "@gooddata/sdk-backend-spi";
import { getHost } from "../support/constants";
import VisitOptions = Cypress.VisitOptions;

const VISIT_TIMEOUT = 40000;

function getDashboardUrl() {
    return `${getHost()}`;
}

function visitUrl(url: string, options: Partial<VisitOptions>) {
    cy.visit(url, {
        timeout: VISIT_TIMEOUT,
        ...options,
    });
}

export function visit(workspaceSettings?: ISettings) {
    const dashboardUrl = getDashboardUrl();
    visitUrl(dashboardUrl, {
        onBeforeLoad(win: Cypress.AUTWindow) {
            win["customWorkspaceSettings"] = workspaceSettings;
        },
    });
}
