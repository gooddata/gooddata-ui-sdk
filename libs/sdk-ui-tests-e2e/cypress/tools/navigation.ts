// (C) 2021 GoodData Corporation
import { ISettings } from "@gooddata/sdk-model";
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

export function visit(componentName: string, workspaceSettings?: ISettings): void {
    const dashboardUrl = getDashboardUrl();
    visitUrl(`${dashboardUrl}/gooddata-ui-sdk?scenario=${componentName}`, {
        onBeforeLoad(win: Cypress.AUTWindow) {
            win["customWorkspaceSettings"] = workspaceSettings;
        },
    });
}
