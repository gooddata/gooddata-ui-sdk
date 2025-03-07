// (C) 2021-2025 GoodData Corporation
import { ISettings } from "@gooddata/sdk-model";
import { getHost } from "../support/constants";
import VisitOptions = Cypress.VisitOptions;
import { DashboardMenu } from "./dashboardMenu";

declare global {
    interface Window {
        customWorkspaceSettings: any;
        useSafeWidgetLocalIdentifiersForE2e: boolean;
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
            win["useSafeWidgetLocalIdentifiersForE2e"] = true;
        },
    });
}

export function visitBoilerApp(workspaceSettings?: ISettings): void {
    visitUrl(`${getHost()}`, {
        onBeforeLoad(win: Cypress.AUTWindow) {
            win["customWorkspaceSettings"] = workspaceSettings;
        },
    });
}

export function visitCopyOf(componentName: string) {
    visit(componentName);
    new DashboardMenu().toggle().clickOption("Save as new");
    cy.get(CONFIRM_BUTTON).click();
}
