// (C) 2020 GoodData Corporation
import { IUriIdentifierPair } from "@gooddata/api-client-bear";
import compact from "lodash/compact.js";
import includes from "lodash/includes.js";
import isArray from "lodash/isArray.js";
import uniq from "lodash/uniq.js";
import { IDrillableItemsCommandBody } from "@gooddata/sdk-embedding";

const getUriFromPairByIdentifier = (
    identifier: string,
    uriIdentifierPairs: IUriIdentifierPair[],
    excludeUris: string[],
): string | undefined => {
    const resolvedPair = uriIdentifierPairs
        .filter((result) => !includes(excludeUris, result.uri))
        .find((result) => result.identifier === identifier);

    return resolvedPair?.uri;
};

/**
 * @internal
 */
export const sanitizeDrillingActivationPostMessageData = async (
    workspace: string,
    postMessageData: IDrillableItemsCommandBody,
    idToUriConverter: (workspace: string, identifiers: string[]) => Promise<IUriIdentifierPair[]>,
): Promise<IDrillableItemsCommandBody> => {
    const { uris, identifiers, composedFrom } = postMessageData;

    const simpleUris = isArray(uris) ? uris : [];
    const simpleIdentifiers = isArray(identifiers) ? identifiers : [];

    const composedFromUris = composedFrom?.uris && isArray(composedFrom.uris) ? composedFrom.uris : [];

    const composedFromIdentifiers =
        composedFrom?.identifiers && isArray(composedFrom.identifiers) ? composedFrom.identifiers : [];

    const allIdentifiers = uniq([...simpleIdentifiers, ...composedFromIdentifiers]);

    const urisFromIdentifiers: IUriIdentifierPair[] = allIdentifiers.length
        ? await idToUriConverter(workspace, allIdentifiers)
        : [];

    const allUris = uniq([
        ...simpleUris,
        ...compact(
            simpleIdentifiers.map((identifier) =>
                getUriFromPairByIdentifier(identifier, urisFromIdentifiers, simpleUris),
            ),
        ),
    ]);

    const allComposedFromUris = uniq([
        ...composedFromUris,
        ...compact(
            composedFromIdentifiers.map((identifier) =>
                getUriFromPairByIdentifier(identifier, urisFromIdentifiers, composedFromUris),
            ),
        ),
    ]);

    return { uris: allUris, composedFrom: { uris: allComposedFromUris } };
};
