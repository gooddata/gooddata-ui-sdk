#!/usr/bin/env node
// (C) 2021 GoodData Corporation

import fs from "fs";
import path from "path";

export const getFilterSpecFiles = function (dirPath, specFilesFilter) {
    let files = fs.readdirSync(dirPath);
    let arrayOfFiles = [];
    files.forEach(function (file) {
        let stat = fs.statSync(dirPath + "/" + file);
        if (stat.isDirectory()) {
            arrayOfFiles = arrayOfFiles.concat(getFilterSpecFiles(dirPath + "/" + file, specFilesFilter));
        }
        if (stat.isFile && (specFilesFilter === "" || specFilesFilter.includes(path.basename(file)))) {
            arrayOfFiles.push(dirPath + "/" + file);
        }
    });

    return arrayOfFiles.filter((file) => file.includes(".spec.ts"));
};

export const findSpecFilePaths = function (testDirPath, testFileName) {
    let files = fs.readdirSync(testDirPath);
    let results = [];
    files.forEach(function (file) {
        let stat = fs.statSync(testDirPath + "/" + file);
        if (stat.isDirectory()) {
            results = results.concat(findSpecFilePaths(testDirPath + "/" + file, testFileName));
        }
        if (stat.isFile && file === testFileName) {
            results.push(testDirPath + "/" + file);
        }
    });
    return results;
};
