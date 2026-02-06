// (C) 2026 GoodData Corporation

import fs from "fs";
import packageData from "../package.json" assert { type: "json" };

const packageJsonPath = "./package.json";

function updateDependencies(dependencies) {
    return Object.fromEntries(
        Object.entries(dependencies).map(([key, value]) => {
            if (value === "workspace:*") {
                return [key, `${packageData.version}`];
            }
            return [key, value];
        }),
    );
}

const updatedDependencies = updateDependencies(packageData.dependencies);
const updatedDevDependencies = updateDependencies(packageData.devDependencies);

packageData.dependencies = updatedDependencies;
packageData.devDependencies = updatedDevDependencies;

await fs.promises.writeFile(packageJsonPath, JSON.stringify(packageData, null, 2));

console.log("Updated package.json with version:", packageData.version);
