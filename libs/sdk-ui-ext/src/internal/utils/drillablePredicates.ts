// (C) 2019-2020 GoodData Corporation
import { IHeaderPredicate, HeaderPredicates } from "@gooddata/sdk-ui";
import isArray from "lodash/isArray.js";
import uniq from "lodash/uniq.js";
import { IDrillableItemsCommandBody } from "@gooddata/sdk-embedding";

/**
 * Converts post message with drilling specification into header predicates. Given the message with
 * uris, identifiers and composedFrom uris and identifiers, this function will create instances of
 * uriMatch(), identifierMatch(), composedFromUri(), composedFromIdentifier() predicates.
 *
 * @param postMessageData - input received via post message
 * @internal
 */
export async function convertPostMessageToDrillablePredicates(
    postMessageData: IDrillableItemsCommandBody,
): Promise<IHeaderPredicate[]> {
    const { uris, identifiers, composedFrom } = postMessageData;

    const simpleUris = isArray(uris) ? uniq(uris) : [];
    const simpleIdentifiers = isArray(identifiers) ? uniq(identifiers) : [];

    const composedFromUris = composedFrom?.uris && isArray(composedFrom.uris) ? uniq(composedFrom.uris) : [];

    const composedFromIdentifiers =
        composedFrom?.identifiers && isArray(composedFrom.identifiers) ? uniq(composedFrom.identifiers) : [];

    // note: not passing factory function to maps to make testing assertions simpler (passing factory fun-as-is
    //  will call the factory with 3 args (value, index and all values)

    return [
        ...simpleUris.map((uri) => HeaderPredicates.uriMatch(uri)),
        ...simpleIdentifiers.map((identifier) => HeaderPredicates.identifierMatch(identifier)),
        ...composedFromUris.map((uri) => HeaderPredicates.composedFromUri(uri)),
        ...composedFromIdentifiers.map((identifier) => HeaderPredicates.composedFromIdentifier(identifier)),
    ];
}
