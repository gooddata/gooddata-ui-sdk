#!/usr/bin/env node
// (C) 2021 GoodData Corporation

const { execSync } = require("child_process");
const fs = require("fs");

function deleteRecordings() {
    process.stdout.write("Deleting recordings\n");
    deleteFilesInDir("./recordings/__files");
    deleteFilesInDir("./recordings/mappings");
}

function deleteFilesInDir(directory) {
    execSync(`rm -rf ${directory}/*`);
}

function sanitizeCredentials() {
    try {
        const stdout = execSync("ls ./recordings/mappings/gdc_account_login*").toString();
        if (stdout) {
            const loginRecordings = stdout.split("\n");
            loginRecordings.forEach((loginRecording) => {
                if (loginRecording === "") {
                    return;
                }
                const data = fs.readFileSync(loginRecording);
                const json = JSON.parse(data);
                delete json["request"]["bodyPatterns"];
                delete json["response"]["headers"]["Set-Cookie"];
                fs.writeFileSync(loginRecording, JSON.stringify(json, null, 2));
            });
        }
    } catch (error) {
        process.stdout.write("error", error);
        process.stdout.write("Credentials not cleared\n");
    }
}

function recordingsPresent() {
    const recordingsLength = fs.readdirSync("./recordings/mappings").length;
    return recordingsLength !== 0;
}

function saveRecordingsWorkspaceId(workspaceId) {
    fs.writeFileSync(
        "./recordings/recordings_workspace.json",
        JSON.stringify(
            {
                workspaceId,
            },
            null,
            2,
        ),
    );
}

function getRecordingsWorkspaceId() {
    return JSON.parse(fs.readFileSync("./recordings/recordings_workspace.json")).workspaceId;
}

module.exports = {
    sanitizeCredentials,
    recordingsPresent,
    saveRecordingsWorkspaceId,
    deleteRecordings,
    getRecordingsWorkspaceId,
};
