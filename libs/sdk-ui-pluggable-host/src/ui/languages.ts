// (C) 2026 GoodData Corporation

import { type ILocale, LANGUAGE_NAMES, isLocale } from "@gooddata/sdk-model";
import { matchesSearchQuery } from "@gooddata/sdk-ui-kit";

/**
 * A language of the user's own, or "default" for the one of the workspace or organization.
 *
 * @internal
 */
export type LanguageChoice = ILocale | "default";

/**
 * The interface languages, in the order the list shows them.
 *
 * @internal
 */
export const LANGUAGES: ILocale[] = Object.keys(LANGUAGE_NAMES).filter(isLocale);

/**
 * Whether the search query matches the language by its own name, its English name or its code ("korean", "한국어"
 * and "ko-KR" all find 한국어).
 */
export function matchesLanguage(language: ILocale, query: string): boolean {
    const { nativeName, englishName } = LANGUAGE_NAMES[language];

    return [nativeName, englishName, language].some((text) => matchesSearchQuery(text, query));
}
