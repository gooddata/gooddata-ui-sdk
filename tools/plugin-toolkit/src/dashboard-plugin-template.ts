// (C) 2021 GoodData Corporation
import { TargetAppFlavor } from "./_base/types";
import * as path from "path";

/*
 * This file is intentionally named and located in the root to reflect the location of the archives
 * that contain the template project.
 */

export function getDashboardPluginTemplateArchive(flavor: TargetAppFlavor): string {
    return path.join(__dirname, `dashboard-plugin-template.${flavor}.tgz`);
}
