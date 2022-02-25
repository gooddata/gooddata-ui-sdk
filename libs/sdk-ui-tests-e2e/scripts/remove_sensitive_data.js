#!/usr/bin/env node
// (C) 2021 GoodData Corporation

const { execSync } = require("child_process");
const fs = require("fs");

function sanitizeCredentials() {
    try {
        const stdout = execSync("ls ./recordings/mappings/*").toString();
        if (stdout) {
            const testRecordings = stdout.split("\n");
            testRecordings.forEach((testRecordingFile) => {
                if (testRecordingFile === "") {
                    return;
                }
                const data = fs.readFileSync(testRecordingFile);
                const json = JSON.parse(data);

                if (json.mappings) {
                    json.mappings.forEach((mapping) => {
                        if (mapping && mapping.request && mapping.request.url === "/gdc/account/login") {
                            delete mapping.request.bodyPatterns;
                            delete mapping.response.headers["Set-Cookie"];
                        }
                    });
                }

                fs.writeFileSync(testRecordingFile, JSON.stringify(json, null, 2) + "\n");
            });
        }
    } catch {
        process.stdout.write("Credentials not cleared\n");
    }
}

module.exports = {
    sanitizeCredentials,
};
