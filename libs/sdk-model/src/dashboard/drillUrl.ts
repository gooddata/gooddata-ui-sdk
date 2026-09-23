// (C) 2022-2026 GoodData Corporation

import { isMeasureValueFilter, measureValueFilterMeasure } from "../execution/filter/index.js";
import {
    type IMeasure,
    measureArithmeticOperands,
    measureItem,
    measureLocalId,
    measureMasterIdentifier,
} from "../execution/measure/index.js";
import { type IInsightDefinition, insightFilters, insightMeasures } from "../insight/index.js";
import { type IAttributeDisplayFormMetadataObject } from "../ldm/metadata/attributeDisplayForm/index.js";
import { idRef } from "../objRef/factory.js";
import {
    type IdentifierRef,
    type ObjRef,
    areObjRefsEqual,
    isComputedAttributeRef,
    isIdentifierRef,
    isLocalIdRef,
    objRefToString,
} from "../objRef/index.js";

import { type IDrillToCustomUrlTarget } from "./drill.js";

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

/** Context placeholders carry no object dependency. @internal */
export enum DRILL_TO_URL_PLACEHOLDER {
    DRILL_TO_URL_PLACEHOLDER_PROJECT_ID = "{project_id}",
    DRILL_TO_URL_PLACEHOLDER_WORKSPACE_ID = "{workspace_id}",
    DRILL_TO_URL_PLACEHOLDER_INSIGHT_ID = "{visualization_id}",
    DRILL_TO_URL_PLACEHOLDER_WIDGET_ID = "{widget_id}",
    DRILL_TO_URL_PLACEHOLDER_DASHBOARD_ID = "{dashboard_id}",
    DRILL_TO_URL_PLACEHOLDER_CLIENT_ID = "{client_id}",
    DRILL_TO_URL_PLACEHOLDER_DATA_PRODUCT_ID = "{data_product_id}",
}

type DrillUrlDependency = "displayForm" | "measure" | "insightMeasure" | "none";

function definePlaceholder<T extends string>(type: T, pattern: RegExp, dependency: DrillUrlDependency) {
    return { type, pattern, dependency };
}

/**
 * Shared grammar for URL resolution and dependency collection. Every entry must declare its
 * dependency policy; the dashboard resolver exhaustively handles the resulting type union.
 * @internal
 */
const drillUrlPlaceholderDefinitions = [
    definePlaceholder("attribute_title", /\{attribute_title\((.*?)\)\}/g, "displayForm"),
    definePlaceholder(
        "dash_attribute_filter_selection",
        /\{dash_attribute_filter_selection\((.*?)\)\}/g,
        "displayForm",
    ),
    definePlaceholder(
        "attribute_filter_selection",
        /\{attribute_filter_selection\((.*?)\)\}/g,
        "displayForm",
    ),
    definePlaceholder("dash_mvf_condition", /\{dash_mvf_condition\((.*?)\)\}/g, "measure"),
    definePlaceholder("mvf_condition", /\{mvf_condition\((.*?)\)\}/g, "insightMeasure"),
    ...Object.values(DRILL_TO_URL_PLACEHOLDER).map((placeholder) =>
        definePlaceholder(placeholder, new RegExp(placeholder, "g"), "none"),
    ),
];

/** Supported grammar keys; URL resolvers must handle every key. @internal */
export type DrillUrlPlaceholderType = (typeof drillUrlPlaceholderDefinitions)[number]["type"];

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

const matchToUrlPlaceholder = (match: RegExpExecArray): IDrillToUrlPlaceholder => ({
    placeholder: match[0],
    identifier: placeholderIdentifier(match[1]),
    ref: placeholderToRef(match[1]),
    toBeEncoded: match.index !== 0,
});

