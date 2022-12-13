#!/usr/bin/env node
// (C) 2021 GoodData Corporation

import fs from "fs";
import path from "path";

export const getAllFiles = function (dirPath, specFilesFilter, arrayOfFiles) {
    let files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];
    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, specFilesFilter, arrayOfFiles);
        } else if (specFilesFilter === undefined || specFilesFilter.includes(path.basename(file))) {
            arrayOfFiles.push(dirPath + "/" + file);
        }
    });

    return arrayOfFiles.filter((file) => file.includes(".spec.ts"));
};
