// (C) 2021-2026 GoodData Corporation

import fs from "fs";

import { config as envConfig } from "dotenv";

if (fs.existsSync(".env")) {
    envConfig({ path: ".env" });
}
