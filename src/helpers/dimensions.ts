// (C) 2007-2018 GoodData Corporation
import get = require('lodash/get');
import { AFM, VisualizationObject } from '@gooddata/typings';
import { VisualizationTypes, VisType } from '../constants/visualizationTypes';
import { MEASUREGROUP } from '../constants/dimensions';
import {
    VIEW,
    STACK,
    SEGMENT,
    TREND,
    ATTRIBUTE,
    COLUMNS,
    MEASURES
 } from '../constants/bucketNames';
import { convertBucketsToAFM } from '../helpers/conversion';

export function getDimensionTotals(bucket: VisualizationObject.IBucket): AFM.ITotalItem[] {
    const bucketTotals = get(bucket, 'totals', []);
    return bucketTotals.map((total: VisualizationObject.IVisualizationTotal): AFM.ITotalItem => {
        return {
            measureIdentifier: total.measureIdentifier,
            type: total.type,
            attributeIdentifier: total.attributeIdentifier
        };
    });
}

export function getPivotTableDimensions(buckets: VisualizationObject.IBucket[]): AFM.IDimension[] {
    const rowAttributes: VisualizationObject.IBucket = buckets
        .find(
            // ATTRIBUTE for backwards compatibility with Table component. Actually ROWS
            bucket => bucket.localIdentifier === ATTRIBUTE
        );

    const columnAttributes: VisualizationObject.IBucket = buckets
        .find(
            bucket => bucket.localIdentifier === COLUMNS
        );

    const measures: VisualizationObject.IBucket = buckets
        .find(bucket => bucket.localIdentifier === MEASURES);

    const rowAttributesItemIdentifiers = get(rowAttributes, 'items', [])
        .map((a: VisualizationObject.IVisualizationAttribute) =>
            a.visualizationAttribute.localIdentifier);

    const columnAttributesItemIdentifiers = get(columnAttributes, 'items', [])
        .map((a: VisualizationObject.IVisualizationAttribute) =>
            a.visualizationAttribute.localIdentifier);

    const measuresItemIdentifiers =
        get(measures, 'items.length') ? [MEASUREGROUP] : [];

    const totals = getDimensionTotals(rowAttributes);
    const totalsProp = totals.length ? { totals } : {};

    return [
        {
            itemIdentifiers: rowAttributesItemIdentifiers,
            ...totalsProp
        },
        {
            itemIdentifiers: [
                ...columnAttributesItemIdentifiers,
                ...measuresItemIdentifiers
            ]
        }
    ];
}

export function getTableDimensions(buckets: VisualizationObject.IBucket[]): AFM.IDimension[] {
    const attributes: VisualizationObject.IBucket = buckets
        .find(bucket => bucket.localIdentifier === ATTRIBUTE);

    const measures: VisualizationObject.IBucket = buckets
        .find(bucket => bucket.localIdentifier === MEASURES);

    const attributesItemIdentifiers = get(attributes, 'items', [])
        .map((a: VisualizationObject.IVisualizationAttribute) =>
            a.visualizationAttribute.localIdentifier);

    const measuresItemIdentifiers =
        measures && measures.items && measures.items.length ? [MEASUREGROUP] : [];

    const totals = getDimensionTotals(attributes);
    const totalsProp = totals.length ? { totals } : {};

    return [{
        itemIdentifiers: attributesItemIdentifiers,
        ...totalsProp
    }, {
        itemIdentifiers: measuresItemIdentifiers
    }];
}

function getLocalIdentifierFromAttribute(attribute: VisualizationObject.IVisualizationAttribute): string {
    return attribute.visualizationAttribute.localIdentifier;
}

function getPieOrDonutDimensions(mdObject: VisualizationObject.IVisualizationObjectContent): AFM.IDimension[] {
    const view = mdObject.buckets.find(bucket => bucket.localIdentifier === VIEW);

    if (view && view.items.length) {
        return [
            {
                itemIdentifiers: [MEASUREGROUP]
            },
            {
                itemIdentifiers: view.items.map(getLocalIdentifierFromAttribute)
            }
        ];
    }

    return [
        {
            itemIdentifiers: []
        },
        {
            itemIdentifiers: [MEASUREGROUP]
        }
    ];
}

