// (C) 2019-2022 GoodData Corporation
import merge from "lodash/merge";
import { IExecutionDefinition } from "@gooddata/sdk-model";
import { DashboardEventType } from "@gooddata/sdk-ui-dashboard";
import { DataViewWindow } from "@gooddata/sdk-ui";
import { IAttributeDisplayFormMetadataObject } from "@gooddata/sdk-backend-spi";

import { SERVER_URL } from "../../src/constants";
import { CapturedData, CapturedElementQuery, emptyCapturedData } from "../../src/capturing";
import { listenForDashboardPluginEvents } from "../../src/infra";

const WEBPACK_DEV_SERVER_PORT = 8446;
const WEBPACK_DEV_SERVER_URL = `https://localhost:${WEBPACK_DEV_SERVER_PORT}`;

function getDashboardUrl(id: string) {
    if (Cypress.env("mode") === "dev") {
        return `${WEBPACK_DEV_SERVER_URL}/#${id}`;
    }

    return `${SERVER_URL}/#${id}`;
}

export function visitDashboardAndWaitForFullRender(identifier: string) {
    function waitForFulLRender(doc: Document) {
        return new Cypress.Promise((resolve) => {
            const unsubscribe = listenForDashboardPluginEvents(doc, (e) => {
                if ((e.type as DashboardEventType) === "GDC.DASH/EVT.RENDER.RESOLVED") {
                    resolve(true);
                    unsubscribe();
                }
            });
        });
    }

    cy.visit(getDashboardUrl(identifier));
    cy.document().then(waitForFulLRender);
}
export class CapturedDataSniffer {
    private dashboards: string[] = [];
    private executions: {
        [executionId: string]: {
            definition: IExecutionDefinition;
            windows: DataViewWindow[];
        };
    } = {};
    private insights: string[] = [];
    private elements: CapturedElementQuery[] = [];
    private displayForms: IAttributeDisplayFormMetadataObject[] = [];

    constructor(private name: string) {}

    public sniffCapturedData() {
        cy.window().then((w) => {
            const capturedData: CapturedData = w["CapturedData"] ?? emptyCapturedData;
            this.dashboards = this.dashboards.concat(capturedData.dashboards);
            this.insights = this.insights.concat(capturedData.insights);
            this.elements = this.elements.concat(capturedData.elements);
            this.displayForms = this.displayForms.concat(capturedData.displayForms);
            this.executions = merge(this.executions, capturedData.executions);
        });
    }

    public commitCapturedData() {
        return cy.writeFile(`./generated/captured/${this.name}.json`, {
            dashboards: this.dashboards,
            insights: this.insights,
            executions: this.executions,
            elements: this.elements,
            displayForms: this.displayForms,
        });
    }
}

export function sniffCapturings(spec: string) {
    if (Cypress.env("capturing")) {
        const capturedDataSniffer = new CapturedDataSniffer(spec);

        afterEach(() => {
            capturedDataSniffer.sniffCapturedData();
        });

        after((done) => {
            // Wait for executions running after pushData etc
            cy.wait(2000).then(() => {
                capturedDataSniffer.commitCapturedData().then(done);
            });
        });
    }
}
