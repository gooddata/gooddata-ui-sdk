// (C) 2026 GoodData Corporation

/**
 * Highcharts-specific reference resolution for custom tooltip content.
 *
 * The pure substitution function (`resolveReferences`) and the value lookup
 * shape (`IResolvedReferenceValues`) live in @gooddata/sdk-ui-vis-commons; this
 * file builds the lookup from a hovered Highcharts point's drill intersection.
 */

import { ClientFormatterFacade } from "@gooddata/number-formatter";
import { type ISeparators, isMeasureDescriptor } from "@gooddata/sdk-model";
import { type IDrillEventIntersectionElement, isDrillIntersectionAttributeItem } from "@gooddata/sdk-ui";
import { type IResolvedReferenceValues } from "@gooddata/sdk-ui-vis-commons";

import { type IUnsafeHighchartsTooltipPoint } from "../../../typings/unsafe.js";
import { type IIdentifierMapping } from "./identifierMapping.js";

/**
 * Builds resolved values from the hovered point's drill intersection.
 *
 * Uses the identifierMapping to translate localIdentifiers (from the drill
 * intersection) to LDM identifiers used in `{metric/id}` references, and to
 * read each measure's value from the correct Highcharts point field — `x`,
 * `y`, `z`, `value`, or `target`, depending on chart type.
 *
 * Without an identifierMapping (or for a measure not present in it) the
 * resolver falls back to `point.y`, which is correct for the single-Y chart
 * family.
 */
export function resolveReferencesFromPoint(
    point: IUnsafeHighchartsTooltipPoint,
    separators?: ISeparators,
    identifierMapping?: IIdentifierMapping,
): IResolvedReferenceValues {
    const intersection: IDrillEventIntersectionElement[] = point.drillIntersection ?? [];
    const values: IResolvedReferenceValues = {};
    const measureMap = identifierMapping?.measures ?? {};

    for (const element of intersection) {
        const { header } = element;

        if (isDrillIntersectionAttributeItem(header)) {
            // Attribute element — resolve {label/id}
            const displayFormId = header.attributeHeader.identifier;
            const attributeId = header.attributeHeader.formOf.identifier;
            const displayValue =
                header.attributeHeaderItem.formattedName ?? header.attributeHeaderItem.name ?? undefined;

            // Register under both display form and attribute identifiers
            values[`label/${displayFormId}`] = displayValue;
            if (attributeId !== displayFormId) {
                values[`label/${attributeId}`] = displayValue;
            }
        } else if (isMeasureDescriptor(header)) {
            const localId = header.measureHeaderItem.localIdentifier;
            const entry = measureMap[localId];
            const ldmId = header.measureHeaderItem.identifier ?? entry?.ldmId;

            if (!ldmId) {
                continue;
            }

            const format = header.measureHeaderItem.format;
            const pointField = entry?.pointField ?? "y";
            // Bullet's null target is encoded as `target: 0` plus an
            // `isNullTarget` flag — read the flag so it surfaces as no-data
            // rather than a formatted zero.
            const rawValue = pointField === "target" && point["isNullTarget"] ? null : point[pointField];

            if (rawValue != null && format) {
                const { formattedValue } = ClientFormatterFacade.formatValue(rawValue, format, separators);
                values[`metric/${ldmId}`] = formattedValue;
            } else if (rawValue != null) {
                values[`metric/${ldmId}`] = String(rawValue);
            }
        }
    }

    return values;
}
