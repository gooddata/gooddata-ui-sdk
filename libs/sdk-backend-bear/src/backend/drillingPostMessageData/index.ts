// (C) 2020 GoodData Corporation
import { IUriIdentifierPair } from "@gooddata/gd-bear-client/lib/metadata";
import { IPostMessageData, isPostMessageData } from "@gooddata/sdk-model";
import compact = require("lodash/compact");
import includes = require("lodash/includes");
import isArray = require("lodash/isArray");
import uniq = require("lodash/uniq");

const getUriFromPairByIdentifier = (
    identifier: string,
    uriIdentifierPairs: IUriIdentifierPair[],
    excludeUris: string[],
): string | undefined => {
    const resolvedPair = uriIdentifierPairs
        .filter(result => !includes(excludeUris, result.uri))
        .find(result => result.identifier === identifier);

    return resolvedPair?.uri;
};

/**
 * @internal
 */
export const sanitizeDrillingPostMessageData = async (
    workspace: string,
    postMessageData: IPostMessageData,
    idToUriConverter: (workspace: string, identifiers: string[]) => Promise<IUriIdentifierPair[]>,
): Promise<IPostMessageData> => {
    const { uris, identifiers, composedFrom } = postMessageData;

    const simpleUris = isArray(uris) ? uris : [];
    const simpleIdentifiers = isArray(identifiers) ? identifiers : [];

    const composedFromUris =
        isPostMessageData(postMessageData) && isArray(composedFrom!.uris) ? composedFrom!.uris : [];

    const composedFromIdentifiers =
        isPostMessageData(postMessageData) && isArray(composedFrom!.identifiers)
            ? composedFrom!.identifiers
            : [];

    const allIdentifiers = uniq([...simpleIdentifiers, ...composedFromIdentifiers]);

    const urisFromIdentifiers: IUriIdentifierPair[] = allIdentifiers.length
        ? await idToUriConverter(workspace, allIdentifiers)
        : [];

    const allUris = uniq([
        ...simpleUris,
        ...compact(
            simpleIdentifiers.map(identifier =>
                getUriFromPairByIdentifier(identifier, urisFromIdentifiers, simpleUris),
            ),
        ),
    ]);

    const allComposedFromUris = uniq([
        ...composedFromUris,
        ...compact(
            composedFromIdentifiers.map(identifier =>
                getUriFromPairByIdentifier(identifier, urisFromIdentifiers, composedFromUris),
            ),
        ),
    ]);

    return { uris: allUris, composedFrom: { uris: allComposedFromUris } };
};
