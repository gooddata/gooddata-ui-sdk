#!/usr/bin/env node
// (C) 2022 GoodData Corporation
fs = require("fs");
const { deleteTigerWorkspace } = require("@gooddata/fixtures");
const { log } = require("@gooddata/fixtures/logger.js");

require("dotenv").config();

const envFilePath = ".env";

async function removeWorkspace(envVariableName) {
    const workspaceId = process.env[envVariableName];

    if (!workspaceId) {
        log(`${envVariableName} not specified in the .env file. Skipping.`);
        return;
    }

    const { HOST, TIGER_API_TOKEN, SDK_BACKEND } = process.env;

    console.log(`Removing WORKSPACE_ID ${workspaceId}`);
    await deleteTigerWorkspace(workspaceId, TIGER_API_TOKEN, HOST, SDK_BACKEND);

    const envFileContent = fs.readFileSync(envFilePath, "utf-8");
    const newEnvFileContent = envFileContent
        .split("\n")
        .filter((line) => line.indexOf(envVariableName) === -1)
        .join("\n");

    log(`Removing ${envVariableName} from the .env file`);

    fs.writeFileSync(envFilePath, newEnvFileContent);
}

async function main() {
    await removeWorkspace("WORKSPACE_ID");
}

main();
