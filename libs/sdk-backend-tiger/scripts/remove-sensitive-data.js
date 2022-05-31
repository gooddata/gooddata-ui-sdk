#!/usr/bin/env node
// (C) 2022 GoodData Corporation

const { execSync } = require("child_process");
const fs = require("fs");

function mockSensitiveData(accountSetting) {
    const modifiedAccountSetting = { ...accountSetting };
    if (modifiedAccountSetting.userId) {
        modifiedAccountSetting.userId = "first.last";
    }
    if (modifiedAccountSetting.links && modifiedAccountSetting.links.user) {
        modifiedAccountSetting.links.user =
            "https://staging.anywhere.gooddata.com/api/v1/entities/users/first.last";
    }
    return modifiedAccountSetting;
}

(function () {
    const args = process.argv.slice(2);
    const mappingsPath = args[0];

    if (!mappingsPath) {
        process.stdout.write("recordings path must be provided");
        process.exit(1);
    }

    try {
        const stdout = execSync(`ls ${mappingsPath}/api_profile*`).toString();
        if (!stdout) {
            process.exit(0);
        }
        const files = stdout.split("\n");
        files.forEach((filePath) => {
            if (filePath === "") {
                return;
            }
            const data = fs.readFileSync(filePath);
            const json = JSON.parse(data);
            if (json.response && json.response.body) {
                const body = mockSensitiveData(JSON.parse(json.response.body));

                json.response.body = JSON.stringify(body, null);
            }
            fs.writeFileSync(filePath, JSON.stringify(json, null, 4));
        });
    } catch (error) {
        process.stdout.write(`${error}\n`);
        process.stdout.write(`Sensitive data are not removed from recordings\n`);
        process.exit(1);
    }

    process.stdout.write(`Sensitive data were cleared\n`);
})();
