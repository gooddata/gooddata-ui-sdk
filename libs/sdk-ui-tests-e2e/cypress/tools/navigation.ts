// (C) 2021-2024 GoodData Corporation
import { ISettings } from "@gooddata/sdk-model";
import { getHost, getBackend, getUserName, getPassword } from "../support/constants";
import VisitOptions = Cypress.VisitOptions;
import { DashboardMenu } from "./dashboardMenu";

declare global {
    interface Window {
        customWorkspaceSettings: any;
    }
}

const VISIT_TIMEOUT = 40000;
const CONFIRM_BUTTON = ".s-create_dashboard";

function visitUrl(url: string, options: Partial<VisitOptions>) {
    cy.visit(url, {
        timeout: VISIT_TIMEOUT,
        ...options,
    });
}

export function visit(componentName: string, workspaceSettings?: ISettings): void {
    visitUrl(`${getHost()}/gooddata-ui-sdk?scenario=${componentName}`, {
        onBeforeLoad(win: Cypress.AUTWindow) {
            win["customWorkspaceSettings"] = workspaceSettings;
        },
    });
}

export function visitBoilerApp(workspaceSettings?: ISettings): void {
    visitUrl(`${getHost()}`, {
        onBeforeLoad(win: Cypress.AUTWindow) {
            win["customWorkspaceSettings"] = workspaceSettings;
        },
    });
    if (getBackend() === "BEAR") {
        cy.get(".s-login-login").type(getUserName());
        cy.get(".s-login-password").type(getPassword());
        cy.get(".s-login-button").click();
    }
}

export function visitCopyOf(componentName: string) {
    visit(componentName);
    new DashboardMenu().toggle().clickOption("Save as new");
    cy.get(CONFIRM_BUTTON).click();
}
