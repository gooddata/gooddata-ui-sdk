// (C) 2023-2025 GoodData Corporation

import * as fs from "fs";

import * as xlsx from "node-xlsx";

export const parseXlsx = (on: Cypress.PluginEvents) => {
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
};
