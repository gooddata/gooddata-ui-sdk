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
    MEASURES
 } from '../constants/bucketNames';

function getDimensionTotals(bucket: VisualizationObject.IBucket): AFM.ITotalItem[] {
    const bucketTotals = get(bucket, 'totals', []);
    return bucketTotals.map((total: VisualizationObject.IVisualizationTotal): AFM.ITotalItem => {
        return {
            measureIdentifier: total.measureIdentifier,
            type: total.type,
            attributeIdentifier: total.attributeIdentifier
        };
    });
}

export function getTableDimensions(buckets: VisualizationObject.IBucket[]): AFM.IDimension[] {
    const attributes: VisualizationObject.IBucket = buckets
        .find(bucket => bucket.localIdentifier === ATTRIBUTE || bucket.localIdentifier === 'attributes');

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

function getPieOrTreemapDimensions(mdObject: VisualizationObject.IVisualizationObjectContent): AFM.IDimension[] {
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

function getHeadlinesDimensions(): AFM.IDimension[] {
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
        case VisualizationTypes.TABLE: {
            return getTableDimensions(mdObject.buckets);
        }
        case VisualizationTypes.PIE:
        case VisualizationTypes.DONUT:
        case VisualizationTypes.TREEMAP: {
            return getPieOrTreemapDimensions(mdObject);
        }
        case VisualizationTypes.DUAL:
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
    }
    return [];
}

export function generateStackedDimensions(buckets: VisualizationObject.IBucket[]): AFM.IDimension[] {
    const stackByAttribute = buckets.find(bucket => bucket.localIdentifier === 'stacks').items[0] as
        VisualizationObject.IVisualizationAttribute;

    const viewByAttribute = buckets.find(bucket => bucket.localIdentifier === 'attributes').items[0] as
        VisualizationObject.IVisualizationAttribute;

    const stackByAttributeLocalIdentifier = stackByAttribute.visualizationAttribute.localIdentifier;
    const viewByAttributeLocalIdentifier = viewByAttribute.visualizationAttribute.localIdentifier;

    return [
        {
            itemIdentifiers: [stackByAttributeLocalIdentifier]
        },
        {
            itemIdentifiers: [viewByAttributeLocalIdentifier, 'measureGroup']
        }
    ];
}
