// (C) 2021 GoodData Corporation
import { ISettings } from "@gooddata/sdk-backend-spi";

import * as MDObjects from "../../reference_workspace/current_reference_workspace_objects";
import { getDashboardsUrl, getProjectId } from "../support/constants";

import VisitOptions = Cypress.VisitOptions;

type DashboardName = keyof typeof MDObjects.Dashboards;
const VISIT_TIMEOUT = 40000;

function getDashboardUrl(dashboardName: DashboardName) {
    const dashboardId = MDObjects.Dashboards[dashboardName];
    return `${getDashboardsUrl(getProjectId())}` + (dashboardId ? `/dashboard/${dashboardId}` : "");
}

function visitUrl(url: string, options: Partial<VisitOptions>) {
    cy.visit(url, {
        timeout: VISIT_TIMEOUT,
        ...options,
    });

    cy.url().should("equal", url);
}

export function visit(dashboardName: DashboardName, workspaceSettings?: ISettings) {
    const dashboardUrl = getDashboardUrl(dashboardName);
    visitUrl(dashboardUrl, {
        onBeforeLoad(win: Cypress.AUTWindow) {
            win["customWorkspaceSettings"] = workspaceSettings;
        },
    });
}
