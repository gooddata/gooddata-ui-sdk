// (C) 2021-2026 GoodData Corporation

import { type MarkupContent, type Range } from "vscode-languageserver";

import { findAllObjects } from "./findObjects.js";
import {
    type ITigerMetadataObject,
    type LdmObjects,
    isITigerAttribute,
    isITigerLabel,
} from "./metadata/model.js";
import { MaqlMetric } from "./parseMaql.js";
import { type MetadataObjectAndRange } from "./tokenRanges.js";

/**
 * The decorations as defined in this file are heavily inspired by Monaco editor decorations.
 */

/**
 * A decoration in the model.
 *
 * @internal
 */
export interface IDecoration {
    /**
     * Range that this decoration covers.
     */
    range: Range;
    /**
     * Options associated with this decoration.
     */
    options: IDecorationOptions;
}

/**
 * Options for a decoration.
 *
 * @internal
 */
export interface IDecorationOptions {
    /**
     * Array of MarkdownString to render as the decoration message.
     */
    hoverMessage?: MarkupContent | MarkupContent[];
    /**
     * If set, text will be injected in the view after the range.
     */
    label: string;
    /**
     * Type of current decorator
     */
    type: DecorationType;
}

/**
 * @internal
 */
export type DecorationType = ITigerMetadataObject["tigerType"] | "dateAttribute" | "dateLabel";

export function decorate(query: string, ldmObjects?: LdmObjects): IDecoration[] {
    const metric = new MaqlMetric(query);
    // decorate objects with business names
    return ldmObjects ? decorateBusinessNames(metric, ldmObjects) : [];
}

function decorateBusinessNames(metric: MaqlMetric, ldmObjects: LdmObjects): IDecoration[] {
    const foundObjects = findAllObjects(metric);
    return foundObjects
        .map((objectAndRange): MetadataObjectAndRange | null => {
            const fullObject = ldmObjects.findObject(objectAndRange);
            if (!fullObject) return null;
            return {
                range: objectAndRange.range.toRange(),
                ...fullObject,
            };
        })
        .filter((foundObject): foundObject is MetadataObjectAndRange => !!foundObject)
        .map((foundObject) =>
            createDecoration(foundObject.range, foundObject.title, toDecorationType(foundObject)),
        );
}

function toDecorationType(object: ITigerMetadataObject): DecorationType {
    if (isITigerAttribute(object)) {
        return object.tigerTypeModifier === "date" ? "dateAttribute" : object.tigerType;
    }
    if (isITigerLabel(object)) {
        return object.tigerTypeModifier === "date" ? "dateLabel" : object.tigerType;
    }
    return object.tigerType;
}

export function createDecoration(range: Range, label: string, type: DecorationType): IDecoration {
    return {
        range,
        options: {
            label,
            type,
        },
    };
}
