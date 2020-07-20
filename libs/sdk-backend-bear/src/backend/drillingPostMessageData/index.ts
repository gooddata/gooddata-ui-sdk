// (C) 2020 GoodData Corporation
import { IUriIdentifierPair } from "@gooddata/api-client-bear";
import { IDrillingActivationPostMessageData } from "@gooddata/sdk-model";
import compact from "lodash/compact";
import includes from "lodash/includes";
import isArray from "lodash/isArray";
import uniq from "lodash/uniq";

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
    postMessageData: IDrillingActivationPostMessageData,
    idToUriConverter: (workspace: string, identifiers: string[]) => Promise<IUriIdentifierPair[]>,
): Promise<IDrillingActivationPostMessageData> => {
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
