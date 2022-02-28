// (C) 2007-2022 GoodData Corporation

/**
 * Given an object containing the parsed translation bundle, this function creates a new object which contains
 * only key → value mapping between translation key and the actual value.
 *
 * @param translationsWithMetadata - parsed translation bundle
 * @internal
 */
export function removeMetadata(translationsWithMetadata: Record<string, any>): Record<string, string> {
    const translations = {};
    Object.keys(translationsWithMetadata).forEach((key) => {
        translations[key] =
            typeof translationsWithMetadata[key] === "object"
                ? translationsWithMetadata[key].value
                : translationsWithMetadata[key];
    });
    return translations;
}

/**
 * Handles difference between GD locale and moment.js locale identifiers
 *
 * @param intlLocale - locale identifier
 * @internal
 */
export const sanitizeLocaleForMoment = (intlLocale: string): string => {
    if (intlLocale === "zh-Hans") {
        return "zh-CN";
    }
    return intlLocale;
};
