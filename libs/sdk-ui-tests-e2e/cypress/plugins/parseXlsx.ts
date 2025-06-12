// (C) 2023 GoodData Corporation
import * as fs from "fs";

import * as xlsx from "node-xlsx";

export default ((on, _config) => {
    // `on` is used to hook into various events Cypress emits
    on("task", {
        parseXlsx({ filePath }) {
            return new Promise((resolve, reject) => {
                try {
                    const jsonData = xlsx.parse(fs.readFileSync(filePath));
                    resolve(jsonData);
                } catch (e) {
                    reject(e);
                }
            });
        },
    });
}) as Cypress.PluginConfig;
