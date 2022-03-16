// (C) 2021 GoodData Corporation
import { DashboardEventType } from "@gooddata/sdk-ui-dashboard";
import { listenForDashboardPluginEvents } from "../support/events";
import { getHost } from "../support/constants";
import VisitOptions = Cypress.VisitOptions;
import { setupDashboardPluginTest, IDashboardPluginTestConfig } from "../../plugins-loader";

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

function visit(config: IDashboardPluginTestConfig): void {
    const dashboardUrl = getDashboardUrl();
    visitUrl(`${dashboardUrl}/dashboard-plugin-tests`, {
        onBeforeLoad(win: Cypress.AUTWindow) {
            setupDashboardPluginTest(win, config);
        },
    });
}

export function withTestConfig(config: IDashboardPluginTestConfig) {
    function waitForFullRender(win: Window) {
        return new Cypress.Promise((resolve) => {
            listenForDashboardPluginEvents(win, (e) => {
                if ((e.type as DashboardEventType) === "GDC.DASH/EVT.RENDER.RESOLVED") {
                    resolve(true);
                }
            });
        });
    }

    visit(config);
    cy.window().then({ timeout: VISIT_TIMEOUT }, waitForFullRender);
}