function getBarDimensions(mdObject: VisualizationObject.IVisualizationObjectContent): AFM.IDimension[] {
    const view: VisualizationObject.IBucket = mdObject.buckets
            .find(bucket => bucket.localIdentifier === VIEW);

    const stack: VisualizationObject.IBucket = mdObject.buckets
        .find(bucket => bucket.localIdentifier === STACK);

    const hasNoStacks = !stack || !stack.items || stack.items.length === 0;

    if (hasNoStacks) {
        return [
            {
                itemIdentifiers: [MEASUREGROUP]
            },
            {
                itemIdentifiers: (view && view.items || [])
                    .map(getLocalIdentifierFromAttribute)
            }
        ];
    }

    return [
        {
            itemIdentifiers: (stack && stack.items || [])
                .map(getLocalIdentifierFromAttribute)
        },
        {
            itemIdentifiers: ((view && view.items || [])
                .map(getLocalIdentifierFromAttribute))
                .concat([MEASUREGROUP])
        }
    ];
}

function getLineDimensions(mdObject: VisualizationObject.IVisualizationObjectContent): AFM.IDimension[] {
    const trend: VisualizationObject.IBucket = mdObject.buckets
        .find(bucket => bucket.localIdentifier === TREND);

    const segment: VisualizationObject.IBucket = mdObject.buckets
        .find(bucket => bucket.localIdentifier === SEGMENT);
    const hasNoSegments = !segment || !segment.items || segment.items.length === 0;

    if (hasNoSegments) {
        return [
            {
                itemIdentifiers: [MEASUREGROUP]
            },
            {
                itemIdentifiers: (trend && trend.items || [])
                    .map((t: VisualizationObject.IVisualizationAttribute) =>
                        t.visualizationAttribute.localIdentifier)
            }
        ];
    }

    return [
        {
            itemIdentifiers: (segment && segment.items || [])
                .map((s: VisualizationObject.IVisualizationAttribute) =>
                    s.visualizationAttribute.localIdentifier)
        },
        {
            itemIdentifiers: ((trend && trend.items || [])
                .map((t: VisualizationObject.IVisualizationAttribute) => t.visualizationAttribute.localIdentifier))
                .concat([MEASUREGROUP])
        }
    ];
}

export function getHeadlinesDimensions(): AFM.IDimension[] {
    return [
        { itemIdentifiers: ['measureGroup'] }
    ];
}

function getScatterDimensions(mdObject: VisualizationObject.IVisualizationObjectContent): AFM.IDimension[] {
    const attribute: VisualizationObject.IBucket = mdObject.buckets
            .find(bucket => bucket.localIdentifier === ATTRIBUTE);

    if (attribute && attribute.items.length) {
        return [
            {
                itemIdentifiers: attribute.items.map(getLocalIdentifierFromAttribute)
            },
            {
                itemIdentifiers: [MEASUREGROUP]
            }
        ];
    }

    return [
        {
            itemIdentifiers: []
        },
        {
            itemIdentifiers: [MEASUREGROUP]
        }
    ];
}

// Heatmap
export function getHeatmapDimensionsFromMdObj(
    mdObject: VisualizationObject.IVisualizationObjectContent
): AFM.IDimension[] {
    const buckets: VisualizationObject.IBucket[] = mdObject.buckets;
    return getHeatmapDimensionsFromBuckets(buckets);
}

