// (C) 2021-2025 GoodData Corporation

import * as path from "path";

import { ToolkitConfigFile } from "./data.js";
import { getLocalizationFiles, getLocalizationValues, getParsedLocalizations } from "./localizations.js";
import { getCommentValidationCheck } from "./validations/commentValidation.js";
import { getDefaultLocalesCheck } from "./validations/defaultLocales.js";
import { getHtmlSyntaxCheck } from "./validations/htmlSyntax.js";
import { getIntlMessageFormatCheck } from "./validations/messageFormat.js";
import { getUsageMessagesCheck } from "./validations/messagesUsage.js";
import { getStructureCheck } from "./validations/structure.js";

export async function validate(cwd: string, opts: ToolkitConfigFile) {
    const { paths = [] } = opts;

    if (Array.isArray(paths) && paths.length === 0) {
        throw new Error("No localization paths provided.");
    }

    const localizationPaths = paths.map((pth) => path.join(cwd, pth));

    const localizations = getParsedLocalizations(await getLocalizationFiles(localizationPaths));
    const localizationValues = getLocalizationValues(localizations);

    await getDefaultLocalesCheck(localizationPaths, localizations, opts.debug);
    await getStructureCheck(localizations, opts.structure || false, opts.debug);
    await getCommentValidationCheck(localizations, opts.comments || false, opts.debug);
    await getIntlMessageFormatCheck(localizationValues, opts.intl || false, opts.debug);
    await getHtmlSyntaxCheck(localizationValues, opts.html || false, opts.debug);

    const { rules, source } = opts;
    await getUsageMessagesCheck(cwd, localizations, opts.usage || false, { source, rules }, opts.debug);
}
