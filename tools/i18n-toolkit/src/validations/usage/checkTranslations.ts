// (C) 2021-2022 GoodData Corporation
import groupBy from "lodash/groupBy.js";
import difference from "lodash/difference.js";
import intersection from "lodash/intersection.js";
import flatten from "lodash/flatten.js";
import uniq from "lodash/uniq.js";

import {
    ToolkitConfigFile,
    ToolkitTranslationRule,
    UsageResult,
    Uncontrolled,
    CheckInsightPipe,
    CheckReportPipe,
    CheckMeasureSuffix,
    CheckMetricSuffix,
} from "../../data.js";
import { LocalesStructure } from "../../schema/localization.js";

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
): { results: UsageResult[]; groups: Record<string, string[]>; uncontrolled: Array<string> } {
    const { groups, ignoredRules, validateRules } = getGroupedRules(rules, extracted);
    const keysInFiles = getTranslationKeysFromFiles(localizations, insightToReport);

    const ignoredResults = getIgnoresResults(keysInFiles, ignoredRules, groups);
    const validResults = getValidResults(keysInFiles, validateRules, groups, ignoredResults);

    return {
        results: [...validResults, ...ignoredResults],
        groups,
        uncontrolled: groups[Uncontrolled] || [],
    };
}

function getValidResults(
    keysInFiles: Array<[string, string[]]>,
    validateRules: ToolkitTranslationRuleData[],
    groups: Record<string, string[]>,
    ignoredResults: UsageResult[],
): UsageResult[] {
    return validateRules.map((translation): UsageResult => {
        const extractedMessages = groups[translation.identifier] || [];

        const translationsFromFiles = getTranslationKeysForDir(keysInFiles, translation);
        const { usedKeys, ignoredKeys } = getFilteredKeys(translationsFromFiles, ignoredResults, translation);

        const ignoredMessages = intersection(ignoredKeys, extractedMessages);
        const missingMessages = difference(extractedMessages, usedKeys);
        const unusedMessages = difference(usedKeys, extractedMessages);

        const files = translationsFromFiles.map(([file]) => file);

        return {
            files,
            identifier: translation.identifier,
            ignore: translation.ignore,
            stats: {
                ignored: ignoredMessages.length,
                extracted: extractedMessages.length,
                loaded: usedKeys.length,
                missing: missingMessages.length,
                unused: unusedMessages.length,
            },
            data: {
                missingMessages,
                unusedMessages,
                ignoredMessages,
            },
        };
    });
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
    const ignoredRules = translationDefinition.filter((def) => def.ignore);
    const validateRules = translationDefinition.filter((def) => !def.ignore);

    return {
        groups,
        ignoredRules,
        validateRules,
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
    ignoredRules: UsageResult[],
    { filterTranslationFile, messageFilter, ignore }: ToolkitTranslationRuleData,
) {
    const keys = keysInFiles.map(([file, values]) => {
        const ignoredValues = ignoredRules
            .filter(({ files }) => files.includes(file))
            .map(({ data }) => data.ignoredMessages);
        const ignored = flatten(ignoredValues);
        return {
            ignored: intersection(ignored, values),
            used: difference(values, ignored),
        };
    });

    const ignoredKeys = uniq(flatten(keys.map(({ ignored }) => ignored)));
    const usedKeys = uniq(flatten(keys.map(({ used }) => used)));

    return {
        usedKeys: filterTranslationFile || ignore ? usedKeys.filter(messageFilter) : usedKeys,
        ignoredKeys,
    };
}

function getIgnoresResults(
    keysInFiles: Array<[string, string[]]>,
    ignoredRules: ToolkitTranslationRuleData[],
    groups: Record<string, string[]>,
): UsageResult[] {
    return ignoredRules.map((translation) => {
        const extractedMessages = groups[translation.identifier] || [];

        const translationsFromFiles = getTranslationKeysForDir(keysInFiles, translation);
        const { usedKeys } = getFilteredKeys(translationsFromFiles, [], translation);

        const files = translationsFromFiles.map(([file]) => file);

        return {
            files,
            identifier: translation.identifier,
            ignore: true,
            stats: {
                extracted: extractedMessages.length,
                loaded: usedKeys.length,
                ignored: usedKeys.length,
                missing: 0,
                unused: 0,
            },
            data: {
                missingMessages: [],
                unusedMessages: [],
                ignoredMessages: usedKeys,
            },
        };
    });
}
