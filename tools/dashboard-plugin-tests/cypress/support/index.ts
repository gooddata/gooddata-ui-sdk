// (C) 2019-2022 GoodData Corporation
import uniq from "lodash/uniq";
import uniqBy from "lodash/uniqBy";
import isEqual from "lodash/isEqual";
import { SERVER_URL } from "../../src/constants";
import { CapturedData } from "../../src/app/backend/withCapturing";

const WEBPACK_DEV_SERVER_PORT = 8443;
const WEBPACK_DEV_SERVER_URL = `https://localhost:${WEBPACK_DEV_SERVER_PORT}`;

export function getDashboardUrl(id: string) {
    if (Cypress.env("mode") === "dev") {
        return `${WEBPACK_DEV_SERVER_URL}/#${id}`;
    }

    return `${SERVER_URL}/#${id}`;
}

const emptyCapturedData: CapturedData = {
    dashboards: [],
    executions: [],
    insights: [],
    // elements: []
};
export class CapturedDataSniffer {
    private dashboards = [];
    private executions = [];
    private insights = [];
    // private elements = [];

    constructor(private name: string) {}

    public sniffCapturedData() {
        cy.window().then((w) => {
            const capturedData = w["CapturedData"] ?? emptyCapturedData;
            this.dashboards = this.dashboards.concat(capturedData.dashboards);
            this.insights = this.insights.concat(capturedData.insights);
            this.executions = this.executions.concat(capturedData.executions);
        });
    }

    public commitCapturedData() {
        cy.writeFile(`./generated/captured/${this.name}.json`, {
            dashboards: uniq(this.dashboards),
            insights: uniq(this.insights),
            executions: uniqBy(this.executions, isEqual),
        });
    }

    public updateRecordedBackendSpecs() {
        // TODO: RAIL-3888 - get captured data and generate specs for mock-handling
    }
}
