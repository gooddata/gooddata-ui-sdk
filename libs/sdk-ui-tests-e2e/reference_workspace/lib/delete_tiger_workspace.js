#!/usr/bin/env node
// (C) 2021-2025 GoodData Corporation

import { deleteTigerWorkspace, log } from "@gooddata/fixtures";
import fs from "fs";
import { deleteVariableFromEnv } from "./delete_helper.js";
import { retryOperation } from "./utils.js";

import { TIGER_CHILD_WORKSPACE_FIXTURE_CATALOG } from "../constant.js";

import "../../scripts/env.js";

const envFilePath = ".env";

async function main() {
    try {
        const { HOST, TIGER_API_TOKEN, TEST_WORKSPACE_ID, TEST_CHILD_WORKSPACE_ID } = process.env;

        if (!TIGER_API_TOKEN) {
            log("TIGER_API_TOKEN not specified in the .env file. Skipping.\n");
            return;
        }

        if (TEST_CHILD_WORKSPACE_ID) {
            log(`Removing TEST_CHILD_WORKSPACE_ID ${TEST_CHILD_WORKSPACE_ID}`);
            // retry to give Pg some time to replicate child WS removal to slaves
            await retryOperation(
                () => deleteTigerWorkspace(TEST_CHILD_WORKSPACE_ID, TIGER_API_TOKEN, HOST, "TIGER"),
                10,
                1000,
            );

            deleteVariableFromEnv(TEST_CHILD_WORKSPACE_ID, envFilePath);
            log("Deleting TypeScript Tiger children workspace mappings");
            try {
                fs.unlinkSync(TIGER_CHILD_WORKSPACE_FIXTURE_CATALOG);
            } catch {
                log("Delete TypeScript Tiger children workspace mappings failed");
            }
        }

        if (!TEST_WORKSPACE_ID) {
            log("TEST_WORKSPACE_ID not specified in the .env file. Skipping.\n");
            return;
        }

        log(`Removing TEST_WORKSPACE_ID ${TEST_WORKSPACE_ID} from the .env file\n`);
        // retry to give Pg some time to replicate child WS removal to slaves
        await retryOperation(
            () => deleteTigerWorkspace(TEST_WORKSPACE_ID, TIGER_API_TOKEN, HOST, "TIGER"),
            10,
            1000,
        );

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
