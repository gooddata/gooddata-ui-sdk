#!/usr/bin/env node
// (C) 2021-2025 GoodData Corporation

import { cleanupExpiredTigerWorkspaces, log } from "@gooddata/fixtures";

import {
    E2E_SDK_CHILD_WORKSPACE_PREFIX,
    E2E_SDK_WORKSPACE_PREFIX,
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
        log("Clean up Expired Tiger Workspaces");
        await cleanupTigerWorkspace(E2E_SDK_CHILD_WORKSPACE_PREFIX);
        await cleanupTigerWorkspace(E2E_SDK_WORKSPACE_PREFIX);
    } catch (e) {
        log(e.toString());
        console.error(e);
    }
}

main();
