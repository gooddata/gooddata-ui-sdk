#!/usr/bin/env node
// (C) 2021-2024 GoodData Corporation

import { cleanupExpiredTigerWorkspaces } from "@gooddata/fixtures";
import { log } from "@gooddata/fixtures/logger.js";

import {
    E2E_SDK_WORKSPACE_PREFIX,
    E2E_SDK_CHILD_WORKSPACE_PREFIX,
    EXPIRED_WORKSPACE_TIME,
} from "../constant.js";
import "../../scripts/env.js";

async function cleanupTigerWorkspace(kdTigerWorkspace) {
    const { HOST, TIGER_API_TOKEN } = process.env;
    await cleanupExpiredTigerWorkspaces(
        kdTigerWorkspace,
        EXPIRED_WORKSPACE_TIME,
        ["workspaces"],
        1000,
        TIGER_API_TOKEN,
        HOST,
        "TIGER",
    );
}

async function main() {
    try {
        // eslint-disable-next-line no-console
        log("Clean up Expired Tiger Workspaces");
        await cleanupTigerWorkspace(E2E_SDK_CHILD_WORKSPACE_PREFIX);
        await cleanupTigerWorkspace(E2E_SDK_WORKSPACE_PREFIX);
    } catch (e) {
        log(e.toString());
        // eslint-disable-next-line no-console
        console.error(e);
    }
}

main();
