// (C) 2021-2022 GoodData Corporation
import groupBy from "lodash/groupBy";
import difference from "lodash/difference";
import flatten from "lodash/flatten";

import {
    ToolkitConfigFile,
    ToolkitTranslationRule,
    UsageResult,
    Uncontrolled,
    CheckInsightPipe,
    CheckReportPipe,
    CheckMeasureSuffix,
    CheckMetricSuffix,
} from "../../data";
import { LocalesStructure } from "../../schema/localization";

type ToolkitTranslationRuleData = ToolkitTranslationRule & {
    messageFilter: (item: any) => boolean;
    dirFilter: (item: any) => boolean;
    identifier: string;
};

export function checkTranslations(
    localizations: Array<[string, LocalesStructure]>,
    rules: ToolkitConfigFile["rules"],
    extracted: Record<string, any>,
    { insightToReport }: { insightToReport?: boolean },
) {
    const { groups, translationDefinition } = getGroupedRules(rules, extracted);
    const keysInFiles = getTranslationKeysFromFiles(localizations, insightToReport);

    const results = translationDefinition.map((translation): UsageResult => {
        const extractedMessages = groups[translation.identifier] || [];

        const translationsFromFiles = getTranslationKeysForDir(keysInFiles, translation);
        const translationKeys = getFilteredKeys(translationsFromFiles, translation);

        const missingMessages = translation.ignore ? [] : difference(extractedMessages, translationKeys);
        const unusedMessages = translation.ignore ? [] : difference(translationKeys, extractedMessages);

        const files = translationsFromFiles.map(([file]) => file);

        return {
            files,
            identifier: translation.identifier,
            ignore: translation.ignore,
            stats: {
                extracted: extractedMessages.length,
                loaded: translationKeys.length,
                missing: missingMessages.length,
                unused: unusedMessages.length,
            },
            data: {
                missingMessages,
                unusedMessages,
            },
        };
    });

    return { results, groups, uncontrolled: groups[Uncontrolled] || [] };
}

function getGroupedRules(rules: ToolkitConfigFile["rules"], extracted: Record<string, any>) {
    const allExtractedMessages = Object.keys(extracted);
    const translationDefinition: Array<ToolkitTranslationRuleData> = rules.map(
        (rule: ToolkitTranslationRule) => ({
            ...rule,
            messageFilter: patternsAsFunction(rule.pattern),
            dirFilter: patternsAsFunction(rule.dir),
            identifier: rule.pattern.toString(),
        }),
    );

    const groups = groupBy(allExtractedMessages, getIdentifierByPatternFilter(translationDefinition));

    return {
        groups,
        translationDefinition,
    };
}

function getIdentifierByPatternFilter(translationDefinition: ToolkitTranslationRuleData[]) {
    return (messageId: string) => {
        const def = translationDefinition.find((d) => d.messageFilter(messageId));
        if (def) {
            return def.identifier;
        } else {
            return Uncontrolled;
        }
    };
}

function patternsAsFunction(pattern: RegExp | RegExp[] | undefined) {
    return Array.isArray(pattern)
        ? (message: string) => pattern.some((pattern) => pattern.test(message))
        : (message: string) => (pattern ? pattern.test(message) : true);
}

function getTranslationKeysFromFiles(
    localizations: Array<[string, LocalesStructure]>,
    insightToReport = false,
): Array<[string, string[]]> {
    return localizations.map(([fileName, content]) => {
        let keys = Object.keys(content);

        //is insight to report is enabled, remove piped locales keys
        if (insightToReport) {
            keys = keys.map((key) => {
                return key.replace(CheckInsightPipe, "").replace(CheckReportPipe, "");
            });
        }
        //remove metric and measure suffix
        keys = keys.map((key) => {
            return key.replace(CheckMeasureSuffix, "").replace(CheckMetricSuffix, "");
        });
        return [fileName, keys];
    });
}

function getTranslationKeysForDir(
    keysInFiles: Array<[string, string[]]>,
    { dirFilter }: ToolkitTranslationRuleData,
) {
    return keysInFiles.filter(([name]) => dirFilter(name));
}

function getFilteredKeys(
    keysInFiles: Array<[string, string[]]>,
    { filterTranslationFile, messageFilter }: ToolkitTranslationRuleData,
) {
    const keys = flatten(keysInFiles.map(([, values]) => values));
    return filterTranslationFile ? keys.filter(messageFilter) : keys;
}
