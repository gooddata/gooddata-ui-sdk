// (C) 2021-2023 GoodData Corporation

import { logInfo } from "./terminal/loggers.js";
import fse from "fs-extra";
import { parse } from "dotenv";
import { readFileSync } from "fs";
import { TargetBackendType } from "./types.js";

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
 * Load environment variables. This will read .env and .env.secrets files in the current directory. If GDC_USERNAME, GDC_PASSWORD
 * and TIGER_API_TOKEN are set as normal env variables, then they will be used.
 */
export function loadEnv(backend: TargetBackendType): Record<string, string> {
    const dotEnvContent: Record<string, string> = readDotEnv();
    const { GDC_USERNAME, GDC_PASSWORD, TIGER_API_TOKEN } = process.env;

    if (backend === "bear" && GDC_USERNAME) {
        logInfo(
            "GDC_USERNAME env variable set for current session; going to use this for authentication and expecting GDC_PASSWORD is set for current session as well.",
        );

        dotEnvContent.GDC_USERNAME = GDC_USERNAME;

        if (!GDC_PASSWORD) {
            // prevent mixing of credential sources. either both come from .env.secrets or both come from
            // process env variables
            delete dotEnvContent.GDC_PASSWORD;
        } else {
            dotEnvContent.GDC_PASSWORD = GDC_PASSWORD;
        }
    }

    if (backend === "tiger" && TIGER_API_TOKEN) {
        dotEnvContent.TIGER_API_TOKEN = TIGER_API_TOKEN;
    }

    return dotEnvContent;
}
