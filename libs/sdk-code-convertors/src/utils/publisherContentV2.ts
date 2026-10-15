// (C) 2026 GoodData Corporation

import { CoreErrorCode, type IErrorContext, newError } from "./errors.js";

/**
 * The one of `pages` and `sections` that document content holds. Both or neither throws. Both keys
 * written counts as both, whatever their values, as the schema reads it; otherwise a key written
 * without a value, which YAML reads as null, counts as missing.
 *
 * @internal
 */
export function pagesOrSectionsV2<Pages, Sections>(
    { pages, sections }: { pages?: Pages | null; sections?: Sections | null },
    errorContext: IErrorContext | undefined,
): { pages: Pages; sections?: never } | { pages?: never; sections: Sections } {
    if (pages !== undefined && sections !== undefined) {
        throw newError(CoreErrorCode.PagesAndSectionsMutuallyExclusive, [], errorContext);
    }
    const hasPages = pages !== null && pages !== undefined;
    const hasSections = sections !== null && sections !== undefined;
    if (hasSections) {
        return { sections };
    }
    if (hasPages) {
        return { pages };
    }
    throw newError(CoreErrorCode.PagesOrSectionsRequired, [], errorContext);
}

/**
 * The error for a layout node whose type the v2 converters do not know.
 *
 * @internal
 */
export function unknownLayoutNodeV2(node: never, errorContext: IErrorContext | undefined): Error {
    // Unreachable for typed input; stored data and YAML are not checked against the node union.
    const { type } = node as { type: unknown };
    return newError(CoreErrorCode.ItemNotSupported, [JSON.stringify({ node: type })], errorContext);
}
