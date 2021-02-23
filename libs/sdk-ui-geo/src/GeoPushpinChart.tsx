// (C) 2019-2020 GoodData Corporation
import React from "react";
import omit from "lodash/omit";
import get from "lodash/get";
import { CoreGeoChart } from "./core/CoreGeoChart";

import {
    BucketNames,
    IntlTranslationsProvider,
    IntlWrapper,
    ITranslationsComponentProps,
    withContexts,
} from "@gooddata/sdk-ui";
import { IGeoPushpinChartProps } from "./GeoChart";
import {
    attributeLocalId,
    bucketsAttributes,
    bucketsMeasures,
    disableComputeRatio,
    IBucket,
    IDimension,
    IExecutionDefinition,
    MeasureGroupIdentifier,
    newDimension,
} from "@gooddata/sdk-model";

const getBuckets = (props: IGeoPushpinChartProps): IBucket[] => {
    const { color, location, segmentBy, size, config } = props;
    const buckets: IBucket[] = [
        {
            localIdentifier: BucketNames.SIZE,
            items: size ? [disableComputeRatio(size)] : [],
        },
        {
            localIdentifier: BucketNames.COLOR,
            items: color ? [disableComputeRatio(color)] : [],
        },
        {
            localIdentifier: BucketNames.LOCATION,
            items: location ? [location] : [],
        },
        {
            localIdentifier: BucketNames.SEGMENT,
            items: segmentBy ? [segmentBy] : [],
        },
    ];
    const tooltipText = get(config, BucketNames.TOOLTIP_TEXT);
    if (tooltipText) {
        buckets.push({
            localIdentifier: BucketNames.TOOLTIP_TEXT,
            items: [tooltipText],
        });
    }
    return buckets;
};

/**
 * @internal
 */
export function getGeoChartDimensions(def: IExecutionDefinition): IDimension[] {
    const buckets = def.buckets;
    const measures = bucketsMeasures(buckets);
    const attributes = bucketsAttributes(buckets);
    const chartDimensions: IDimension[] = [];

    if (measures.length > 0) {
        chartDimensions.push(newDimension([MeasureGroupIdentifier]));
    }
    chartDimensions.push(newDimension(attributes.map(attributeLocalId)));

    return chartDimensions;
}

/**
 * Specifies props that are on geo chart props but not on core chart props - these must not be passed
 * down to core chart.
 */
const NON_CORE_PROPS: Array<keyof IGeoPushpinChartProps> = [
    "backend",
    "workspace",
    "segmentBy",
    "filters",
    "sortBy",
    "location",
    "color",
    "size",
];

function GeoPushpinChartInner(props: IGeoPushpinChartProps): JSX.Element {
    const { backend, workspace, sortBy, filters, exportTitle } = props;

    const buckets: IBucket[] = getBuckets(props);
    const newProps = omit(props, NON_CORE_PROPS);

    const execution = backend!
        .withTelemetry("GeoPushpinChart", props)
        .workspace(workspace!)
        .execution()
        .forBuckets(buckets, filters)
        .withSorting(...(sortBy || []))
        .withDimensions(getGeoChartDimensions);

    return (
        <IntlWrapper locale={props.locale}>
            <IntlTranslationsProvider>
                {(translationProps: ITranslationsComponentProps) => {
                    return (
                        <CoreGeoChart
                            intl={translationProps.intl}
                            execution={execution}
                            exportTitle={exportTitle || "GeoPushpinChart"}
                            {...newProps}
                        />
                    );
                }}
            </IntlTranslationsProvider>
        </IntlWrapper>
    );
}

/**
 * @public
 */
export const GeoPushpinChart = withContexts(GeoPushpinChartInner);
