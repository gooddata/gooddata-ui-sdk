// (C) 2022-2025 GoodData Corporation

import { idRef } from "../objRef/factory.js";
import { IdentifierRef, isIdentifierRef } from "../objRef/index.js";

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

const attributeIdentifierSplitRegexp = /(\{attribute_title\(.*?\)\})/;
const attributeIdentifierMatchRegexp = /\{attribute_title\((.*?)\)\}/g;
const dashboardAttributeFilterMatchRegexp = /\{dash_attribute_filter_selection\((.*?)\)\}/g;
const insightAttributeFilterMatchRegexp = /\{attribute_filter_selection\((.*?)\)\}/g;

const attributeIdentifierToPlaceholder = (ref: IdentifierRef) => `{attribute_title(${ref.identifier})}`;

const matchToUrlPlaceholder = (match: any): IDrillToUrlPlaceholder => ({
    placeholder: match[0],
    identifier: match[1],
    ref: idRef(match[1], "displayForm"),
    toBeEncoded: match.index !== 0,
});

const splitAttributeIdentifierUrl = (url: string): string[] => url.split(attributeIdentifierSplitRegexp);

/**
 * @internal
 */
export const splitDrillUrlParts = (url: string): IDrillUrlPart[] => {
    return splitAttributeIdentifierUrl(url).map((urlPart: string) => {
        const match = attributeIdentifierMatchRegexp.exec(urlPart);
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
    if (typeof parts === "string") {
        return parts;
    }

    return parts
        .map((urlPart: IDrillUrlPart) => {
            if (isIdentifierRef(urlPart)) {
                return attributeIdentifierToPlaceholder(urlPart);
            }

            return urlPart;
        })
        .join("");
};

/**
 * @internal
 */
export const getAttributeIdentifiersPlaceholdersFromUrl = (url: string): IDrillToUrlPlaceholder[] =>
    matchAll(attributeIdentifierMatchRegexp, url).map(matchToUrlPlaceholder);

/**
 * @internal
 */
export const getDashboardAttributeFilterPlaceholdersFromUrl = (url: string): IDrillToUrlPlaceholder[] =>
    matchAll(dashboardAttributeFilterMatchRegexp, url).map(matchToUrlPlaceholder);

/**
 * @internal
 */
export const getInsightAttributeFilterPlaceholdersFromUrl = (url: string): IDrillToUrlPlaceholder[] =>
    matchAll(insightAttributeFilterMatchRegexp, url).map(matchToUrlPlaceholder);
