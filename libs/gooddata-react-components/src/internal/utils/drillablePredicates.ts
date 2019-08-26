// (C) 2019 GoodData Corporation
import sdk from "@gooddata/gooddata-js";
import uniq = require("lodash/uniq");
import includes = require("lodash/includes");
import isArray = require("lodash/isArray");
import { IHeaderPredicate } from "../../interfaces/HeaderPredicate";
import * as HeaderPredicateFactory from "../../factory/HeaderPredicateFactory";

export interface ISimplePostMessageData {
    uris?: string[];
    identifiers?: string[];
}

export interface IPostMessageData extends ISimplePostMessageData {
    composedFrom?: ISimplePostMessageData;
}

export interface IUriIdentifierPair {
    uri: string;
    identifier: string;
}

function isPostMessageData(item: IPostMessageData): item is IPostMessageData {
    return (item as IPostMessageData).composedFrom !== undefined;
}

function getUriFromPairByIdentifier(
    identifier: string,
    uriIdentifierPairs: IUriIdentifierPair[],
    excludeUris: string[],
): string {
    const resolvedPair = uriIdentifierPairs
        .filter(result => !includes(excludeUris, result.uri))
        .find(result => result.identifier === identifier);

    if (resolvedPair) {
        return resolvedPair.uri;
    }

    return null;
}

export async function convertPostMessageToDrillablePredicates(
    projectId: string,
    postMessageData: IPostMessageData,
): Promise<IHeaderPredicate[]> {
    const { uris, identifiers, composedFrom } = postMessageData;

    const simpleUris = isArray(uris) ? uris : [];
    const simpleIdentifiers = isArray(identifiers) ? identifiers : [];

    const composedFromUris =
        isPostMessageData(postMessageData) && isArray(composedFrom.uris) ? composedFrom.uris : [];

    const composedFromIdentifiers =
        isPostMessageData(postMessageData) && isArray(composedFrom.identifiers)
            ? composedFrom.identifiers
            : [];

    const allIdentifiers = uniq([...simpleIdentifiers, ...composedFromIdentifiers]);

    const urisFromIdentifiers: IUriIdentifierPair[] = await sdk.md.getUrisFromIdentifiers(
        projectId,
        allIdentifiers,
    );

    const allUris = [
        ...simpleUris,
        ...simpleIdentifiers
            .map(identifier => getUriFromPairByIdentifier(identifier, urisFromIdentifiers, simpleUris))
            .filter(uri => uri),
    ];

    const allComposedFromUris = [
        ...composedFromUris,
        ...composedFromIdentifiers
            .map(identifier => getUriFromPairByIdentifier(identifier, urisFromIdentifiers, composedFromUris))
            .filter(uri => uri),
    ];

    const uniqUriPredicates = uniq(allUris).map(uri => HeaderPredicateFactory.uriMatch(uri));

    const uniqComposedFromUriPredicates = uniq(allComposedFromUris).map(uri =>
        HeaderPredicateFactory.composedFromUri(uri),
    );

    return [...uniqUriPredicates, ...uniqComposedFromUriPredicates];
}
