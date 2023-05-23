// (C) 2022 GoodData Corporation
import isString from "lodash/isString.js";
import { IdentifierRef, isIdentifierRef } from "../objRef/index.js";
import { idRef } from "../objRef/factory.js";

/**
 * @internal
 */
export interface IDrillToUrlPlaceholder {
    placeholder: string;
    identifier: string;
    ref: IdentifierRef;
    toBeEncoded: boolean;
}

/**
 * @internal
 */
export type IDrillUrlPart = string | IdentifierRef;

function matchAll(regex: RegExp, text: string): RegExpExecArray[] {
    const matches = [];
    let match = null;
    while ((match = regex.exec(text)) !== null) {
        matches.push(match);
    }
    return matches;
}

const identifierSplitRegexp = /(\{attribute_title\(.*?\)\})/g;
const identifierMatchRegexp = /\{attribute_title\((.*?)\)\}/g;

const identifierToPlaceholder = (ref: IdentifierRef) => `{attribute_title(${ref.identifier})}`;

const matchToUrlPlaceholder = (match: any): IDrillToUrlPlaceholder => ({
    placeholder: match[0],
    identifier: match[1],
    ref: idRef(match[1], "displayForm"),
    toBeEncoded: match.index !== 0,
});

const splitUrl = (url: string): string[] => url.split(identifierSplitRegexp);

/**
 * @internal
 */
export const splitDrillUrlParts = (url: string): IDrillUrlPart[] => {
    return splitUrl(url).map((urlPart: string) => {
        const match = identifierMatchRegexp.exec(urlPart);
        if (match !== null) {
            return matchToUrlPlaceholder(match).ref;
        }

        return urlPart;
    });
};

/**
 * @internal
 */
export const joinDrillUrlParts = (parts: IDrillUrlPart[] | string): string => {
    // Back compatibility
    if (isString(parts)) {
        return parts;
    }

    return parts
        .map((urlPart: IDrillUrlPart) => {
            if (isIdentifierRef(urlPart)) {
                return identifierToPlaceholder(urlPart);
            }

            return urlPart;
        })
        .join("");
};

/**
 * @internal
 */
export const getAttributeIdentifiersPlaceholdersFromUrl = (url: string): IDrillToUrlPlaceholder[] =>
    matchAll(identifierMatchRegexp, url).map(matchToUrlPlaceholder);
