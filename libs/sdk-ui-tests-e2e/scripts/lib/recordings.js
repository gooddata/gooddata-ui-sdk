#!/usr/bin/env node
// (C) 2021-2022 GoodData Corporation

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { findSpecFilePaths } from "./specFiles.js";

export function deleteRecordings(specFilter, backend, testTags) {
    process.stdout.write(`Deleting recordings ${specFilter}, tags: ${testTags}\n`);
    ensureRecordingsDirectory(backend);
    deleteFilesInDir(`./recordings/mappings/${backend}`, specFilter, "./cypress/integration/", testTags);
}

function deleteFilesInDir(directory, specFilter, testDir, testTags = []) {
    const filter = (specFilter || "").trim();
    const files = fs.readdirSync(directory);
    files.forEach((file) => {
        let trimFileName = file.replace("mapping-", "").replace(".json", "");
        if (filter.includes(trimFileName)) {
            const fullPath = `${directory}/${file}`;
            //Get testPath of the first spec file which has the matching name
            //It will not work if there multiple spec files which have the same name
            const testPath = findSpecFilePaths(testDir, trimFileName)[0];
            const tagMatching = testTags.some((tag) => fileContainsString(testPath, tag));
            if (!testTags.length || tagMatching) {
                process.stdout.write(`processing ${file}: removing\n`);
                execSync(`rm ${fullPath}`);
            } else {
                process.stdout.write(`processing ${file}: skipping (tags)\n`);
            }
        } else {
            process.stdout.write(`processing ${file}: skipping (filter)\n`);
        }
    });
}

export function sanitizeCredentials(testRecordings) {
    try {
        testRecordings.forEach((testRecordingFile) => {
            if (testRecordingFile === "") {
                return;
            }

            const fileExists = fs.existsSync(testRecordingFile);
            if (!fileExists) {
                process.stdout.write(
                    `Credentials clearing: skipping ${testRecordingFile}: file does not exist.\n`,
                );
                return;
            }

            const data = fs.readFileSync(testRecordingFile);
            const json = JSON.parse(data);

            if (json.mappings) {
                json.mappings.forEach((mapping) => {
                    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
                    if (mapping && mapping.request && mapping.request.url === "/gdc/account/login") {
                        delete mapping.request.bodyPatterns;
                        delete mapping.response.headers["Set-Cookie"];
                    }
                });
            }

            fs.writeFileSync(testRecordingFile, JSON.stringify(json, null, 2) + "\n");
        });
    } catch (e) {
        process.stdout.write(`${e.message}\n`);
        process.stdout.write("Credentials not cleared\n");
    }
}

export function sanitizeWorkspaceId(sourceWorkspaceId, targetWorkspaceId, testRecordings) {
    if (sourceWorkspaceId === targetWorkspaceId) {
        process.stdout.write(
            `Source and target workspace id is the same (${sourceWorkspaceId}), skipping sanitize\n`,
        );
        return;
    }

    try {
        process.stdout.write(`Sanitize projectId (${sourceWorkspaceId} -> ${targetWorkspaceId})\n`);
        const expression =
            "\\(" +
            testRecordings.reduce((exp, testRecordingFile, index, testRecordings) => {
                const addOperator = index !== testRecordings.length - 1;
                return exp + ` -name ${path.basename(testRecordingFile)} ${addOperator ? " -o" : ""}`;
            }, "") +
            " \\)";

        execSync(
            `find ./recordings/mappings/ ${expression} -type f -exec sed -i 's/${sourceWorkspaceId}/${targetWorkspaceId}/g' {} +`,
        );
    } catch {
        process.stdout.write("ProjectId not sanitized\n");
    }
}

export function ensureRecordingsDirectory(backend) {
    fs.mkdirSync(`./recordings/mappings/${backend}`, { recursive: true });
}

export function recordingsPresent(backend) {
    const recordingsLength = fs.readdirSync(`./recordings/mappings/${backend}`).length;
    return recordingsLength !== 0;
}

export function getRecordingsWorkspaceId() {
    return "c76e0537d0614abb0027f7c992656b964922506f";
}

export function fileContainsString(filePath, text) {
    try {
        const contents = fs.readFileSync(filePath);
        const texts = [].concat(text);

        return texts.some((t) => contents.includes(t));
    } catch (e) {
        process.stderr.write(`Opening ${filePath} failed while checking for string ${text}\n`);
        return false;
    }
}
