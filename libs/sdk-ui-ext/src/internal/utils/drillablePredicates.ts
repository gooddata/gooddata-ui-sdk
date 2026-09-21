// (C) 2019-2026 GoodData Corporation

import { uniq, uniqBy } from "lodash-es";

import {
    type IDrillableItemsCommandBody,
    type IObjIdentifierQualifier,
    type ISimpleDrillableItemsCommandBody,
} from "@gooddata/sdk-embedding";
import { HeaderPredicates, type IHeaderPredicate } from "@gooddata/sdk-ui";

type DrillableIdentifier = NonNullable<ISimpleDrillableItemsCommandBody["identifiers"]>[number];

const toQualifier = (identifier: DrillableIdentifier): IObjIdentifierQualifier =>
    typeof identifier === "string" ? { identifier } : identifier;

/**
 * An untyped entry stays distinct from the same identifier typed, and two types of one identifier stay
 * distinct from each other, because each activates drilling on a different object.
 */
const uniqueQualifiers = (identifiers: DrillableIdentifier[] | undefined): IObjIdentifierQualifier[] =>
    Array.isArray(identifiers)
        ? uniqBy(identifiers.map(toQualifier), ({ identifier, type }) => `${type ?? ""}.${identifier}`)
        : [];

/**
 * Converts post message with drilling specification into header predicates. Given the message with
 * uris, identifiers and composedFrom uris and identifiers, this function will create instances of
 * uriMatch(), identifierMatch(), composedFromUri(), composedFromIdentifier() predicates.
 *
 * An identifier may come as a bare string, matching any object of that identifier, or as a qualifier
 * naming the object type as well, which the matched object then has to carry too.
 *
 * @param postMessageData - input received via post message
 * @internal
 */
export function convertPostMessageToDrillablePredicates({
    uris,
    identifiers,
    composedFrom,
}: IDrillableItemsCommandBody): IHeaderPredicate[] {
    const simpleUris = Array.isArray(uris) ? uniq(uris) : [];
    const simpleIdentifiers = uniqueQualifiers(identifiers);

    const composedFromUris =
        composedFrom?.uris && Array.isArray(composedFrom.uris) ? uniq(composedFrom.uris) : [];

    const composedFromIdentifiers = uniqueQualifiers(composedFrom?.identifiers);

    // note: not passing factory function to maps to make testing assertions simpler (passing factory fun-as-is
    //  will call the factory with 3 args (value, index and all values)

    return [
        ...simpleUris.map((uri) => HeaderPredicates.uriMatch(uri)),
        ...simpleIdentifiers.map(({ identifier, type }) =>
            HeaderPredicates.identifierMatch(identifier, type),
        ),
        ...composedFromUris.map((uri) => HeaderPredicates.composedFromUri(uri)),
        ...composedFromIdentifiers.map(({ identifier, type }) =>
            HeaderPredicates.composedFromIdentifier(identifier, type),
        ),
    ];
}

export const DrillablePredicatesUtils = {
    convertPostMessageToDrillablePredicates,
};
