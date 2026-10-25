// (C) 2026 GoodData Corporation

import { cloneDeep } from "lodash-es";

import { type IExtendedReferencePoint } from "@gooddata/sdk-ui-ext/internal";

import { getDefaultArithmeticMeasureFormat, getDefaultMeasureFormat } from "../../../models/bucket_item.js";

/**
 * Measure format sanitization.
 *
 * The rule: a measure whose format is still the DEFAULT for its previous configuration follows the
 * configuration when it changes (a fact shown in percent switches to the percentage format, a ratio
 * arithmetic measure turned into a change switches too); a measure the user gave its own format
 * keeps it. The trigger differs by kind — `showInPercent` for a catalog-backed measure, `operator`
 * for an arithmetic one — and a measure whose trigger did not change is returned as the very SAME
 * object, which is what keeps the reference-point mapping below from churning identities.
 *
 * The catalog lookup stays in the caller: the helper is told the resolved catalog item TYPE (or
 * `undefined` when the measure has no catalog item, i.e. it is arithmetic), which is all the format
 * decision needs.
 */

/** The measure fields the format decision reads — satisfied by both bucket item shapes AD uses. */
interface IFormattableMeasure {
    attribute?: string;
    showInPercent?: boolean;
    operator?: string | null;
    format?: string;
}

/** Resolves a measure's `attribute` (the catalog item id) to that catalog item's type. */
export type CatalogItemTypeResolver = (measureIdentifier: string) => string | undefined;

export function sanitizeMeasureFormatForCatalogType<
    P extends IFormattableMeasure,
    T extends IFormattableMeasure,
>(previousMeasure: P, measure: T, catalogItemType: string | undefined): T {
    let previousDefaultFormat;
    let defaultFormat;

    if (catalogItemType) {
        const showInPercent = measure.showInPercent;
        const previousShowInPercent = previousMeasure.showInPercent;
        if (showInPercent === previousShowInPercent) {
            return measure;
        }
        previousDefaultFormat = getDefaultMeasureFormat(catalogItemType, previousShowInPercent);
        defaultFormat = getDefaultMeasureFormat(catalogItemType, showInPercent);
    } else {
        const operator = measure.operator;
        const previousOperator = previousMeasure.operator;
        if (operator === previousOperator) {
            return measure;
        }
        previousDefaultFormat = getDefaultArithmeticMeasureFormat(previousOperator);
        defaultFormat = getDefaultArithmeticMeasureFormat(operator);
    }

    const previousFormat = previousMeasure.format;
    if (previousFormat && previousFormat !== previousDefaultFormat) {
        return measure;
    }

    return {
        ...measure,
        format: defaultFormat,
    };
}

/**
 * Applies {@link sanitizeMeasureFormatForCatalogType} to every bucket item of an extended reference
 * point, pairing each item with its counterpart in the previous reference point. An item with no
 * counterpart is left exactly as it came in — there is no previous configuration to compare against.
 */
/**
 * What the format decision needs from the PREVIOUS reference point: the measures it held. Declared
 * structurally rather than as the SDK's `IReferencePoint`, because the value AD passes in belongs to
 * the REFERENCE-POINT STATE family (`IReferencePointState`) — a different family with the same
 * shapes.
 */
export interface IPreviousMeasureFormats {
    buckets?: ReadonlyArray<{ items?: ReadonlyArray<IFormattableMeasure & { localIdentifier?: string }> }>;
}

export function sanitizeReferencePointFormats(
    previousExtendedReferencePoint: IPreviousMeasureFormats,
    extendedReferencePoint: IExtendedReferencePoint,
    resolveCatalogItemType: CatalogItemTypeResolver,
): IExtendedReferencePoint {
    if (!extendedReferencePoint?.buckets) {
        return extendedReferencePoint;
    }
    const previousBucketItems = previousExtendedReferencePoint?.buckets
        ? previousExtendedReferencePoint.buckets.flatMap((bucket) => bucket.items ?? [])
        : [];

    const result: IExtendedReferencePoint = cloneDeep(extendedReferencePoint);

    result.buckets = extendedReferencePoint.buckets.map((bucket) => {
        return {
            ...bucket,
            items: bucket.items.map((item) => {
                const previousItem = previousBucketItems.find(
                    (previousItem) => previousItem.localIdentifier === item.localIdentifier,
                );
                if (!previousItem) {
                    return item;
                }
                return sanitizeMeasureFormatForCatalogType(
                    previousItem,
                    item,
                    resolveCatalogItemType(item.attribute),
                );
            }),
        };
    });
    return result;
}