export function getHeatmapDimensionsFromBuckets(buckets: VisualizationObject.IBucket[]): AFM.IDimension[] {
    const view: VisualizationObject.IBucket = buckets
        .find(bucket => bucket.localIdentifier === VIEW);

    const stack: VisualizationObject.IBucket = buckets
        .find(bucket => bucket.localIdentifier === STACK);

    const hasNoStacks = !stack || !stack.items || stack.items.length === 0;

    if (hasNoStacks) {
        return [
            {
                itemIdentifiers: (view && view.items || [])
                    .map(getLocalIdentifierFromAttribute)
            },
            {
                itemIdentifiers: [MEASUREGROUP]
            }
        ];
    }

    return [
        {
            itemIdentifiers: (view && view.items || [])
                .map(getLocalIdentifierFromAttribute)
        },
        {
            itemIdentifiers: (stack && stack.items || [])
                .map(getLocalIdentifierFromAttribute).concat([MEASUREGROUP])
        }
    ];
}

function getBubbleDimensions(mdObject: VisualizationObject.IVisualizationObjectContent): AFM.IDimension[] {
    const view: VisualizationObject.IBucket = mdObject.buckets
        .find(bucket => bucket.localIdentifier === VIEW);
    const stack: VisualizationObject.IBucket = mdObject.buckets
        .find(bucket => bucket.localIdentifier === STACK);
    const hasNoStacks = !stack || !stack.items || stack.items.length === 0;
    if (hasNoStacks) {
        return [
            {
                itemIdentifiers: (view && view.items || [])
                    .map(getLocalIdentifierFromAttribute)
            },
            {
                itemIdentifiers: [MEASUREGROUP]
            }
        ];
    }

    return [
        {
            itemIdentifiers: (view && view.items || [])
                .map(getLocalIdentifierFromAttribute)
                .concat((stack && stack.items || [])
                    .map(getLocalIdentifierFromAttribute))
        },
        {
            itemIdentifiers: [MEASUREGROUP]
        }
    ];
}

/**
 * generateDimensions
 * is a function that generates dimensions based on buckets and visualization objects.
 * WARNING: It duplicates logic from pluggable visualizations.
 *          Remove once react components support pluggable visualizations.
 * @param mdObject:VisualizationObject.IVisualizationObjectContent - metadata object with buckets
 * @param type:VisType - visualization type string
 * @internal
 */
export function generateDimensions(
    mdObject: VisualizationObject.IVisualizationObjectContent,
    type: VisType
): AFM.IDimension[] {
    switch (type) {
        case VisualizationTypes.PIVOT_TABLE: {
            return getPivotTableDimensions(mdObject.buckets);
        }
        case VisualizationTypes.TABLE: {
            return getTableDimensions(mdObject.buckets);
        }
        case VisualizationTypes.PIE:
        case VisualizationTypes.DONUT:
        case VisualizationTypes.FUNNEL: {
            return getPieOrDonutDimensions(mdObject);
        }
        case VisualizationTypes.TREEMAP: {
            return getTreemapDimensionsFromMdObj(mdObject);
        }

        case VisualizationTypes.LINE: {
            return getLineDimensions(mdObject);
        }
        case VisualizationTypes.BAR:
        case VisualizationTypes.AREA:
        case VisualizationTypes.COMBO:
        case VisualizationTypes.COLUMN: {
            return getBarDimensions(mdObject);
        }
        case VisualizationTypes.HEADLINE: {
            return getHeadlinesDimensions();
        }
        case VisualizationTypes.SCATTER: {
            return getScatterDimensions(mdObject);
        }
        case VisualizationTypes.HEATMAP: {
            return getHeatmapDimensionsFromMdObj(mdObject);
        }
        case VisualizationTypes.BUBBLE: {
            return getBubbleDimensions(mdObject);
        }
    }
    return [];
}

