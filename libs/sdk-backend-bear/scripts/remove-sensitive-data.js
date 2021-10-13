#!/usr/bin/env node
// (C) 2021 GoodData Corporation

const { execSync } = require("child_process");
const fs = require("fs");

function mockSensitiveData(accountSetting) {
    const modifiedAccountSetting = { ...accountSetting };
    modifiedAccountSetting.firstName = "First";
    modifiedAccountSetting.lastName = "Last";
    modifiedAccountSetting.email = "first.last@gooddata.com";
    modifiedAccountSetting.login = "first.last@gooddata.com";
    modifiedAccountSetting.phoneNumber = "000000000";
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
        const stdout = execSync(`ls ${mappingsPath}/gdc_account_profile*`).toString();
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
                const body = JSON.parse(json.response.body);

                if (body.accountSetting) {
                    body.accountSetting = mockSensitiveData(body.accountSetting);
                }

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
