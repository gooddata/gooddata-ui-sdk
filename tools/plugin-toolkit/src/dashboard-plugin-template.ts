// (C) 2021-2025 GoodData Corporation
import * as path from "path";
import { fileURLToPath } from "url";

import { TargetAppLanguage } from "./_base/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
 * This file is intentionally named and located in the root to reflect the location of the archives
 * that contain the template project.
 */

export function getDashboardPluginTemplateArchive(language: TargetAppLanguage): string {
    return path.join(__dirname, `dashboard-plugin-template.${language}.tgz`);
}