export function generateStackedDimensions(buckets: VisualizationObject.IBucket[]): AFM.IDimension[] {
    const viewBucket = buckets.find(bucket => bucket.localIdentifier === ATTRIBUTE);
    const stackBucket = buckets.find(bucket => bucket.localIdentifier === STACK);

    const viewByAttributes = viewBucket && viewBucket.items as VisualizationObject.IVisualizationAttribute[];
    const stackByAttribute = stackBucket && stackBucket.items[0] as VisualizationObject.IVisualizationAttribute;

    const stackByAttributeLocalIdentifier = stackByAttribute ?
        stackByAttribute.visualizationAttribute.localIdentifier : undefined;

    const viewByAttributeLocalIdentifiers = viewByAttributes && viewByAttributes.map(getLocalIdentifierFromAttribute);

    return [
        {
            itemIdentifiers: stackByAttributeLocalIdentifier ? [stackByAttributeLocalIdentifier] : []
        },
        {
            itemIdentifiers: viewByAttributeLocalIdentifiers ?
                [...viewByAttributeLocalIdentifiers, MEASUREGROUP] : [MEASUREGROUP]
        }
    ];
}

// for LineChart, AreaChart, BarChart, ColumnChart
export function generateDefaultDimensions(afm: AFM.IAfm): AFM.IDimension[] {
    return [
        {
            itemIdentifiers: [MEASUREGROUP]
        },
        {
            itemIdentifiers: (afm.attributes || []).map(a => a.localIdentifier)
        }
    ];
}

export function isStackedChart(buckets: VisualizationObject.IBucket[], stackedBuckedName: string = STACK) {
    return buckets.some(bucket => bucket.localIdentifier === stackedBuckedName && bucket.items.length > 0);
}

// for ScatterPlot and BubbleChart
export function generateDefaultDimensionsForPointsCharts(afm: AFM.IAfm): AFM.IDimension[] {
    return [
        {
            itemIdentifiers: (afm.attributes || []).map(a => a.localIdentifier)
        },
        {
            itemIdentifiers: [MEASUREGROUP]
        }
    ];
}

// for PieChart, DonutChart
export const generateDefaultDimensionsForRoundChart = (afm: AFM.IAfm): AFM.IDimension[] => {
    if ((afm.attributes || []).length === 0) {
        return [
            {
                itemIdentifiers: []
            },
            {
                itemIdentifiers: [MEASUREGROUP]
            }
        ];
    }

    return [
        {
            itemIdentifiers: [MEASUREGROUP]
        },
        {
            itemIdentifiers: (afm.attributes || []).map(a => a.localIdentifier)
        }
    ];
};

// Treemap
export function getTreemapDimensionsFromMdObj(
    mdObject: VisualizationObject.IVisualizationObjectContent
): AFM.IDimension[] {
    const buckets: VisualizationObject.IBucket[] = mdObject.buckets;
    return getTreemapDimensionsFromBuckets(buckets);
}

export function getTreemapDimensionsFromBuckets(buckets: VisualizationObject.IBucket[]): AFM.IDimension[] {
    const afm: AFM.IAfm = convertBucketsToAFM(buckets);
    return getTreemapDimensionsFromAFM(afm);
}

export function getTreemapDimensionsFromAFM(afm: AFM.IAfm): AFM.IDimension[] {
    const attributes = (afm.attributes || []);
    if (attributes.length === 1) {
        return [
            {
                itemIdentifiers: [MEASUREGROUP]
            },
            {
                itemIdentifiers: attributes.map(a => a.localIdentifier)
            }
        ];
    }

    return [
        {
            itemIdentifiers: attributes.map(a => a.localIdentifier)
        },
        {
            itemIdentifiers: [MEASUREGROUP]
        }
    ];
}

export function getGeneralDimensionsFromAFM(afm: AFM.IAfm): AFM.IDimension[] {
    const attributes = afm.attributes || [];
    const measures = afm.measures || [];
    const dimensions = [];
    if (attributes.length > 0) {
        dimensions.push({
            itemIdentifiers: attributes.map(
                (attribute: AFM.IAttribute) => attribute.localIdentifier
            )
        });
    }
    if (measures.length > 0) {
        dimensions.push({
            itemIdentifiers: [MEASUREGROUP]
        });
    }
    return dimensions;
}
