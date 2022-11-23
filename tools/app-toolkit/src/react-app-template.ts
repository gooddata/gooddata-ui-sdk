// (C) 2021-2022 GoodData Corporation
import { TargetAppLanguage } from "./_base/types";
import * as path from "path";

/*
 * This file is intentionally named and located in the root to reflect the location of the archives
 * that contain the template project.
 */

export function getReactAppTemplateArchive(language: TargetAppLanguage): string {
    return path.join(__dirname, `react-app-template.${language}.tgz`);
}
