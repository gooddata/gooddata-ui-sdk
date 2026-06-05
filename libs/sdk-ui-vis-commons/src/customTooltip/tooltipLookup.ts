// (C) 2026 GoodData Corporation

import { type IDataView } from "@gooddata/sdk-backend-spi";
import { type ISeparators, isResultAttributeHeader } from "@gooddata/sdk-model";
import { DataViewFacade } from "@gooddata/sdk-ui";

import { labelReference, measureReference } from "./referenceStatus.js";
import { type ITooltipExecutionMeta } from "./tooltipExecution.js";
import { buildKeySegment, joinKeySegments } from "./tooltipKey.js";
import { type IResolvedReferenceValues, labelKey, metricKey } from "./types.js";

/**
 * Build a per-data-point lookup keyed by `${displayFormId}:${uri}` segments
 * (joined by `|`, sorted). Iteration is orientation-agnostic via slices/series.
 * Each reference is tagged with a {@link ResolvedReference} status; localized
 * placeholder strings are applied later, at the render site.
 *
 * @internal
 */
export function buildLookupTable(
    dataView: IDataView,
    meta: ITooltipExecutionMeta,
    separators?: ISeparators,
): Map<string, IResolvedReferenceValues> {
    const lookup = new Map<string, IResolvedReferenceValues>();

    const facade = DataViewFacade.for(dataView);
    const slices = facade.data().slices().toArray();
    const seriesArray = facade.data().series().toArray();

    const dimDescriptors = facade.meta().dimensionItemDescriptors(0);

    const countLocalIds = new Set(Object.values(meta.labelCountMap));

    const seriesByLocalId = new Map(
        seriesArray.map(
            (s) => [s.descriptor.measureDescriptor.measureHeaderItem.localIdentifier, s] as const,
        ),
    );

    for (let sliceIdx = 0; sliceIdx < slices.length; sliceIdx++) {
        const slice = slices[sliceIdx];
        const sliceHeaders = slice.descriptor.headers;

        const keyParts: string[] = [];
        for (let i = 0; i < sliceHeaders.length; i++) {
            const header = sliceHeaders[i];
            const descriptor = dimDescriptors[i];
            if (header && isResultAttributeHeader(header) && descriptor && "attributeHeader" in descriptor) {
                const dfId = descriptor.attributeHeader.identifier;
                const uri = header.attributeHeaderItem.uri ?? "";
                keyParts.push(buildKeySegment(dfId, uri));
            }
        }
        const pointKey = joinKeySegments(keyParts);

        const values: IResolvedReferenceValues = {};

        for (const series of seriesArray) {
            const measureDesc = series.descriptor.measureDescriptor;
            const localId = measureDesc.measureHeaderItem.localIdentifier;
            const dataPoint = series.dataPoints()[sliceIdx];
            const rawValue = dataPoint?.rawValue;

            if (countLocalIds.has(localId)) {
                continue;
            }

            const labelId = meta.labelIdMap[localId];
            if (labelId) {
                const countLocalId = meta.labelCountMap[localId];
                const countSeries = countLocalId ? seriesByLocalId.get(countLocalId) : undefined;
                const countValue = countSeries
                    ? Number(countSeries.dataPoints()[sliceIdx]?.rawValue ?? 0)
                    : 1;

                // count > 1 → "(Multiple items)"; else empty/value via the shared helper.
                values[labelKey(labelId)] = countValue > 1 ? { kind: "multiple" } : labelReference(rawValue);
                continue;
            }

            const metricId = meta.measureIdMap[localId];
            if (metricId) {
                const format = measureDesc.measureHeaderItem.format;
                values[metricKey(metricId)] = measureReference(rawValue, format, separators);
            }
        }

        lookup.set(pointKey, values);
    }

    return lookup;
}
