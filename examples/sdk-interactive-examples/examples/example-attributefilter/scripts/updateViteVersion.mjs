// (C) 2026 GoodData Corporation

import fs from "fs";

import packageData from "../package.json" assert { type: "json" };

const packageJsonPath = "./package.json";

delete packageData.devDependencies.rolldown;
packageData.devDependencies.vite = "^7.3.1";

await fs.promises.writeFile(packageJsonPath, JSON.stringify(packageData, null, 2));

console.log("Updated package.json with vite ^7.3.1");
