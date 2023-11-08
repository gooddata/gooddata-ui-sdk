// (C) 2007-2022 GoodData Corporation

import fs from "fs/promises";
import path from "path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const BUNDLES_DIR = path.join(__dirname, "../", "src/base/localization/bundles");

async function convertJsonToTS() {
    const bundleFiles = await fs.readdir(BUNDLES_DIR);

    for (const bundleFile of bundleFiles) {
        if (bundleFile.endsWith(".json")) {
            const jsonPath = path.resolve(BUNDLES_DIR, bundleFile);
            const tsPath = path.resolve(BUNDLES_DIR, bundleFile.replace(".json", ".ts"));

            const jsonData = await fs.readFile(jsonPath, "utf-8");
            let tsData =
                "// (C) 2023 GoodData Corporation\n// DO NOT CHANGE THIS FILE, IT IS RE-GENERATED ON EVERY BUILD\nexport default " +
                JSON.stringify(JSON.parse(jsonData), null, 2);

            await fs.writeFile(tsPath, tsData);
        }
    }
}

convertJsonToTS();
