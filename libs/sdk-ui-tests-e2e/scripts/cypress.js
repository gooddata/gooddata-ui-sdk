#!/usr/bin/env node
// (C) 2021-2022 GoodData Corporation

const { spawn } = require("child_process");
const DEFAULT_CONFIG = {
    specFilesFilter: "",
    tagsFilter: [],
    workspaceId: "",
    customCypressConfig: {},
    updateSnapshots: false,
};

function runCypress(configParam = {}) {
    process.stdout.write("Running Cypress\n");

    const {
        visual,
        appHost,
        mockServer,
        authorization,
        specFilesFilter,
        tagsFilter,
        workspaceId,
        customCypressConfig,
        updateSnapshots,
        config,
        browser,
    } = { ...DEFAULT_CONFIG, ...configParam };

    const cypressProps = {
        CYPRESS_HOST: appHost,
        CYPRESS_TEST_WORKSPACE_ID: workspaceId,
    };

    cypressProps["CYPRESS_updateSnapshots"] = updateSnapshots;

    if (authorization.credentials) {
        cypressProps["CYPRESS_USERNAME"] = authorization.credentials.userName;
        cypressProps["CYPRESS_PASSWORD"] = authorization.credentials.password;
    }

    if (authorization.token) {
        cypressProps["CYPRESS_TIGER_API_TOKEN"] = authorization.token;
    }

    if (customCypressConfig) {
        Object.assign(cypressProps, customCypressConfig);
    }

    if (mockServer) {
        cypressProps["CYPRESS_MOCK_SERVER"] = `http://${mockServer}`;
    }

    if (!visual) {
        cypressProps["CYPRESS_COMMAND_DELAY"] = 0;
    }

    const args = [visual ? "open" : "run"];
    if (specFilesFilter) {
        args.push("--spec", `./**/${specFilesFilter}*`);
    }
    if (tagsFilter && tagsFilter.length > 0) {
        args.push("--env", `grepTags="${tagsFilter.join(" ")}"`);
    }
    if (config) {
        args.push("--config", config);
    }
    if (browser) {
        args.push("--browser", browser);
    }

    const cypressProcess = spawn("cypress", args, {
        env: {
            ...process.env,
            ...cypressProps,
        },
    });

    cypressProcess.stdout.on("data", (data) => {
        process.stdout.write(data);
    });
    cypressProcess.stderr.on("data", (data) => {
        process.stderr.write(data);
    });
    return cypressProcess;
}

module.exports = {
    runCypress,
};
