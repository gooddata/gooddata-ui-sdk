// (C) 2022-2026 GoodData Corporation

import { type IAttributeDisplayFormMetadataObject } from "../ldm/metadata/attributeDisplayForm/index.js";
import { idRef } from "../objRef/factory.js";
import { type IdentifierRef, type ObjRef, isComputedAttributeRef, isIdentifierRef } from "../objRef/index.js";

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
const dashboardMeasureValueFilterMatchRegexp = /\{dash_mvf_condition\((.*?)\)\}/g;
const insightAttributeFilterMatchRegexp = /\{attribute_filter_selection\((.*?)\)\}/g;
const insightMeasureValueFilterMatchRegexp = /\{mvf_condition\((.*?)\)\}/g;

/**
 * A placeholder names its target by identifier alone, which used to be enough because every target
 * was a display form. A computed attribute has no labels on the backend and must be referenced by
 * its own object type, so its identifier carries this type prefix to keep the two apart - both when
 * a placeholder is turned into a stored reference and when that reference is rendered back into the
 * URL. A bare identifier keeps meaning a display form, so URLs stored before this existed parse
 * unchanged; the prefix cannot collide with an identifier because "/" is not a legal identifier
 * character.
 */
const COMPUTED_ATTRIBUTE_PREFIX = "computed_attribute/";

const isComputedAttributePlaceholderIdentifier = (identifier: string): boolean =>
    identifier.startsWith(COMPUTED_ATTRIBUTE_PREFIX);

/**
 * The identifier of the object a placeholder points at, without the type prefix.
 */
const placeholderIdentifier = (identifier: string): string =>
    isComputedAttributePlaceholderIdentifier(identifier)
        ? identifier.slice(COMPUTED_ATTRIBUTE_PREFIX.length)
        : identifier;

const placeholderToRef = (identifier: string): IdentifierRef =>
    isComputedAttributePlaceholderIdentifier(identifier)
        ? idRef(placeholderIdentifier(identifier), "computedAttribute")
        : idRef(identifier, "displayForm");

/**
 * The identifier text a placeholder uses to name the given object, exactly as it appears inside the
 * placeholder in the URL - type-prefixed for a computed attribute, bare for a display form.
 *
 * @internal
 */
export const placeholderIdentifierText = (ref: ObjRef): string => {
    const prefix = isComputedAttributeRef(ref) ? COMPUTED_ATTRIBUTE_PREFIX : "";
    // Tiger references objects by identifier only; the uri branch just keeps the function total.
    const identifier = isIdentifierRef(ref) ? ref.identifier : ref.uri;

    return `${prefix}${identifier}`;
};

/**
 * The reference a placeholder uses to name the given display form.
 *
 * The identifier always comes from `id` and only the kind of object is taken from the ref, because a
 * display form can be described by a uri ref, which a placeholder has no way to express - placeholders
 * name their target by identifier alone.
 *
 * @internal
 */
export const displayFormPlaceholderRef = (df: IAttributeDisplayFormMetadataObject): ObjRef =>
    isComputedAttributeRef(df.ref) ? idRef(df.id, "computedAttribute") : idRef(df.id, "displayForm");

/**
 * Builds the `{attribute_title(...)}` placeholder text referencing the given object.
 *
 * @internal
 */
export const attributeIdentifierToPlaceholder = (ref: ObjRef): string =>
    `{attribute_title(${placeholderIdentifierText(ref)})}`;

/**
 * Builds the `{dash_attribute_filter_selection(...)}` placeholder text referencing the given object.
 *
 * @internal
 */
export const dashboardAttributeFilterToPlaceholder = (ref: ObjRef): string =>
    `{dash_attribute_filter_selection(${placeholderIdentifierText(ref)})}`;

/**
 * Builds the `{attribute_filter_selection(...)}` placeholder text referencing the given object.
 *
 * @internal
 */
export const insightAttributeFilterToPlaceholder = (ref: ObjRef): string =>
    `{attribute_filter_selection(${placeholderIdentifierText(ref)})}`;

const matchToUrlPlaceholder = (match: any): IDrillToUrlPlaceholder => ({
    placeholder: match[0],
    identifier: placeholderIdentifier(match[1]),
    ref: placeholderToRef(match[1]),
    toBeEncoded: match.index !== 0,
});

const matchToMeasureUrlPlaceholder = (match: any): IDrillToUrlPlaceholder => ({
    placeholder: match[0],
    identifier: match[1],
    ref: idRef(match[1], "measure"),
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
export const getDashboardMeasureValueFilterPlaceholdersFromUrl = (url: string): IDrillToUrlPlaceholder[] =>
    matchAll(dashboardMeasureValueFilterMatchRegexp, url).map(matchToMeasureUrlPlaceholder);

/**
 * @internal
 */
export const getInsightAttributeFilterPlaceholdersFromUrl = (url: string): IDrillToUrlPlaceholder[] =>
    matchAll(insightAttributeFilterMatchRegexp, url).map(matchToUrlPlaceholder);

/**
 * @internal
 */
export const getInsightMeasureValueFilterPlaceholdersFromUrl = (url: string): IDrillToUrlPlaceholder[] =>
    matchAll(insightMeasureValueFilterMatchRegexp, url).map(matchToMeasureUrlPlaceholder);
