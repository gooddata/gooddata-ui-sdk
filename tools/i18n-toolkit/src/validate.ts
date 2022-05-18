// (C) 2021-2022 GoodData Corporation

import * as path from "path";
import { ToolkitOptions } from "./data";
import { getLocalizationFiles, getParsedLocalizations, getLocalizationValues } from "./localizations";
import { getStructureCheck } from "./validations/structure";
import { getIntlMessageFormatCheck } from "./validations/messageFormat";
import { getHtmlSyntaxCheck } from "./validations/htmlSyntax";
import { getInsightToReportCheck } from "./validations/insightToReport";

export async function validate(opts: ToolkitOptions) {
    const localizationPath = path.join(process.cwd(), opts.path);

    const localizations = getParsedLocalizations(await getLocalizationFiles(localizationPath));
    const localizationValues = getLocalizationValues(localizations);

    await getStructureCheck(localizations, opts.structure || false, opts.debug);
    await getIntlMessageFormatCheck(localizationValues, opts.intl || false, opts.debug);
    await getHtmlSyntaxCheck(localizationValues, opts.html || false, opts.debug);
    await getInsightToReportCheck(localizationPath, opts.insightToReport || false, opts.debug);
}
