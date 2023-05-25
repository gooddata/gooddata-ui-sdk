// (C) 2019-2023 GoodData Corporation
import React from "react";
import compact from "lodash/compact.js";
import omit from "lodash/omit.js";
import { CoreGeoChart } from "./core/CoreGeoChart.js";

import {
    BucketNames,
    IntlTranslationsProvider,
    IntlWrapper,
    ITranslationsComponentProps,
    withContexts,
    useResolveValuesWithPlaceholders,
} from "@gooddata/sdk-ui";
import {
    GeoPushpinChartPropsUnion,
    isGeoPushpinChartProps,
    IGeoPushpinChartProps,
    IGeoPushpinChartLatitudeLongitudeProps,
} from "./GeoChart.js";
import {
    bucketsAttributes,
    bucketsMeasures,
    disableComputeRatio,
    IAttribute,
    IAttributeOrMeasure,
    IBucket,
    IDimension,
    IExecutionDefinition,
    INullableFilter,
    ISortItem,
    MeasureGroupIdentifier,
    newBucket,
    newDimension,
} from "@gooddata/sdk-model";
import { withTheme } from "@gooddata/sdk-ui-theme-provider";

const getBuckets = (props: GeoPushpinChartPropsUnion): IBucket[] => {
    const { color, segmentBy, size, config } = props;
    const buckets: IBucket[] = [
        newBucket(BucketNames.SIZE, ...(size ? [disableComputeRatio(size as IAttributeOrMeasure)] : [])),
        newBucket(BucketNames.COLOR, ...(color ? [disableComputeRatio(color as IAttributeOrMeasure)] : [])),
    ];
    if (isGeoPushpinChartProps(props)) {
        const { location } = props;
        buckets.push(newBucket(BucketNames.LOCATION, ...(location ? [location as IAttribute] : [])));
    } else {
        const { latitude, longitude } = props;
        buckets.push(newBucket(BucketNames.LATITUDE, ...(latitude ? [latitude as IAttribute] : [])));
        buckets.push(newBucket(BucketNames.LONGITUDE, ...(longitude ? [longitude as IAttribute] : [])));
    }
    buckets.push(newBucket(BucketNames.SEGMENT, ...(segmentBy ? [segmentBy as IAttribute] : [])));

    const tooltipText = config?.[BucketNames.TOOLTIP_TEXT];
    if (tooltipText) {
        buckets.push(newBucket(BucketNames.TOOLTIP_TEXT, tooltipText));
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

    return compact([measures.length > 0 && newDimension([MeasureGroupIdentifier]), newDimension(attributes)]);
}

/**
 * Specifies props that are on geo chart props but not on core chart props - these must not be passed
 * down to core chart.
 */
const getNonCoreProps = (
    props: GeoPushpinChartPropsUnion,
): Array<keyof IGeoPushpinChartProps | keyof IGeoPushpinChartLatitudeLongitudeProps> => {
    const base: Array<keyof GeoPushpinChartPropsUnion> = [
        "backend",
        "workspace",
        "segmentBy",
        "filters",
        "sortBy",
        "color",
        "size",
    ];

    if (isGeoPushpinChartProps(props)) {
        return [...base, "location"];
    }
    return [...base, "longitude", "latitude"];
};

function GeoPushpinChartInner(props: GeoPushpinChartPropsUnion): JSX.Element {
    const { backend, workspace, sortBy, filters, exportTitle, execConfig = {} } = props;

    const buckets = getBuckets(props);
    const newProps = omit(props, getNonCoreProps(props));

    const execution = backend!
        .withTelemetry("GeoPushpinChart", props)
        .workspace(workspace!)
        .execution()
        .forBuckets(buckets, filters as INullableFilter[])
        .withSorting(...((sortBy as ISortItem[]) || []))
        .withDimensions(getGeoChartDimensions)
        .withExecConfig(execConfig);

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

const WrappedGeoPushpinChart = withTheme(withContexts(GeoPushpinChartInner));

const GeoPushpinChartLocation = (props: IGeoPushpinChartProps) => {
    const [location, size, color, segmentBy, filters, sortBy] = useResolveValuesWithPlaceholders(
        [props.location, props.size, props.color, props.segmentBy, props.filters, props.sortBy],
        props.placeholdersResolutionContext,
    );
    return <WrappedGeoPushpinChart {...props} {...{ location, size, color, segmentBy, filters, sortBy }} />;
};

const GeoPushpinChartLatitudeLongitude = (props: IGeoPushpinChartLatitudeLongitudeProps) => {
    const [longitude, latitude, size, color, segmentBy, filters, sortBy] = useResolveValuesWithPlaceholders(
        [
            props.longitude,
            props.latitude,
            props.size,
            props.color,
            props.segmentBy,
            props.filters,
            props.sortBy,
        ],
        props.placeholdersResolutionContext,
    );
    return (
        <WrappedGeoPushpinChart
            {...props}
            {...{ longitude, latitude, size, color, segmentBy, filters, sortBy }}
        />
    );
};

/**
 * @public
 */
export const GeoPushpinChart = (props: IGeoPushpinChartProps | IGeoPushpinChartLatitudeLongitudeProps) => {
    if (isGeoPushpinChartProps(props)) {
        return <GeoPushpinChartLocation {...props} />;
    }
    return <GeoPushpinChartLatitudeLongitude {...props} />;
};
