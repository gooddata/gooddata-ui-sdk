#!/usr/bin/env node
// (C) 2021-2022 GoodData Corporation

import { deleteTigerWorkspace } from "@gooddata/fixtures";
import fs from "fs";
import { log } from "@gooddata/fixtures/logger.js";

import { deleteVariableFromEnv } from "./delete_helper.js";

import { TIGER_CHILD_WORKSPACE_FIXTURE_CATALOG } from "../constant.js";

import "../../scripts/env.js";
const envFilePath = ".env";

async function main() {
    try {
        const { HOST, TIGER_API_TOKEN, TEST_WORKSPACE_ID, TEST_CHILD_WORKSPACE_ID, SDK_BACKEND } =
            process.env;

        if (!TIGER_API_TOKEN) {
            log("TIGER_API_TOKEN not specified in the .env file. Skipping.\n");
            return;
        }

        if (TEST_CHILD_WORKSPACE_ID) {
            log(`Removing TEST_CHILD_WORKSPACE_ID ${TEST_CHILD_WORKSPACE_ID}`);
            await deleteTigerWorkspace(TEST_CHILD_WORKSPACE_ID, TIGER_API_TOKEN, HOST, SDK_BACKEND);

            deleteVariableFromEnv(TEST_CHILD_WORKSPACE_ID, envFilePath);
            log("Deleting TypeScript Tiger children workspace mappings");
            try {
                fs.unlinkSync(TIGER_CHILD_WORKSPACE_FIXTURE_CATALOG);
            } catch (e) {
                log("Delete TypeScript Tiger children workspace mappings failed");
            }
        }

        if (!TEST_WORKSPACE_ID) {
            log("TEST_WORKSPACE_ID not specified in the .env file. Skipping.\n");
            return;
        }

        log(`Removing TEST_WORKSPACE_ID ${TEST_WORKSPACE_ID} from the .env file\n`);
        await deleteTigerWorkspace(TEST_WORKSPACE_ID, TIGER_API_TOKEN, HOST, SDK_BACKEND);

        deleteVariableFromEnv(TEST_WORKSPACE_ID, envFilePath);

        log("Deleting TypeScript Tiger workspace mappings");
        // try {
        //     fs.unlinkSync(TIGER_FIXTURE_CATALOG);
        // } catch (e) {
        //     log("Delete TypeScript Tiger workspace mappings failed");
        // }
    } catch (e) {
        log(e.toString());
        // eslint-disable-next-line no-console
        console.error(e);
        process.exit(1);
    }
}

main();
