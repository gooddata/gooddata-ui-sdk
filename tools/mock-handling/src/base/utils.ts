// (C) 2007-2020 GoodData Corporation
import * as fs from "fs";
import * as path from "path";

/**
 * Recursively searches root directory for files that exactly match the provided file name.
 *
 * @param rootDir - root from where to search
 * @param file - file to find
 *
 * @returns full paths to located files (including rootDir)
 */
export function findFiles(rootDir: string, file: string): string[] {
    const entries = fs.readdirSync(rootDir, { withFileTypes: true, encoding: "utf-8" });
    const files = [];

    for (const entry of entries) {
        const fullPath = path.join(rootDir, entry.name);

        if (entry.isDirectory()) {
            files.push(...findFiles(fullPath, file));
        } else if (entry.isFile() && entry.name === file) {
            files.push(fullPath);
        }
    }

    return files;
}
