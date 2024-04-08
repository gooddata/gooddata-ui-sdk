#!/usr/bin/env node
// (C) 2021-2024 GoodData Corporation
/* eslint-disable sonarjs/cognitive-complexity */

import { spawn, execSync } from "child_process";

const DEFAULT_CONFIG = {
    specFilesFilter: [],
    tagsFilter: [],
    workspaceId: "",
    childWorkspaceId: "",
    customCypressConfig: {},
    updateSnapshots: false,
    deleteCypressResults: true,
    recording: false,
};

export function runCypress(configParams = {}) {
    process.stdout.write("Running Cypress\n");

    const {
        visual,
        appHost,
        backendHost,
        mockServer,
        authorization,
        specFilesFilter,
        tagsFilter,
        workspaceId,
        childWorkspaceId,
        customCypressConfig,
        deleteCypressResults,
        updateSnapshots,
        config,
        browser,
        tigerPermissionDatasourceName,
        tigerPermissionDatasourcePassword,
        tigerApiToken,
        tigerApiTokenNamePrefix,
        recording,
        workingDir,
    } = { ...DEFAULT_CONFIG, ...configParams };

    const cypressProps = {
        CYPRESS_HOST: appHost,
        CYPRESS_TEST_WORKSPACE_ID: workspaceId,
        CYPRESS_BACKEND_HOST: backendHost,
    };

    cypressProps["CYPRESS_updateSnapshots"] = updateSnapshots;

    if (authorization.credentials) {
        cypressProps["CYPRESS_USER_NAME"] = authorization.credentials.userName;
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

    if (recording) {
        cypressProps["CYPRESS_IS_RECORDING"] = recording;
    }

    cypressProps["CYPRESS_WORKING_DIR"] = workingDir
        ? workingDir
        : "/gooddata-ui-sdk-e2e/libs/sdk-ui-tests-e2e";

    const args = [visual ? "open" : "run", "--e2e"];

    if (!visual && specFilesFilter.length > 0) {
        args.push("--spec", specFilesFilter.map((x) => `./**/*${x}*`).join(","));
    }

    if (tagsFilter && tagsFilter.length > 0) {
        args.push("--env", `grepTags="${tagsFilter.join(" ")}"`);
    }

    if (browser) {
        args.push("--browser", browser);
    }

    const { CURRENTS_PROJECT_ID, CURRENTS_CI_BUILD_ID, RUN_PARALLEL } = process.env;

    let cypressCommand = "cypress";

    if (RUN_PARALLEL === "true") {
        console.log("Going to run paralle test");
        args.push("--record");
        args.push("--parallel");
        args.push("--ci-build-id", CURRENTS_CI_BUILD_ID);
        cypressCommand = "currents";
    }

    if (config) {
        args.push("--config", config + (CURRENTS_PROJECT_ID ? `,projectId=${CURRENTS_PROJECT_ID}` : ""));
    } else if (CURRENTS_PROJECT_ID) {
        args.push("--config", `projectId=${CURRENTS_PROJECT_ID}`);
    }

    if (deleteCypressResults) {
        execSync(`rm -rf cypress/results`);
    }

    if (childWorkspaceId) {
        cypressProps["CYPRESS_TEST_CHILD_WORKSPACE_ID"] = childWorkspaceId;
    }

    if (tigerPermissionDatasourcePassword) {
        cypressProps["CYPRESS_TIGER_PERMISSION_DATASOURCE_PASSWORD"] = tigerPermissionDatasourcePassword;
    }

    if (tigerPermissionDatasourceName) {
        cypressProps["CYPRESS_TIGER_DATASOURCES_NAME"] = tigerPermissionDatasourceName;
    }

    if (tigerApiTokenNamePrefix) {
        cypressProps["CYPRESS_TIGER_API_TOKEN_NAME_PREFIX"] = tigerApiTokenNamePrefix;
    }

    if (tigerApiToken) {
        cypressProps["CYPRESS_TIGER_API_TOKEN"] = tigerApiToken;
    }

    console.log("Going to run cypress with args: ", args);
    const cypressProcess = spawn(cypressCommand, args, {
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
