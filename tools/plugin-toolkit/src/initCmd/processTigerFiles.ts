// (C) 2020-2021 GoodData Corporation
import fse from "fs-extra";
import fg from "fast-glob";
import { safeJoin } from "../_base/utils.js";

/**
 * If isTigerBackend is true, replaces the original file by the tiger version,
 * otherwise, removes the tiger version.
 *
 * @param tigerVersion - path to the tiger version of the file
 * @param isTigerBackend - flag indicating if the backend to use is tiger
 */
async function processTigerFile(tigerVersion: string, isTigerBackend: boolean) {
    if (isTigerBackend) {
        const originalVersion = tigerVersion.replace(/--tiger(\..+)$/, "$1");
        await fse.remove(originalVersion);
        await fse.rename(tigerVersion, originalVersion);
    } else {
        await fse.remove(tigerVersion);
    }
}

/**
 * Goes through the bootstrapped application and handles tiger specific files:
 * deleting them if not on tiger, or using them instead of the originals instead.
 * The tiger-specific versions of files are identified by the "--tiger" name suffix,
 * for example Welcome--tiger.tsx is a tiger version of Welcome.tsx.
 *
 * @param initialPath - path where to start looking for tiger files
 * @param isTigerBackend - flag indicating if the backend to use is tiger
 */
export async function processTigerFiles(initialPath: string, isTigerBackend: boolean) {
    // The initial path on windows will contain backslash. Globby does not work with those and
    // will find no tiger files on windows. Using normal slashes for globby and then node fs calls
    // is no problem on windows.
    const pattern = safeJoin(initialPath, "./**/*--tiger.*");
    const tigerFiles = await fg(pattern, {
        followSymbolicLinks: false,
    });

    return Promise.all(tigerFiles.map((file) => processTigerFile(file, isTigerBackend)));
}
