// (C) 2007-2022 GoodData Corporation

import fs from "fs/promises";
import path from "path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const TRANSLATIONS_DIR = path.join(__dirname, "../", "src/internal/translations");

async function convertJsonToTS() {
    const translationFiles = await fs.readdir(TRANSLATIONS_DIR);

    for (const translationFile of translationFiles) {
        if (translationFile.endsWith(".json")) {
            const jsonPath = path.resolve(TRANSLATIONS_DIR, translationFile);
            const tsPath = path.resolve(TRANSLATIONS_DIR, translationFile.replace(".json", ".ts"));

            const jsonData = await fs.readFile(jsonPath, "utf-8");
            let tsData =
                "// (C) 2023 GoodData Corporation\n// DO NOT CHANGE THIS FILE, IT IS RE-GENERATED ON EVERY BUILD\nexport default " +
                JSON.stringify(JSON.parse(jsonData), null, 2);

            await fs.writeFile(tsPath, tsData);
        }
    }
}

convertJsonToTS();
