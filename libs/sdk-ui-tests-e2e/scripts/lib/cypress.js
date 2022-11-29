#!/usr/bin/env node
// (C) 2021-2022 GoodData Corporation

import { spawn, execSync } from "child_process";

const DEFAULT_CONFIG = {
    specFilesFilter: "",
    tagsFilter: [],
    workspaceId: "",
    childWorkspaceId: "",
    customCypressConfig: {},
    updateSnapshots: false,
    deleteCypressResults: true,
};

export function runCypress(configParams = {}) {
    process.stdout.write("Running Cypress\n");

    const {
        visual,
        appHost,
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
        sdkBackend,
        tigerPermissionDatasourceName,
        tigerPermissionDatasourcePassword,
        tigerApiToken,
        tigerApiTokenNamePrefix,
    } = { ...DEFAULT_CONFIG, ...configParams };

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

    if (sdkBackend) {
        cypressProps["CYPRESS_SDK_BACKEND"] = sdkBackend;
    }

    const args = [visual ? "open" : "run"];
    if (!visual && specFilesFilter !== "") {
        args.push("--spec", `./**/*${specFilesFilter}*`);
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
