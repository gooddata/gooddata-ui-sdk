// (C) 2021 GoodData Corporation
import { TargetAppLanguage } from "./_base/types.js";
import { fileURLToPath } from "url";
import * as path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
 * This file is intentionally named and located in the root to reflect the location of the archives
 * that contain the template project.
 */

export function getDashboardPluginTemplateArchive(language: TargetAppLanguage): string {
    return path.join(__dirname, `dashboard-plugin-template.${language}.tgz`);
}
