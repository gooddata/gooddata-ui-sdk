// (C) 2021-2024 GoodData Corporation

import { logInfo } from "./terminal/loggers.js";
import fse from "fs-extra";
import { parse } from "dotenv";
import { readFileSync } from "fs";

function readDotEnv(): Record<string, string> {
    logInfo("Reading .env and .env.secrets files.");

    const env = fse.existsSync(".env") ? parse(readFileSync(".env")) : {};
    const secrets = fse.existsSync(".env.secrets") ? parse(readFileSync(".env.secrets")) : {};

    return {
        ...env,
        ...secrets,
    };
}

/**
 * Load environment variables. This will read .env and .env.secrets files in the current directory. If TIGER_API_TOKEN are set as normal env variables, then they will be used.
 */
export function loadEnv(): Record<string, string> {
    const dotEnvContent: Record<string, string> = readDotEnv();
    const { TIGER_API_TOKEN } = process.env;

    if (TIGER_API_TOKEN) {
        dotEnvContent.TIGER_API_TOKEN = TIGER_API_TOKEN;
    }

    return dotEnvContent;
}
