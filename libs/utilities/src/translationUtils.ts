// (C) 2007-2020 GoodData Corporation

/**
 * Given an object containing the parsed translation bundle, this function creates a new object which contains
 * only key -> value mapping between translation key and the actual value.
 *
 * @param translationsWithMetadata - parsed translation bundle
 * @internal
 */
export function removeMetadata(translationsWithMetadata: object): object {
    const translations = {};
    Object.keys(translationsWithMetadata).forEach((key) => {
        translations[key] =
            typeof translationsWithMetadata[key] === "object"
                ? translationsWithMetadata[key].value
                : translationsWithMetadata[key];
    });
    return translations;
}
