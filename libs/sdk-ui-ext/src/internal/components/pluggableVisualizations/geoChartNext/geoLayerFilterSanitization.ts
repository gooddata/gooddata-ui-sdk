// (C) 2025-2026 GoodData Corporation

import {
    type IFilter,
    attributeLocalId,
    isAttribute,
    isLocalIdRef,
    isMeasure,
    isMeasureValueFilter,
    isRankingFilter,
    measureLocalId,
} from "@gooddata/sdk-model";
import type { IGeoLayer } from "@gooddata/sdk-ui-geo/next";

export function getGeoLayerLocalIds(layer: IGeoLayer): {
    attributeLocalIds: Set<string>;
    measureLocalIds: Set<string>;
} {
    const attributeLocalIds = new Set<string>();
    const measureLocalIds = new Set<string>();

    const addItem = (item: unknown): void => {
        if (isAttribute(item)) {
            attributeLocalIds.add(attributeLocalId(item));
        } else if (isMeasure(item)) {
            measureLocalIds.add(measureLocalId(item));
        }
    };

    if (layer.type === "pushpin") {
        addItem(layer.latitude);
        addItem(layer.longitude);
        addItem(layer.size);
        addItem(layer.color);
        addItem(layer.segmentBy);
        addItem(layer.tooltipText);
    } else {
        addItem(layer.area);
        addItem(layer.color);
        addItem(layer.segmentBy);
        addItem(layer.tooltipText);
    }

    return { attributeLocalIds, measureLocalIds };
}

/**
 * GeoChartNext executes each layer separately, but AD supplies a single global filters array.
 * Measure-based filters (MVF, ranking) using localId refs must only be applied to layers that
 * contain the referenced measure/attributes, otherwise backend normalization fails.
 */
export function sanitizeGeoLayerGlobalFilters(layer: IGeoLayer, filters: IFilter[]): IFilter[] {
    if (!filters.length) {
        return filters;
    }

    const { attributeLocalIds, measureLocalIds } = getGeoLayerLocalIds(layer);

    // TEMP DEBUG: remove once MVF layer matching is fully validated in AD
    // eslint-disable-next-line no-console
    console.log("[geoLayerFilterSanitization]", {
        layer: { id: layer.id, type: layer.type, name: layer.name },
        layerLocalIds: {
            attributes: Array.from(attributeLocalIds),
            measures: Array.from(measureLocalIds),
        },
        incomingMvfs: filters.filter(isMeasureValueFilter).map((f) => ({
            measure: isLocalIdRef(f.measureValueFilter.measure)
                ? f.measureValueFilter.measure.localIdentifier
                : "<non-localId-ref>",
            dimensionality: (f.measureValueFilter.dimensionality ?? [])
                .filter(isLocalIdRef)
                .map((d) => d.localIdentifier),
        })),
    });

    return filters.filter((filter) => {
        if (isMeasureValueFilter(filter)) {
            const { measure, dimensionality = [] } = filter.measureValueFilter;

            if (isLocalIdRef(measure) && !measureLocalIds.has(measure.localIdentifier)) {
                // eslint-disable-next-line no-console
                console.log("[geoLayerFilterSanitization][drop-mvf]", {
                    layerId: layer.id,
                    reason: "missing-measure-localId",
                    measure: measure.localIdentifier,
                });
                return false;
            }

            // If dimensionality contains localId refs not present in this layer, drop the entire filter.
            // This matches AD semantics: MVF is bound to specific attribute(s); if they are not in the layer,
            // the filter must not be applied (and would otherwise dangle during backend normalization).
            const missingDimensionality = dimensionality
                .filter(isLocalIdRef)
                .map((ref) => ref.localIdentifier)
                .filter((id) => !attributeLocalIds.has(id));

            if (missingDimensionality.length > 0) {
                // eslint-disable-next-line no-console
                console.log("[geoLayerFilterSanitization][drop-mvf]", {
                    layerId: layer.id,
                    reason: "missing-dimensionality-localId",
                    measure: isLocalIdRef(measure) ? measure.localIdentifier : "<non-localId-ref>",
                    missingDimensionality,
                });
                return false;
            }

            return true;
        }

        if (isRankingFilter(filter)) {
            const { measure, attributes = [] } = filter.rankingFilter;

            if (isLocalIdRef(measure) && !measureLocalIds.has(measure.localIdentifier)) {
                // eslint-disable-next-line no-console
                console.log("[geoLayerFilterSanitization][drop-ranking]", {
                    layerId: layer.id,
                    reason: "missing-measure-localId",
                    measure: measure.localIdentifier,
                });
                return false;
            }

            const missingAttributes = attributes
                .filter(isLocalIdRef)
                .map((ref) => ref.localIdentifier)
                .filter((id) => !attributeLocalIds.has(id));

            if (missingAttributes.length > 0) {
                // eslint-disable-next-line no-console
                console.log("[geoLayerFilterSanitization][drop-ranking]", {
                    layerId: layer.id,
                    reason: "missing-attribute-localId",
                    measure: isLocalIdRef(measure) ? measure.localIdentifier : "<non-localId-ref>",
                    missingAttributes,
                });
                return false;
            }

            return true;
        }

        return true;
    });
}
