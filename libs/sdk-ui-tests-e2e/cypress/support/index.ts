// (C) 2021-2025 GoodData Corporation
import "./isolatedTest";
import "./session";
import "./commands";
import "./recordings";
import "cypress-real-events/support";
import "./featureHub";
import installLogsCollector from "cypress-terminal-report/src/installLogsCollector";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import registerCypressGrep from "@cypress/grep/src/support";
registerCypressGrep();

installLogsCollector({
    collectTypes: [
        "cons:log",
        "cons:warn",
        "cons:error",
        "cy:log",
        "cy:xhr",
        "cy:fetch",
        "cy:request",
        "cy:intercept",
        "cy:command",
    ],
});
