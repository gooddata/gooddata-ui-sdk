// (C) 2021-2022 GoodData Corporation

import path from "path";
import fs from "fs";

import { log } from "@gooddata/fixtures/logger.js";
import { createFixture } from "@gooddata/fixtures";

import { BEAR_FIXTURE_PATHS, BEAR_FIXTURE_METADATA_EXTENSIONS } from "../constant.js";

export async function createWorkspace(fixtureName, userName, password, host, authToken) {
    let extensionExists = true;
    const extensionFile = BEAR_FIXTURE_METADATA_EXTENSIONS[fixtureName];
    if (!fs.existsSync(extensionFile)) {
        log(`There is no extension for ${fixtureName}. File ${extensionFile} does not exist.`);
        extensionExists = false;
    }

    const dateString = new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
        hour12: false,
    }).format(new Date());
    return await createFixture(
        path.resolve(`./node_modules/@gooddata/fixtures/assets/fixtures/${BEAR_FIXTURE_PATHS[fixtureName]}`),
        userName,
        password,
        host,
        authToken,
        `Test reference workspace ${dateString}`,
        extensionExists ? path.resolve(extensionFile) : undefined,
    );
}
