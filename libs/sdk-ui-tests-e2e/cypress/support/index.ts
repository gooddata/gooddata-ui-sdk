// (C) 2021 GoodData Corporation
import "./commands";
import "./recordings";
import "cypress-real-events/support";
import "./featureHub";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const registerCypressGrep = require("@cypress/grep");
registerCypressGrep();
