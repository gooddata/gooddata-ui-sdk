#!/usr/bin/env node
// (C) 2021-2022 GoodData Corporation

import { deleteProject } from "@gooddata/fixtures";
import { log } from "@gooddata/fixtures/logger.js";

import "../../scripts/env.js";

import { deleteVariableFromEnv } from "./delete_helper.js";

async function main() {
    try {
        const envFilePath = ".env";
        const { USER_NAME, PASSWORD, HOST, TEST_WORKSPACE_ID } = process.env;

        if (!TEST_WORKSPACE_ID) {
            log("TEST_WORKSPACE_ID not specified in the .env file. Skipping.\n");
            return;
        }

        if (!(USER_NAME && PASSWORD && HOST)) {
            log("USER_NAME, PASSWORD, and HOST need to be set in the .env file\n");
            return;
        }

        await deleteProject(HOST, TEST_WORKSPACE_ID, USER_NAME, PASSWORD);

        deleteVariableFromEnv(TEST_WORKSPACE_ID, envFilePath);
    } catch (e) {
        log(e.toString());
        // eslint-disable-next-line no-console
        console.error(e);
        process.exit(1);
    }
}

main();
