// (C) 2019 GoodData Corporation
import * as HeaderPredicateFactory from "../../base/headerMatching/HeaderPredicateFactory";
import { IHeaderPredicate } from "../../base/headerMatching/HeaderPredicate";
import isArray = require("lodash/isArray");
import uniq = require("lodash/uniq");

/**
 * @public
 */
export interface ISimplePostMessageData {
    /**
     * URI of attribute or measure that should be drillable.
     */
    uris?: string[];

    /**
     * Identifier of attribute or measure that should be drillable.
     */
    identifiers?: string[];
}

/**
 * @public
 */
export interface IPostMessageData extends ISimplePostMessageData {
    /**
     * Optionally specifies drilling on measures that are composed from other measures - by listing uris or
     * identifiers of components.
     */
    composedFrom?: ISimplePostMessageData;
}

function isPostMessageData(item: IPostMessageData): item is IPostMessageData {
    return (item as IPostMessageData).composedFrom !== undefined;
}

/**
 * Converts post message with drilling specification into header predicates. Given the message with
 * uris, identifiers and composedFrom uris and identifiers, this function will create instances of
 * uriMatch(), identifierMatch(), composedFromUri(), composedFromIdentifier() predicates.
 *
 * @param postMessageData - input received via post message
 * @internal
 */
export async function convertPostMessageToDrillablePredicates(
    postMessageData: IPostMessageData,
): Promise<IHeaderPredicate[]> {
    const { uris, identifiers, composedFrom } = postMessageData;

    const simpleUris = isArray(uris) ? uniq(uris) : [];
    const simpleIdentifiers = isArray(identifiers) ? uniq(identifiers) : [];

    const composedFromUris =
        isPostMessageData(postMessageData) && isArray(composedFrom.uris) ? uniq(composedFrom.uris) : [];

    const composedFromIdentifiers =
        isPostMessageData(postMessageData) && isArray(composedFrom.identifiers)
            ? uniq(composedFrom.identifiers)
            : [];

    // note: not passing factory function to maps to make testing assertions simpler (passing factory fun-as-is
    //  will call the factory with 3 args (value, index and all values)

    return [
        ...simpleUris.map(uri => HeaderPredicateFactory.uriMatch(uri)),
        ...simpleIdentifiers.map(identifier => HeaderPredicateFactory.identifierMatch(identifier)),
        ...composedFromUris.map(uri => HeaderPredicateFactory.composedFromUri(uri)),
        ...composedFromIdentifiers.map(identifier =>
            HeaderPredicateFactory.composedFromIdentifier(identifier),
        ),
    ];
}
