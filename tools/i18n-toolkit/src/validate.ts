// (C) 2021-2022 GoodData Corporation

import * as path from "path";
import { ToolkitConfigFile } from "./data";
import { getLocalizationFiles, getParsedLocalizations, getLocalizationValues } from "./localizations";
import { getDefaultLocalesCheck } from "./validations/defaultLocales";
import { getStructureCheck } from "./validations/structure";
import { getIntlMessageFormatCheck } from "./validations/messageFormat";
import { getHtmlSyntaxCheck } from "./validations/htmlSyntax";
import { getInsightToReportCheck } from "./validations/insightToReport";
import { getUsageMessagesCheck } from "./validations/messagesUsage";

export async function validate(cwd: string, opts: ToolkitConfigFile) {
    const localizationPaths = (opts.paths || []).map((pth) => path.join(cwd, pth));

    const localizations = getParsedLocalizations(await getLocalizationFiles(localizationPaths));
    const localizationValues = getLocalizationValues(localizations);

    await getDefaultLocalesCheck(localizationPaths, localizations, opts.debug);
    await getStructureCheck(localizations, opts.structure || false, opts.debug);
    await getIntlMessageFormatCheck(localizationValues, opts.intl || false, opts.debug);
    await getHtmlSyntaxCheck(localizationValues, opts.html || false, opts.debug);
    await getInsightToReportCheck(localizations, opts.insightToReport || false, opts.debug);

    const { rules, source } = opts;
    await getUsageMessagesCheck(cwd, localizations, opts.usage || false, { source, rules }, opts.debug);
}
