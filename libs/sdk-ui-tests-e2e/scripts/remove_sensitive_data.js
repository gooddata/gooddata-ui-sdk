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

(function removeSensitiveData() {
    try {
        const accountProfileFiles = execSync("ls ./recordings/mappings/gdc_account_profile*").toString();
        const accountBootstrapFiles = execSync(
            "ls ./recordings/mappings/gdc_app_account_bootstrap*",
        ).toString();
        if (!accountProfileFiles || !accountBootstrapFiles) {
            process.exit(0);
        }
        const files = [...accountProfileFiles.split("\n"), ...accountBootstrapFiles.split("\n")];
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

                if (body.bootstrapResource && body.bootstrapResource.accountSetting) {
                    body.bootstrapResource.accountSetting = mockSensitiveData(
                        body.bootstrapResource.accountSetting,
                    );
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