const matchToMeasureUrlPlaceholder = (match: RegExpExecArray): IDrillToUrlPlaceholder => ({
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
        const match = /\{attribute_title\((.*?)\)\}/.exec(urlPart);
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

/** Parses one registered object-placeholder family using the shared grammar. */
function getObjectPlaceholders(url: string, type: DrillUrlPlaceholderType): IDrillToUrlPlaceholder[] {
    const definition = drillUrlPlaceholderDefinitions.find((candidate) => candidate.type === type);
    if (!definition || definition.dependency === "none") {
        return [];
    }
    return matchAll(definition.pattern, url).map(
        definition.dependency === "displayForm" ? matchToUrlPlaceholder : matchToMeasureUrlPlaceholder,
    );
}

/** @internal */
export const getAttributeIdentifiersPlaceholdersFromUrl = (url: string): IDrillToUrlPlaceholder[] =>
    getObjectPlaceholders(url, "attribute_title");

/** @internal */
export const getDashboardAttributeFilterPlaceholdersFromUrl = (url: string): IDrillToUrlPlaceholder[] =>
    getObjectPlaceholders(url, "dash_attribute_filter_selection");

/** @internal */
export const getDashboardMeasureValueFilterPlaceholdersFromUrl = (url: string): IDrillToUrlPlaceholder[] =>
    getObjectPlaceholders(url, "dash_mvf_condition");

/** @internal */
export const getInsightAttributeFilterPlaceholdersFromUrl = (url: string): IDrillToUrlPlaceholder[] =>
    getObjectPlaceholders(url, "attribute_filter_selection");

/** @internal */
export const getInsightMeasureValueFilterPlaceholdersFromUrl = (url: string): IDrillToUrlPlaceholder[] =>
    getObjectPlaceholders(url, "mvf_condition");

/** Returns the registered placeholder families present in the URL. @internal */
export function getDrillUrlPlaceholderTypes(url: string): DrillUrlPlaceholderType[] {
    return drillUrlPlaceholderDefinitions
        .filter(({ pattern }) => matchAll(pattern, url).length > 0)
        .map(({ type }) => type);
}

/** Resolves local arithmetic/derived measures without interpreting local IDs as object IDs. */
function localMeasureReferences(identifier: string, measures: IMeasure[], visited: Set<string>): ObjRef[] {
    if (visited.has(identifier)) {
        return [];
    }
    visited.add(identifier);
    const measure = measures.find((candidate) => measureLocalId(candidate) === identifier);
    if (!measure) {
        return [];
    }
    const item = measureItem(measure);
    if (item) {
        return [item];
    }
    const master = measureMasterIdentifier(measure);
    const operands = master ? [master] : (measureArithmeticOperands(measure) ?? []);
    return operands.flatMap((operand) => localMeasureReferences(operand, measures, visited));
}

/**
 * Collects dependencies by exact placeholder. Without the source insight, only dependencies saved
 * for the same insight-filter placeholder can be retained; removed/renamed placeholders disappear.
 * @internal
 */
export function getDrillToCustomUrlReferenceMap(
    target: IDrillToCustomUrlTarget,
    insight?: IInsightDefinition,
): Record<string, ObjRef[]> {
    const references: Record<string, ObjRef[]> = {};
    for (const definition of drillUrlPlaceholderDefinitions) {
        for (const { placeholder, identifier, ref } of getObjectPlaceholders(target.url, definition.type)) {
            if (definition.dependency !== "insightMeasure") {
                references[placeholder] = [ref];
                continue;
            }
            if (!insight) {
                references[placeholder] = target.references?.[placeholder] ?? [];
                continue;
            }
            const filter = insightFilters(insight)
                .filter(isMeasureValueFilter)
                .find((candidate) => objRefToString(measureValueFilterMeasure(candidate)) === identifier);
            if (!filter) {
                references[placeholder] = [];
                continue;
            }
            const measureRef = measureValueFilterMeasure(filter);
            references[placeholder] = isLocalIdRef(measureRef)
                ? localMeasureReferences(measureRef.localIdentifier, insightMeasures(insight), new Set())
                : [measureRef];
        }
    }
    return references;
}

/** Returns distinct object dependencies of the current URL for restriction checks. @internal */
export function getDrillToCustomUrlReferences(
    target: IDrillToCustomUrlTarget,
    insight?: IInsightDefinition,
): ObjRef[] {
    return Object.values(getDrillToCustomUrlReferenceMap(target, insight))
        .flat()
        .filter(
            (ref, index, refs) => refs.findIndex((candidate) => areObjRefsEqual(candidate, ref)) === index,
        );
}
