// (C) 2021-2025 GoodData Corporation
console.log("Cypress support/index.ts is loaded");
import "./isolatedTest";
import { establishSession } from "./session";
import "./commands";
import "./recordings";
import "cypress-real-events/support";
import "./featureHub";

// this is very strange - but it seems that the before() and beforeEach() hooks are not executed when was in ./session script
// so token was not provided when you try to run integration tests on localhost
before(establishSession);
beforeEach(establishSession);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import registerCypressGrep from "@cypress/grep/src/support";
registerCypressGrep();
