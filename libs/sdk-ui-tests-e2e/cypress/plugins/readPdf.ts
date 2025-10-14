// (C) 2022-2025 GoodData Corporation

import * as fs from "fs";
import { createRequire } from "module";
import * as path from "path";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

export default (on: Cypress.PluginEvents) => {
    on("task", {
        readPdf({ filePath }) {
            return new Promise((resolve) => {
                const resolvedPath = path.resolve(filePath);
                const dataBuffer = fs.readFileSync(resolvedPath);
                pdf(dataBuffer).then(function (text: string) {
                    resolve(text);
                });
            });
        },
    });
};
