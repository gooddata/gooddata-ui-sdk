// (C) 2021-2026 GoodData Corporation

import "./isolatedTest";
import "./session";
import "./commands";
import "./recordings";
import "cypress-real-events/support";
import "./featureHub";
// oxlint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import registerCypressGrep from "@cypress/grep/src/support";
import installLogsCollector from "cypress-terminal-report/src/installLogsCollector";

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
