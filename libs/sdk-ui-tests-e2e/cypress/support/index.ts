// (C) 2021-2025 GoodData Corporation

import { beforeMocks, afterMocks } from "./isolatedTest";
import { establishSession } from "./session";
import "./commands";
import "./recordings";
import "cypress-real-events/support";
import { beforeFH } from "./featureHub";

// order is important here - mocks must be established before session
before(beforeMocks);
after(afterMocks);

// this is very strange - but it seems that the before() and beforeEach() hooks are not executed when was in ./session script
// so token was not provided when you try to run integration tests on localhost
before(establishSession);
beforeEach(establishSession);

// feature hub must be initialized after session is established

beforeEach(beforeFH);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import registerCypressGrep from "@cypress/grep/src/support";
registerCypressGrep();
