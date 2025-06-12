#!/usr/bin/env node
// (C) 2021-2025 GoodData Corporation

import {
    createTigerWorkspaceWithPrefix,
    logLn,
    setTigerWorkspaceLayoutFromFixtures,
} from "@gooddata/fixtures";
import { E2E_SDK_WORKSPACE_PREFIX, FIXTURE_TYPES, BACKEND, DATA_SOURCE } from "./constants.js";
import fs from "fs";
import path from "path";

function validateEnv() {
    const { PATH_TO_FIXTURES, HOST_NAME, TIGER_API_TOKEN } = process.env;

    if (!(HOST_NAME && TIGER_API_TOKEN)) {
        logLn("HOST, TIGER_API_TOKEN need to be set in the .env file");
        return false;
    }

    if (!PATH_TO_FIXTURES) {
        logLn("PATH_TO_FIXTURES need to be set in the .env file");
        return false;
    }
    return true;
}

function addOrReplaceWorkspaceIdInEnv(createdWorkspaceId) {
    const { WORKSPACE_ID } = process.env;

    const pathToFile = path.resolve(".env");

    // Read .env file
    let envData = fs.readFileSync(pathToFile, "utf8");

    if (WORKSPACE_ID) {
        // Replace WORKSPACE_ID value
        envData = envData.replace(/(WORKSPACE_ID=).*/, `$1${createdWorkspaceId}`);
    } else {
        // Append WORKSPACE_ID value
        envData += `\nWORKSPACE_ID=${createdWorkspaceId}`;
    }

    // Write the updated data back to the .env file
    fs.writeFileSync(pathToFile, envData);

    logLn("WORKSPACE_ID: " + createdWorkspaceId + " set in .env file successfully");
}

async function createFixture() {
    const { HOST_NAME, PATH_TO_FIXTURES, TIGER_API_TOKEN } = process.env;

    const workspaceId = await createTigerWorkspaceWithPrefix(
        E2E_SDK_WORKSPACE_PREFIX,
        TIGER_API_TOKEN,
        HOST_NAME,
        "TIGER",
    );

    await setTigerWorkspaceLayoutFromFixtures(
        workspaceId,
        FIXTURE_TYPES,
        DATA_SOURCE,
        TIGER_API_TOKEN,
        HOST_NAME,
        BACKEND,
        PATH_TO_FIXTURES,
    );

    return workspaceId;
}

export async function import_fixture() {
    try {
        if (!validateEnv()) {
            return;
        }

        const createdWorkSpaceId = await createFixture();

        addOrReplaceWorkspaceIdInEnv(createdWorkSpaceId);

        logLn("Import workspace fixtures successfully WORKSPACE_ID: " + createdWorkSpaceId);
    } catch (e) {
        logLn(e.toString());
        // eslint-disable-next-line no-console
        console.error(e);
    }
}
