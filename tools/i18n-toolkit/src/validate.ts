// (C) 2021-2022 GoodData Corporation

import * as path from "path";
import { ToolkitConfigFile } from "./data.js";
import { getLocalizationFiles, getParsedLocalizations, getLocalizationValues } from "./localizations.js";
import { getDefaultLocalesCheck } from "./validations/defaultLocales.js";
import { getStructureCheck } from "./validations/structure.js";
import { getIntlMessageFormatCheck } from "./validations/messageFormat.js";
import { getHtmlSyntaxCheck } from "./validations/htmlSyntax.js";
import { getInsightToReportCheck } from "./validations/insightToReport.js";
import { getUsageMessagesCheck } from "./validations/messagesUsage.js";

export async function validate(cwd: string, opts: ToolkitConfigFile) {
    const { paths = [], insightToReport } = opts;
    const localizationPaths = paths.map((pth) => path.join(cwd, pth));

    const localizations = getParsedLocalizations(await getLocalizationFiles(localizationPaths));
    const localizationValues = getLocalizationValues(localizations);

    await getDefaultLocalesCheck(localizationPaths, localizations, opts.debug);
    await getStructureCheck(localizations, opts.structure || false, opts.debug);
    await getIntlMessageFormatCheck(localizationValues, opts.intl || false, opts.debug);
    await getHtmlSyntaxCheck(localizationValues, opts.html || false, opts.debug);
    await getInsightToReportCheck(localizations, opts.insightToReport || false, opts.debug);

    const { rules, source } = opts;
    await getUsageMessagesCheck(
        cwd,
        localizations,
        opts.usage || false,
        { source, rules, insightToReport },
        opts.debug,
    );
}
