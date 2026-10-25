// (C) 2007-2026 GoodData Corporation

import { isEqual } from "lodash-es";

import { type ISortItem } from "@gooddata/sdk-model";
import { type IVisualizationProperties } from "@gooddata/sdk-ui-ext/internal";

import { type IStoredVisualizationProperties } from "../typings/properties.js";

/** Both provenances of the visualization properties share this shape. */
type AnyVisualizationProperties = IVisualizationProperties | undefined;

/**
 * The two identifier-carrying shapes of a sort item, structurally — deliberately NOT sdk-model's
 * `ISortItem`: this reads identifiers out of sort items that arrive from the persisted insight and
 * from test fixtures, where `direction` is a plain string.
 */
export interface ISortItemIdentifiers {
    attributeSortItem?: { attributeIdentifier: string };
    measureSortItem?: {
        locators?: Array<{
            attributeLocatorItem?: { attributeIdentifier: string };
            measureLocatorItem?: { measureIdentifier: string };
            /** declared so a sdk-model `ITotalLocatorItem` still matches this shape */
            totalLocatorItem?: unknown;
        }>;
    };
}

export function getSortItemIdentifiers(sortItem: ISortItemIdentifiers): string[] {
    if (sortItem?.attributeSortItem) {
        return [sortItem.attributeSortItem.attributeIdentifier];
    }

    return (sortItem?.measureSortItem?.locators ?? []).map((locator) =>
        locator.attributeLocatorItem
            ? locator.attributeLocatorItem.attributeIdentifier
            : locator.measureLocatorItem?.measureIdentifier,
    );
}

/** Compares two visualization properties after normalizing both to the plain defaulted form. */
export function areSameVisualizationProperties(
    p1: AnyVisualizationProperties,
    p2: AnyVisualizationProperties,
): boolean {
    return isEqual(
        getVisualizationPropertiesWithDefaultValues(p1),
        getVisualizationPropertiesWithDefaultValues(p2),
    );
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    value !== null && typeof value === "object" && !Array.isArray(value);

/**
 * The save-comparison normalization shared by the MD-object family and the properties state family:
 * non-record input passes through, `sortItems` defaults to `[]`, `controls` to `{}`, and empty `tags`
 * / empty geo `viewport.navigation` are dropped.
 */
export function getVisualizationPropertiesWithDefaultValues(
    properties: unknown,
): IStoredVisualizationProperties {
    if (!isRecord(properties)) {
        // non-record input passes through untouched (pinned behaviour)
        return properties as IStoredVisualizationProperties;
    }

    const { tags, ...withoutTags } = properties;
    const propertiesWithSanitizedTags = Array.isArray(tags) && tags.length === 0 ? withoutTags : properties;

    const sortItems = (propertiesWithSanitizedTags["sortItems"] as ISortItem[] | undefined) ?? [];
    const controls = propertiesWithSanitizedTags["controls"];
    const controlsWithDefaults = isRecord(controls) ? controls : {};
    const sanitizedControls = sanitizeGeoViewportControls(controlsWithDefaults);

    return { ...propertiesWithSanitizedTags, sortItems, controls: sanitizedControls };
}

function sanitizeGeoViewportControls(controls: Record<string, unknown>): Record<string, unknown> {
    const viewport = controls["viewport"];
    if (!isRecord(viewport)) {
        return controls;
    }

    const navigation = viewport["navigation"];
    const { navigation: _dropped, ...viewportWithoutNavigation } = viewport;
    const sanitizedViewport =
        isRecord(navigation) && Object.keys(navigation).length === 0 ? viewportWithoutNavigation : viewport;

    if (Object.keys(sanitizedViewport).length === 0) {
        const { viewport: _droppedViewport, ...controlsWithoutViewport } = controls;
        return controlsWithoutViewport;
    }
    return { ...controls, viewport: sanitizedViewport };
}
