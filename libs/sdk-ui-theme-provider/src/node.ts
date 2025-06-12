// (C) 2024 GoodData Corporation
import { validateCss } from "./variablesSpec/validate/main.js";
import { generateDefaultScssThemeContent } from "./variablesSpec/generate/generateDefaultScssThemeContent.js";
import { generateDefaultTypeScriptThemeContent } from "./variablesSpec/generate/generateDefaultTypeScriptThemeContent.js";
import { logInfo, logSuccess, logError } from "./variablesSpec/validate/log.js";
import { sync } from "glob";
import fs from "fs";

/**
 * @internal
 */
export function validateThemingInCssFolder(folderToValidate: string) {
    const allCssFiles = sync(`${folderToValidate}/**/*.css`);

    for (const filePath of allCssFiles) {
        validateThemingInCssFile(filePath);
    }
}

/**
 * @internal
 */
export function validateThemingInCssFile(filePath: string) {
    const fileContent = fs.readFileSync(filePath, "utf8");
    validateCss(filePath, fileContent);
}

/**
 * @internal
 */
export function generateDefaultScssThemeFile(scssFileToGenerate: string) {
    logInfo(`Generating default theme scss to ${scssFileToGenerate}`);
    try {
        const content = generateDefaultScssThemeContent();
        fs.writeFileSync(scssFileToGenerate, content);
        logSuccess(`Default theme scss successfully generated.`);
    } catch (error) {
        logError(`Error generating default theme scss to ${scssFileToGenerate}: ${error}`);
    }
}

/**
 * @internal
 */
export function generateDefaultTypeScriptThemeFile(tsFileToGenerate: string) {
    logInfo(`Generating default theme to ${tsFileToGenerate}`);
    try {
        const content = generateDefaultTypeScriptThemeContent();
        fs.writeFileSync(tsFileToGenerate, content);
        logSuccess(`Default theme successfully generated.`);
    } catch (error) {
        logError(`Error generating default theme to ${tsFileToGenerate}: ${error}`);
    }
}
