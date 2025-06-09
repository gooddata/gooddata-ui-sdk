#!/usr/bin/env node
// (C) 2022-2025 GoodData Corporation

import fs from "fs";
import { getRecordingsWorkspaceId } from "../scripts/lib/recordings.js";
import { log } from "@gooddata/fixtures";
import "../scripts/env.js";
import { deleteVariableFromEnv } from "./lib/delete_helper.js";

const envFilePath = ".env";
const { TEST_WORKSPACE_ID } = process.env;
deleteVariableFromEnv(TEST_WORKSPACE_ID, envFilePath);
fs.appendFile(envFilePath, `TEST_WORKSPACE_ID=${getRecordingsWorkspaceId()}\n`, () => {
    log(`TEST_WORKSPACE_ID ${getRecordingsWorkspaceId()} added to the ${envFilePath} file\n`);
});
