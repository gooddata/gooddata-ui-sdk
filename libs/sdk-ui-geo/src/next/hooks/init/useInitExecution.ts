// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { compact } from "lodash-es";

import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import {
    IDimension,
    IExecutionDefinition,
    MeasureGroupIdentifier,
    bucketsAttributes,
    bucketsMeasures,
    newBucket,
    newDimension,
} from "@gooddata/sdk-model";
import { BucketNames, useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { IGeoAreaChartProps } from "../../types/areaPublic.js";
import { IGeoPushpinChartNextResolvedProps } from "../../types/internal.js";

type GeoExecutionProps = IGeoPushpinChartNextResolvedProps | IGeoAreaChartProps;

function isAreaProps(props: GeoExecutionProps): props is IGeoAreaChartProps {
    return (props as IGeoAreaChartProps).area !== undefined;
}

/**
 * Creates dimensions for geo chart execution.
 * @internal
 */
export function getGeoChartDimensions(def: IExecutionDefinition): IDimension[] {
    const buckets = def.buckets;
    const measures = bucketsMeasures(buckets);
    const attributes = bucketsAttributes(buckets);

    return compact([measures.length > 0 && newDimension([MeasureGroupIdentifier]), newDimension(attributes)]);
}

/**
 * Creates an execution for GeoPushpinChartNext with proper bucket configuration.
 *
 * @remarks
 * This hook creates a prepared execution with the appropriate buckets based on whether
 * the chart is using location mode (single attribute) or lat/lng mode (two attributes).
 *
 * Buckets created:
 * - AREA: Contains area attribute (or LOCATION/LATITUDE/LONGITUDE for pushpin)
 * - SIZE: Contains size measure/attribute
 * - COLOR: Contains color measure/attribute
 * - SEGMENT: Contains segmentBy attribute
 * - TOOLTIP_TEXT: Contains tooltipText attribute
 *
 * @param config - Execution configuration
 * @returns Prepared execution ready to be executed
 *
 * @alpha
 */
export function useInitExecution(props: GeoExecutionProps): IPreparedExecution {
    const { segmentBy, color, config, filters = [], sortBy = [], execConfig } = props;

    const backend = useBackendStrict(props.backend, "useInitExecution");
    const workspace = useWorkspaceStrict(props.workspace, "useInitExecution");

    const { tooltipText } = config ?? {};
    const area = isAreaProps(props);
    const areaArea = area ? props.area : undefined;
    const pushpinLocation = area ? undefined : (props as IGeoPushpinChartNextResolvedProps).location;
    const pushpinLatitude = area ? undefined : (props as IGeoPushpinChartNextResolvedProps).latitude;
    const pushpinLongitude = area ? undefined : (props as IGeoPushpinChartNextResolvedProps).longitude;
    const pushpinSize = area ? undefined : (props as IGeoPushpinChartNextResolvedProps).size;

    return useMemo(() => {
        const buckets = [];

        if (area) {
            if (areaArea) {
                buckets.push(newBucket(BucketNames.AREA, areaArea));
            }
        } else {
            if (pushpinLatitude && pushpinLongitude) {
                buckets.push(newBucket(BucketNames.LATITUDE, pushpinLatitude));
                buckets.push(newBucket(BucketNames.LONGITUDE, pushpinLongitude));
            } else if (pushpinLocation) {
                buckets.push(newBucket(BucketNames.LOCATION, pushpinLocation));
            }

            if (pushpinSize) {
                buckets.push(newBucket(BucketNames.SIZE, pushpinSize));
            }
        }

        // Color bucket
        if (color) {
            buckets.push(newBucket(BucketNames.COLOR, color));
        }

        // Segment bucket
        if (segmentBy) {
            buckets.push(newBucket(BucketNames.SEGMENT, segmentBy));
        }

        // Tooltip text bucket
        if (tooltipText) {
            buckets.push(newBucket(BucketNames.TOOLTIP_TEXT, tooltipText));
        }

        let execution = backend
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, filters)
            .withSorting(...sortBy)
            .withDimensions(getGeoChartDimensions);

        if (execConfig) {
            execution = execution.withExecConfig(execConfig);
        }

        return execution;
    }, [
        backend,
        workspace,
        area,
        areaArea,
        pushpinLocation,
        pushpinLatitude,
        pushpinLongitude,
        segmentBy,
        pushpinSize,
        color,
        tooltipText,
        filters,
        sortBy,
        execConfig,
    ]);
}
