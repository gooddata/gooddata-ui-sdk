// (C) 2022-2023 GoodData Corporation

import * as fs from "fs";
import * as path from "path";

import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

export default ((on, _config) => {
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
}) as Cypress.PluginConfig;
