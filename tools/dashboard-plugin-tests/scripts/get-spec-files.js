#!/usr/bin/env node
// (C) 2021 GoodData Corporation

const fs = require("fs");

const getAllFiles = function (dirPath, arrayOfFiles) {
    let files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(file);
        }
    });

    return arrayOfFiles.filter((file) => file.includes(".spec.ts"));
};

module.exports = {
    getAllFiles,
};
