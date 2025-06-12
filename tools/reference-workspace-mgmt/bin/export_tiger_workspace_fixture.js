#!/usr/bin/env node
// (C) 2021-2025 GoodData Corporation

import { exportTigerFixtureExtension, logLn } from "@gooddata/fixtures";
import { FIXTURE_TYPES, BACKEND } from "./constants.js";
import fs from "fs";
import path from "path";

function validateEnv() {
    const { PATH_TO_FIXTURES, HOST_NAME, TIGER_API_TOKEN, WORKSPACE_ID } = process.env;

    if (!WORKSPACE_ID) {
        logLn("WORKSPACE_ID not specified in the .env file. Skipping.");
        return false;
    }

    if (!(HOST_NAME && TIGER_API_TOKEN)) {
        logLn("HOST, TIGER_API_TOKEN need to be set in the .env file");
        return false;
    }

    if (!PATH_TO_FIXTURES) {
        logLn("PATH_TO_FIXTURES need to be set in the .env file");
        return false;
    }
    return true;
}

// eslint-disable-next-line sonarjs/cognitive-complexity
function replaceUserByAdmin() {
    const { PATH_TO_FIXTURES } = process.env;

    const pathToFile = path.resolve(PATH_TO_FIXTURES);

    // Read the file
    const data = fs.readFileSync(pathToFile, "utf-8");
    // Parse the JSON
    const jsonData = JSON.parse(data);

    //  Recursive function to find the first occurrence of the "createdBy" or "modifiedBy" != "admin" object and get the id
    function findFirstCreatedBy(obj) {
        for (const key in obj) {
            if (typeof obj[key] === "object") {
                if (
                    (key === "createdBy" || key === "modifiedBy") &&
                    // eslint-disable-next-line no-prototype-builtins
                    obj[key].hasOwnProperty("id") &&
                    obj[key].id !== "admin"
                ) {
                    return obj[key].id;
                } else {
                    const result = findFirstCreatedBy(obj[key]);
                    if (result) return result;
                }
            }
        }
    }

    const firstId = findFirstCreatedBy(jsonData);

    if (!firstId) {
        logLn("No 'createdBy' or 'modifiedBy' object found in the fixture file replacing skipped.");
        return;
    }

    // Replace all occurrences of the first id with 'admin'
    const updatedData = data.replace(new RegExp(firstId, "g"), "admin");

    // Write the updated data back to the file
    fs.writeFileSync(pathToFile, updatedData);
}

export async function export_fixture() {
    try {
        const { HOST_NAME, PATH_TO_FIXTURES, TIGER_API_TOKEN, WORKSPACE_ID } = process.env;

        if (!validateEnv()) {
            return;
        }

        await exportTigerFixtureExtension(
            FIXTURE_TYPES,
            WORKSPACE_ID,
            TIGER_API_TOKEN,
            HOST_NAME,
            BACKEND,
            PATH_TO_FIXTURES,
        );

        replaceUserByAdmin();

        logLn("Export workspace fixtures successfully");
    } catch (e) {
        logLn(e.toString());
        // eslint-disable-next-line no-console
        console.error(e);
    }
}
