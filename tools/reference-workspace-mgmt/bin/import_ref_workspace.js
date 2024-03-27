#!/usr/bin/env node
// (C) 2021-2024 GoodData Corporation

import fs from "fs";
import { config } from "dotenv"; // eslint-disable-line
import { import_fixture } from "./import_tiger_workspace_fixture.js";

if (fs.existsSync(".env")) {
    console.log("Loading environment variables from .env file"); // eslint-disable-line
    config();
}

await import_fixture();
