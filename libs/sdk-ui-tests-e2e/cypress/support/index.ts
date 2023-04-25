// (C) 2021 GoodData Corporation
import "./isolatedTest";
import "./session";
import "./commands";
import "./recordings";
import "cypress-real-events/support";
import "./featureHub";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import registerCypressGrep from "@cypress/grep/src/support";
registerCypressGrep();
