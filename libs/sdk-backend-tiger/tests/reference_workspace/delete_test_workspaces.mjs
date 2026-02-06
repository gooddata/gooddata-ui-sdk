#!/usr/bin/env node
// (C) 2022-2026 GoodData Corporation

import fs from "fs";

import dotenv from "dotenv";

import { deleteTigerWorkspace, log } from "@gooddata/fixtures";

dotenv.config();

const envFilePath = ".env";

async function main() {
    try {
        const { HOST, TIGER_API_TOKEN, WORKSPACE_ID } = process.env;

        if (!TIGER_API_TOKEN) {
            log("TIGER_API_TOKEN not specified in the .env file. Skipping.\n");
            return;
        }

        if (!WORKSPACE_ID) {
            log("WORKSPACE_ID not specified in the .env file. Skipping.\n");
            return;
        }

        log(`Deleting WORKSPACE_ID ${WORKSPACE_ID}`);
        await deleteTigerWorkspace(WORKSPACE_ID, TIGER_API_TOKEN, HOST, "TIGER");

        const envFileContent = fs.readFileSync(envFilePath, "utf-8");
        const newEnvFileContent = envFileContent
            .split("\n")
            .filter((line) => line.indexOf(WORKSPACE_ID) === -1)
            .join("\n");

        log(`Removing WORKSPACE_ID ${WORKSPACE_ID} from the .env file`);

        fs.writeFileSync(envFilePath, newEnvFileContent);
    } catch (e) {
        log(e.toString());
        console.error(e);
        process.exit(1);
    }
}

void main();
