// (C) 2021-2026 GoodData Corporation

import { type ISettings } from "@gooddata/sdk-model";

import { DashboardMenu } from "./dashboardMenu";
import { getHost } from "../support/constants";

import VisitOptions = Cypress.VisitOptions;

declare global {
    // eslint-disable-next-line @typescript-eslint/naming-convention
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
